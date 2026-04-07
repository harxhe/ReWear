import { Router } from 'express';

import { asyncHandler } from '../lib/async-handler.js';
import { Material } from '../models/material.model.js';
import { mapMaterial } from '../utils/mappers.js';

const materialsRouter = Router();

materialsRouter.get('/', asyncHandler(async (_request, response) => {
  const materials = await Material.find().sort({ baseValue: -1, name: 1 });

  response.json({
    materials: materials.map(mapMaterial),
  });
}));

export { materialsRouter };
