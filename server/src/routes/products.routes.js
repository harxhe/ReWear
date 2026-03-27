import { Router } from 'express';

import { query } from '../db/query.js';
import { asyncHandler } from '../lib/async-handler.js';
import { requireAuth } from '../lib/auth.js';
import { HttpError } from '../lib/http-error.js';
import { calculateSustainabilityMetrics } from '../services/sustainability.service.js';

const productsRouter = Router();

function mapProductRow(row) {
  return {
    category: row.category,
    co2DivertedKg: Number(row.co2_diverted_kg),
    conditionLabel: row.condition_label,
    createdAt: row.created_at,
    description: row.description,
    ecoScoreGrade: row.eco_score_grade,
    ecoScoreNumeric: Number(row.eco_score_numeric),
    id: row.id,
    imageUrl: row.image_url,
    material: {
      category: row.material_category,
      id: row.material_id,
      name: row.material_name,
    },
    price: Number(row.price),
    seller: {
      id: row.seller_id,
      name: row.seller_name,
    },
    status: row.status,
    title: row.title,
    waterSavedLiters: Number(row.water_saved_liters),
  };
}

productsRouter.post('/preview-score', asyncHandler(async (request, response) => {
  const { conditionLabel, materialId } = request.body;

  if (!materialId || !conditionLabel) {
    throw new HttpError(400, 'Material and condition are required to preview the eco score.');
  }

  const result = await query(
    `
      SELECT id, name, water_cost_liters, carbon_cost_kg, base_value
      FROM materials_registry
      WHERE id = $1
    `,
    [materialId],
  );

  if (result.rowCount === 0) {
    throw new HttpError(404, 'Selected material was not found.');
  }

  const material = result.rows[0];
  const metrics = calculateSustainabilityMetrics({
    materialBaseValue: Number(material.base_value),
    materialCarbonCostKg: Number(material.carbon_cost_kg),
    materialName: material.name,
    materialWaterCostLiters: Number(material.water_cost_liters),
    conditionLabel,
  });

  response.json({
    preview: {
      materialId: material.id,
      ...metrics,
    },
  });
}));

productsRouter.post('/', requireAuth, asyncHandler(async (request, response) => {
  const {
    category,
    conditionLabel,
    description,
    imageUrl,
    materialId,
    price,
    title,
  } = request.body;

  if (!title || !category || !conditionLabel || !materialId || price === undefined) {
    throw new HttpError(400, 'Title, category, material, condition, and price are required.');
  }

  const materialResult = await query(
    `
      SELECT id, name, category, water_cost_liters, carbon_cost_kg, base_value
      FROM materials_registry
      WHERE id = $1
    `,
    [materialId],
  );

  if (materialResult.rowCount === 0) {
    throw new HttpError(404, 'Selected material was not found.');
  }

  const material = materialResult.rows[0];
  const metrics = calculateSustainabilityMetrics({
    materialBaseValue: Number(material.base_value),
    materialCarbonCostKg: Number(material.carbon_cost_kg),
    materialName: material.name,
    materialWaterCostLiters: Number(material.water_cost_liters),
    conditionLabel,
  });

  const insertResult = await query(
    `
      INSERT INTO products (
        seller_id,
        material_id,
        title,
        description,
        category,
        price,
        condition_label,
        condition_weight,
        eco_score_numeric,
        eco_score_grade,
        water_saved_liters,
        co2_diverted_kg,
        image_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id
    `,
    [
      request.auth.userId,
      material.id,
      title,
      description || null,
      category,
      price,
      conditionLabel,
      metrics.conditionWeight,
      metrics.ecoScoreNumeric,
      metrics.ecoScoreGrade,
      metrics.waterSavedLiters,
      metrics.co2DivertedKg,
      imageUrl || null,
    ],
  );

  const listingResult = await query(
    `
      SELECT
        p.id,
        p.title,
        p.description,
        p.category,
        p.price,
        p.condition_label,
        p.eco_score_numeric,
        p.eco_score_grade,
        p.water_saved_liters,
        p.co2_diverted_kg,
        p.image_url,
        p.status,
        p.created_at,
        u.id AS seller_id,
        u.full_name AS seller_name,
        mr.id AS material_id,
        mr.name AS material_name,
        mr.category AS material_category
      FROM products p
      INNER JOIN users u ON u.id = p.seller_id
      INNER JOIN materials_registry mr ON mr.id = p.material_id
      WHERE p.id = $1
    `,
    [insertResult.rows[0].id],
  );

  response.status(201).json({
    product: mapProductRow(listingResult.rows[0]),
  });
}));

productsRouter.get('/', asyncHandler(async (request, response) => {
  const { category, ecoScore, material, search, status = 'available' } = request.query;

  const filters = [];
  const values = [];

  if (status) {
    values.push(status);
    filters.push(`p.status = $${values.length}`);
  }

  if (category) {
    values.push(category);
    filters.push(`p.category = $${values.length}`);
  }

  if (ecoScore) {
    values.push(String(ecoScore).toUpperCase());
    filters.push(`p.eco_score_grade = $${values.length}`);
  }

  if (material) {
    values.push(material);
    filters.push(`mr.name = $${values.length}`);
  }

  if (search) {
    values.push(`%${search}%`);
    filters.push(`(p.title ILIKE $${values.length} OR p.description ILIKE $${values.length})`);
  }

  const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

  const result = await query(
    `
      SELECT
        p.id,
        p.title,
        p.description,
        p.category,
        p.price,
        p.condition_label,
        p.eco_score_numeric,
        p.eco_score_grade,
        p.water_saved_liters,
        p.co2_diverted_kg,
        p.image_url,
        p.status,
        p.created_at,
        u.id AS seller_id,
        u.full_name AS seller_name,
        mr.id AS material_id,
        mr.name AS material_name,
        mr.category AS material_category
      FROM products p
      INNER JOIN users u ON u.id = p.seller_id
      INNER JOIN materials_registry mr ON mr.id = p.material_id
      ${whereClause}
      ORDER BY p.created_at DESC
    `,
    values,
  );

  response.json({
    products: result.rows.map(mapProductRow),
  });
}));

productsRouter.get('/:productId', asyncHandler(async (request, response) => {
  const result = await query(
    `
      SELECT
        p.id,
        p.title,
        p.description,
        p.category,
        p.price,
        p.condition_label,
        p.eco_score_numeric,
        p.eco_score_grade,
        p.water_saved_liters,
        p.co2_diverted_kg,
        p.image_url,
        p.status,
        p.created_at,
        u.id AS seller_id,
        u.full_name AS seller_name,
        mr.id AS material_id,
        mr.name AS material_name,
        mr.category AS material_category
      FROM products p
      INNER JOIN users u ON u.id = p.seller_id
      INNER JOIN materials_registry mr ON mr.id = p.material_id
      WHERE p.id = $1
    `,
    [request.params.productId],
  );

  if (result.rowCount === 0) {
    throw new HttpError(404, 'Product was not found.');
  }

  response.json({
    product: mapProductRow(result.rows[0]),
  });
}));

export { productsRouter };
