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

async function getMaterialById(materialId) {
  const result = await query(
    `
      SELECT id, name, category, water_cost_liters, carbon_cost_kg, base_value
      FROM materials_registry
      WHERE id = $1
    `,
    [materialId],
  );

  if (result.rowCount === 0) {
    throw new HttpError(404, 'Selected material was not found.');
  }

  return result.rows[0];
}

async function getProductById(productId) {
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
    [productId],
  );

  if (result.rowCount === 0) {
    throw new HttpError(404, 'Product was not found.');
  }

  return result.rows[0];
}

function calculateMetricsForMaterial(material, conditionLabel) {
  return calculateSustainabilityMetrics({
    materialBaseValue: Number(material.base_value),
    materialCarbonCostKg: Number(material.carbon_cost_kg),
    materialName: material.name,
    materialWaterCostLiters: Number(material.water_cost_liters),
    conditionLabel,
  });
}

productsRouter.post('/preview-score', asyncHandler(async (request, response) => {
  const { conditionLabel, materialId } = request.body;

  if (!materialId || !conditionLabel) {
    throw new HttpError(400, 'Material and condition are required to preview the eco score.');
  }

  const material = await getMaterialById(materialId);
  const metrics = calculateMetricsForMaterial(material, conditionLabel);

  response.json({
    preview: {
      materialId: material.id,
      ...metrics,
    },
  });
}));

productsRouter.post('/', requireAuth, asyncHandler(async (request, response) => {
  const { category, conditionLabel, description, imageUrl, materialId, price, title } = request.body;

  if (!title || !category || !conditionLabel || !materialId || price === undefined) {
    throw new HttpError(400, 'Title, category, material, condition, and price are required.');
  }

  const material = await getMaterialById(materialId);
  const metrics = calculateMetricsForMaterial(material, conditionLabel);

  const insertResult = await query(
    `
      INSERT INTO products (
        seller_id, material_id, title, description, category, price, condition_label,
        condition_weight, eco_score_numeric, eco_score_grade, water_saved_liters,
        co2_diverted_kg, image_url
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

  const product = await getProductById(insertResult.rows[0].id);

  response.status(201).json({
    product: mapProductRow(product),
  });
}));

productsRouter.put('/:productId', requireAuth, asyncHandler(async (request, response) => {
  const { category, conditionLabel, description, imageUrl, materialId, price, title } = request.body;

  if (!title || !category || !conditionLabel || !materialId || price === undefined) {
    throw new HttpError(400, 'Title, category, material, condition, and price are required.');
  }

  const existing = await query('SELECT seller_id, status FROM products WHERE id = $1', [request.params.productId]);

  if (existing.rowCount === 0) {
    throw new HttpError(404, 'Product was not found.');
  }

  const existingProduct = existing.rows[0];

  if (Number(existingProduct.seller_id) !== request.auth.userId) {
    throw new HttpError(403, 'You can only edit your own listings.');
  }

  if (existingProduct.status === 'sold') {
    throw new HttpError(409, 'Sold listings cannot be edited.');
  }

  const material = await getMaterialById(materialId);
  const metrics = calculateMetricsForMaterial(material, conditionLabel);

  await query(
    `
      UPDATE products
      SET
        material_id = $1,
        title = $2,
        description = $3,
        category = $4,
        price = $5,
        condition_label = $6,
        condition_weight = $7,
        eco_score_numeric = $8,
        eco_score_grade = $9,
        water_saved_liters = $10,
        co2_diverted_kg = $11,
        image_url = $12,
        updated_at = NOW()
      WHERE id = $13
    `,
    [
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
      request.params.productId,
    ],
  );

  const product = await getProductById(request.params.productId);

  response.json({
    product: mapProductRow(product),
  });
}));

productsRouter.delete('/:productId', requireAuth, asyncHandler(async (request, response) => {
  const result = await query('SELECT seller_id, status FROM products WHERE id = $1', [request.params.productId]);

  if (result.rowCount === 0) {
    throw new HttpError(404, 'Product was not found.');
  }

  const product = result.rows[0];

  if (Number(product.seller_id) !== request.auth.userId) {
    throw new HttpError(403, 'You can only delete your own listings.');
  }

  if (product.status === 'sold') {
    throw new HttpError(409, 'Sold listings cannot be deleted.');
  }

  await query('DELETE FROM products WHERE id = $1', [request.params.productId]);

  response.json({ success: true });
}));

productsRouter.get('/', asyncHandler(async (request, response) => {
  const { category, ecoScore, material, status = 'available' } = request.query;
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
  const product = await getProductById(request.params.productId);

  response.json({
    product: mapProductRow(product),
  });
}));

export { productsRouter };
