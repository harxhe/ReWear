import { Router } from 'express';

import { asyncHandler } from '../lib/async-handler.js';
import { query } from '../db/query.js';

const materialsRouter = Router();

materialsRouter.get('/', asyncHandler(async (_request, response) => {
  const result = await query(
    `
      SELECT id, name, category, description, water_cost_liters, carbon_cost_kg, base_value
      FROM materials_registry
      ORDER BY base_value DESC, name ASC
    `,
  );

  response.json({
    materials: result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      description: row.description,
      waterCostLiters: Number(row.water_cost_liters),
      carbonCostKg: Number(row.carbon_cost_kg),
      baseValue: Number(row.base_value),
    })),
  });
}));

export { materialsRouter };
