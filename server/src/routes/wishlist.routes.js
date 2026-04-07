import mongoose from 'mongoose';
import { Router } from 'express';

import { asyncHandler } from '../lib/async-handler.js';
import { requireAuth } from '../lib/auth.js';
import { HttpError } from '../lib/http-error.js';
import { requireAccountRole } from '../middleware/require-account-role.js';
import { Product } from '../models/product.model.js';
import { WishlistItem } from '../models/wishlist-item.model.js';
import { mapProduct } from '../utils/mappers.js';

const wishlistRouter = Router();

wishlistRouter.get('/', requireAuth, requireAccountRole(['buyer']), asyncHandler(async (request, response) => {
  const items = await WishlistItem.find({ userId: request.auth.userId })
    .sort({ createdAt: -1 })
    .populate({
      path: 'productId',
      populate: [
        { path: 'sellerId', select: 'fullName' },
        { path: 'materialId', select: 'name category' },
      ],
    });

  response.json({
    wishlist: items.filter((entry) => entry.productId).map((entry) => mapProduct(entry.productId)),
  });
}));

wishlistRouter.post('/', requireAuth, requireAccountRole(['buyer']), asyncHandler(async (request, response) => {
  const { productId } = request.body || {};

  if (!productId || !mongoose.isValidObjectId(productId)) {
    throw new HttpError(400, 'A product id is required to save to wishlist.');
  }

  const product = await Product.findById(productId).select('sellerId');

  if (!product) {
    throw new HttpError(404, 'Product was not found.');
  }

  if (String(product.sellerId) === request.auth.userId) {
    throw new HttpError(400, 'You cannot wishlist your own listing.');
  }

  await WishlistItem.updateOne(
    { productId, userId: request.auth.userId },
    { $setOnInsert: { createdAt: new Date() } },
    { upsert: true },
  );

  response.status(201).json({ success: true });
}));

wishlistRouter.delete('/:productId', requireAuth, requireAccountRole(['buyer']), asyncHandler(async (request, response) => {
  await WishlistItem.deleteOne({ productId: request.params.productId, userId: request.auth.userId });
  response.json({ success: true });
}));

export { wishlistRouter };
