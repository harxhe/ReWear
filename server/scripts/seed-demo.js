import bcrypt from 'bcryptjs';

import { pool } from '../src/db/pool.js';
import { calculateSustainabilityMetrics } from '../src/services/sustainability.service.js';

const demoPassword = 'demo12345';

const demoUsers = [
  {
    email: 'seller@rewear.demo',
    fullName: 'Mira Seller',
  },
  {
    email: 'buyer@rewear.demo',
    fullName: 'Noah Buyer',
  },
];

const demoProducts = [
  {
    category: 'Tops',
    conditionLabel: 'Gently Used',
    description: 'Soft cotton overshirt with a relaxed fit and clean stitching.',
    materialName: 'Cotton',
    price: 32,
    title: 'Used Cotton Work Shirt',
  },
  {
    category: 'Outerwear',
    conditionLabel: 'Worn',
    description: 'Broken-in hemp chore jacket with visible character and lots of life left.',
    materialName: 'Hemp',
    price: 58,
    title: 'Worn Hemp Chore Jacket',
  },
  {
    category: 'Denim',
    conditionLabel: 'Like New',
    description: 'Structured recycled denim jeans with a tapered vintage cut.',
    materialName: 'Recycled Denim',
    price: 46,
    title: 'Recycled Denim Taper Jeans',
  },
];

const client = await pool.connect();

try {
  await client.query('BEGIN');

  const passwordHash = await bcrypt.hash(demoPassword, 10);
  const userIds = new Map();

  for (const user of demoUsers) {
    const result = await client.query(
      `
        INSERT INTO users (full_name, email, password_hash)
        VALUES ($1, $2, $3)
        ON CONFLICT (email) DO UPDATE
        SET full_name = EXCLUDED.full_name
        RETURNING id, email
      `,
      [user.fullName, user.email, passwordHash],
    );

    userIds.set(result.rows[0].email, result.rows[0].id);
  }

  const materialsResult = await client.query(
    `
      SELECT id, name, category, water_cost_liters, carbon_cost_kg, base_value
      FROM materials_registry
    `,
  );

  const materials = new Map(materialsResult.rows.map((row) => [row.name, row]));

  for (const product of demoProducts) {
    const material = materials.get(product.materialName);

    if (!material) {
      throw new Error(`Material ${product.materialName} was not found. Run db:seed first.`);
    }

    const metrics = calculateSustainabilityMetrics({
      conditionLabel: product.conditionLabel,
      materialBaseValue: Number(material.base_value),
      materialCarbonCostKg: Number(material.carbon_cost_kg),
      materialName: material.name,
      materialWaterCostLiters: Number(material.water_cost_liters),
    });

    const existingProduct = await client.query('SELECT id FROM products WHERE title = $1', [product.title]);

    if (existingProduct.rowCount > 0) {
      await client.query(
        `
          UPDATE products
          SET
            seller_id = $2,
            material_id = $3,
            description = $4,
            category = $5,
            price = $6,
            condition_label = $7,
            condition_weight = $8,
            eco_score_numeric = $9,
            eco_score_grade = $10,
            water_saved_liters = $11,
            co2_diverted_kg = $12,
            status = 'available',
            updated_at = NOW()
          WHERE id = $1
        `,
        [
          existingProduct.rows[0].id,
          userIds.get('seller@rewear.demo'),
          material.id,
          product.description,
          product.category,
          product.price,
          product.conditionLabel,
          metrics.conditionWeight,
          metrics.ecoScoreNumeric,
          metrics.ecoScoreGrade,
          metrics.waterSavedLiters,
          metrics.co2DivertedKg,
        ],
      );
      continue;
    }

    await client.query(
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
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'available')
      `,
      [
        userIds.get('seller@rewear.demo'),
        material.id,
        product.title,
        product.description,
        product.category,
        product.price,
        product.conditionLabel,
        metrics.conditionWeight,
        metrics.ecoScoreNumeric,
        metrics.ecoScoreGrade,
        metrics.waterSavedLiters,
        metrics.co2DivertedKg,
      ],
    );
  }

  await client.query('COMMIT');

  console.log('Demo users and products seeded successfully.');
  console.log('Seller login: seller@rewear.demo / demo12345');
  console.log('Buyer login: buyer@rewear.demo / demo12345');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
  await pool.end();
}
