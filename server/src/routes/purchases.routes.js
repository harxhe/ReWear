import mongoose from 'mongoose';
import { Router } from 'express';

import { asyncHandler } from '../lib/async-handler.js';
import { requireAuth } from '../lib/auth.js';
import { HttpError } from '../lib/http-error.js';
import { requireAccountRole } from '../middleware/require-account-role.js';
import { Product } from '../models/product.model.js';
import { Purchase } from '../models/purchase.model.js';
import { User } from '../models/user.model.js';
import { syncUserBadges } from '../services/badge.service.js';

const purchasesRouter = Router();

purchasesRouter.post('/', requireAuth, requireAccountRole(['buyer']), asyncHandler(async (request, response) => {
  const { productId } = request.body || {};

  if (!productId || !mongoose.isValidObjectId(productId)) {
    throw new HttpError(400, 'A product id is required to create a purchase.');
  }
  const product = await Product.findById(productId);

  if (!product) {
    throw new HttpError(404, 'Product was not found.');
  }

  if (String(product.sellerId) === request.auth.userId) {
    throw new HttpError(400, 'You cannot purchase your own listing.');
  }

  const reservedProduct = await Product.findOneAndUpdate(
    { _id: productId, status: 'available' },
    { $set: { status: 'sold' } },
    { new: true },
  );

  if (!reservedProduct) {
    throw new HttpError(409, 'This product is no longer available.');
  }

  const purchase = await Purchase.create({
    buyerId: request.auth.userId,
    productId: reservedProduct._id,
    purchasePrice: reservedProduct.price,
    waterSavedLiters: reservedProduct.waterSavedLiters,
    co2DivertedKg: reservedProduct.co2DivertedKg,
  });

  const buyerPurchases = await Purchase.find({ buyerId: request.auth.userId });
  const totalWaterSavedLiters = buyerPurchases.reduce((sum, entry) => sum + Number(entry.waterSavedLiters || 0), 0);
  const totalCo2DivertedKg = buyerPurchases.reduce((sum, entry) => sum + Number(entry.co2DivertedKg || 0), 0);

  await User.findByIdAndUpdate(request.auth.userId, {
    totalWaterSavedLiters,
    totalCo2DivertedKg,
  });

  await syncUserBadges(request.auth.userId);

  response.status(201).json({
    purchase: {
      id: String(purchase._id),
      productId: String(reservedProduct._id),
      purchasedAt: purchase.purchasedAt,
    },
  });
}));

export { purchasesRouter };
