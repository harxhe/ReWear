import mongoose from 'mongoose';
import { Router } from 'express';

import { asyncHandler } from '../lib/async-handler.js';
import { requireAuth } from '../lib/auth.js';
import { HttpError } from '../lib/http-error.js';
import { requireAccountRole } from '../middleware/require-account-role.js';
import { Material } from '../models/material.model.js';
import { Product } from '../models/product.model.js';
import { calculateSustainabilityMetrics } from '../services/sustainability.service.js';
import { mapProduct } from '../utils/mappers.js';

const productsRouter = Router();

async function getMaterialById(materialId) {
  if (!mongoose.isValidObjectId(materialId)) {
    throw new HttpError(404, 'Selected material was not found.');
  }

  const material = await Material.findById(materialId);

  if (!material) {
    throw new HttpError(404, 'Selected material was not found.');
  }

  return material;
}

async function getProductById(productId) {
  if (!mongoose.isValidObjectId(productId)) {
    throw new HttpError(404, 'Product was not found.');
  }

  const product = await Product.findById(productId)
    .populate('sellerId', 'fullName')
    .populate('materialId', 'name category');

  if (!product) {
    throw new HttpError(404, 'Product was not found.');
  }

  return product;
}

function calculateMetricsForMaterial(material, conditionLabel) {
  return calculateSustainabilityMetrics({
    materialBaseValue: Number(material.baseValue),
    materialCarbonCostKg: Number(material.carbonCostKg),
    materialName: material.name,
    materialWaterCostLiters: Number(material.waterCostLiters),
    conditionLabel,
  });
}

productsRouter.post('/preview-score', asyncHandler(async (request, response) => {
  const { conditionLabel, materialId } = request.body || {};

  if (!materialId || !conditionLabel) {
    throw new HttpError(400, 'Material and condition are required to preview the eco score.');
  }

  const material = await getMaterialById(materialId);
  const metrics = calculateMetricsForMaterial(material, conditionLabel);

  response.json({
    preview: {
      materialId: String(material._id),
      ...metrics,
    },
  });
}));

productsRouter.post('/', requireAuth, requireAccountRole(['seller']), asyncHandler(async (request, response) => {
  const { category, conditionLabel, description, imageUrl, materialId, price, title } = request.body || {};

  if (!title || !category || !conditionLabel || !materialId || price === undefined) {
    throw new HttpError(400, 'Title, category, material, condition, and price are required.');
  }

  const material = await getMaterialById(materialId);
  const metrics = calculateMetricsForMaterial(material, conditionLabel);

  const product = await Product.create({
    sellerId: request.auth.userId,
    materialId: material._id,
    materialNameCache: material.name,
    title,
    description: description || '',
    category,
    price,
    conditionLabel,
    conditionWeight: metrics.conditionWeight,
    ecoScoreNumeric: metrics.ecoScoreNumeric,
    ecoScoreGrade: metrics.ecoScoreGrade,
    waterSavedLiters: metrics.waterSavedLiters,
    co2DivertedKg: metrics.co2DivertedKg,
    imageUrl: imageUrl || null,
  });

  response.status(201).json({ product: mapProduct(await getProductById(product._id)) });
}));

productsRouter.put('/:productId', requireAuth, requireAccountRole(['seller']), asyncHandler(async (request, response) => {
  const { category, conditionLabel, description, imageUrl, materialId, price, title } = request.body || {};

  if (!title || !category || !conditionLabel || !materialId || price === undefined) {
    throw new HttpError(400, 'Title, category, material, condition, and price are required.');
  }

  const existingProduct = await Product.findById(request.params.productId);

  if (!existingProduct) {
    throw new HttpError(404, 'Product was not found.');
  }

  if (String(existingProduct.sellerId) !== request.auth.userId) {
    throw new HttpError(403, 'You can only edit your own listings.');
  }

  if (existingProduct.status === 'sold') {
    throw new HttpError(409, 'Sold listings cannot be edited.');
  }

  const material = await getMaterialById(materialId);
  const metrics = calculateMetricsForMaterial(material, conditionLabel);

  existingProduct.materialId = material._id;
  existingProduct.materialNameCache = material.name;
  existingProduct.title = title;
  existingProduct.description = description || '';
  existingProduct.category = category;
  existingProduct.price = price;
  existingProduct.conditionLabel = conditionLabel;
  existingProduct.conditionWeight = metrics.conditionWeight;
  existingProduct.ecoScoreNumeric = metrics.ecoScoreNumeric;
  existingProduct.ecoScoreGrade = metrics.ecoScoreGrade;
  existingProduct.waterSavedLiters = metrics.waterSavedLiters;
  existingProduct.co2DivertedKg = metrics.co2DivertedKg;
  existingProduct.imageUrl = imageUrl || null;
  await existingProduct.save();

  response.json({ product: mapProduct(await getProductById(existingProduct._id)) });
}));

productsRouter.delete('/:productId', requireAuth, requireAccountRole(['seller']), asyncHandler(async (request, response) => {
  const product = await Product.findById(request.params.productId);

  if (!product) {
    throw new HttpError(404, 'Product was not found.');
  }

  if (String(product.sellerId) !== request.auth.userId) {
    throw new HttpError(403, 'You can only delete your own listings.');
  }

  if (product.status === 'sold') {
    throw new HttpError(409, 'Sold listings cannot be deleted.');
  }

  await product.deleteOne();

  response.json({ success: true });
}));

productsRouter.get('/', asyncHandler(async (request, response) => {
  const { category, ecoScore, material, status = 'available' } = request.query;
  const filters = {};

  if (status) {
    filters.status = status;
  }

  if (category) {
    filters.category = category;
  }

  if (ecoScore) {
    filters.ecoScoreGrade = String(ecoScore).toUpperCase();
  }

  if (material) {
    const materialDoc = await Material.findOne({ name: material }).select('_id');
    filters.materialId = materialDoc?._id || null;
  }

  const products = await Product.find(filters)
    .sort({ createdAt: -1 })
    .populate('sellerId', 'fullName')
    .populate('materialId', 'name category');

  response.json({ products: products.map(mapProduct) });
}));

productsRouter.get('/:productId', asyncHandler(async (request, response) => {
  response.json({ product: mapProduct(await getProductById(request.params.productId)) });
}));

export { productsRouter };
