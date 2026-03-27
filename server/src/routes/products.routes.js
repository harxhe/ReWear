import { Router } from 'express';

import { query } from '../db/query.js';
import { asyncHandler } from '../lib/async-handler.js';
import { HttpError } from '../lib/http-error.js';
import { calculateSustainabilityMetrics } from '../services/sustainability.service.js';

const productsRouter = Router();

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

export { productsRouter };
