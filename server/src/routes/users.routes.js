import { Router } from 'express';

import { asyncHandler } from '../lib/async-handler.js';
import { requireAuth } from '../lib/auth.js';
import { Product } from '../models/product.model.js';
import { Purchase } from '../models/purchase.model.js';
import { User } from '../models/user.model.js';
import { getUnlockedBadges, syncUserBadges } from '../services/badge.service.js';

const usersRouter = Router();

usersRouter.get('/me/profile', requireAuth, asyncHandler(async (request, response) => {
  const user = await User.findById(request.auth.userId);
  const recentListings = await Product.find({ sellerId: request.auth.userId })
    .sort({ createdAt: -1 })
    .limit(6)
    .populate('materialId', 'name category');
  const listingDocs = await Product.find({ sellerId: request.auth.userId }).select('status');
  const recentPurchases = await Purchase.find({ buyerId: request.auth.userId })
    .sort({ purchasedAt: -1 })
    .limit(6)
    .populate({ path: 'productId', populate: { path: 'materialId', select: 'name' } });

  response.json({
    profile: {
      availableListings: listingDocs.filter((item) => item.status === 'available').length,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      recentListings: recentListings.map((row) => ({
        category: row.category,
        createdAt: row.createdAt,
        ecoScoreGrade: row.ecoScoreGrade,
        id: String(row._id),
        imageUrl: row.imageUrl,
        price: Number(row.price),
        status: row.status,
        title: row.title,
      })),
      recentPurchases: recentPurchases.filter((entry) => entry.productId).map((row) => ({
        category: row.productId.category,
        ecoScoreGrade: row.productId.ecoScoreGrade,
        id: String(row._id),
        imageUrl: row.productId.imageUrl,
        materialName: row.productId.materialId.name,
        price: Number(row.purchasePrice),
        purchasedAt: row.purchasedAt,
        title: row.productId.title,
      })),
      soldListings: listingDocs.filter((item) => item.status === 'sold').length,
      totalCo2DivertedKg: Number(user.totalCo2DivertedKg),
      totalListings: listingDocs.length,
      totalPurchases: await Purchase.countDocuments({ buyerId: request.auth.userId }),
      totalWaterSavedLiters: Number(user.totalWaterSavedLiters),
    },
  });
}));

usersRouter.get('/me/dashboard', requireAuth, asyncHandler(async (request, response) => {
  await syncUserBadges(request.auth.userId);

  const user = await User.findById(request.auth.userId).select('role totalWaterSavedLiters totalCo2DivertedKg');
  const purchases = await Purchase.find({ buyerId: request.auth.userId })
    .sort({ purchasedAt: -1 })
    .populate({ path: 'productId', populate: { path: 'materialId', select: 'name' } });
  const listings = await Product.find({ sellerId: request.auth.userId }).sort({ createdAt: -1 }).populate('materialId', 'name');
  const soldProductIds = listings.filter((item) => item.status === 'sold').map((item) => item._id);
  const sales = await Purchase.find({ productId: { $in: soldProductIds } })
    .sort({ purchasedAt: -1 })
    .populate({ path: 'productId', populate: { path: 'materialId', select: 'name' } });
  const badges = await getUnlockedBadges(request.auth.userId);

  response.json({
    dashboard: {
      activeListings: listings.filter((item) => item.status === 'available').length,
      activeListingItems: listings.filter((item) => item.status === 'available').slice(0, 6).map((row) => ({
        category: row.category,
        conditionLabel: row.conditionLabel,
        createdAt: row.createdAt,
        ecoScoreGrade: row.ecoScoreGrade,
        id: String(row._id),
        imageUrl: row.imageUrl,
        materialName: row.materialId.name,
        price: Number(row.price),
        title: row.title,
      })),
      badges,
      purchaseCount: purchases.length,
      purchases: purchases.filter((entry) => entry.productId).map((row) => ({
        id: String(row._id),
        category: row.productId.category,
        co2DivertedKg: Number(row.co2DivertedKg),
        conditionLabel: row.productId.conditionLabel,
        ecoScoreGrade: row.productId.ecoScoreGrade,
        materialName: row.productId.materialId.name,
        price: Number(row.purchasePrice),
        purchasedAt: row.purchasedAt,
        title: row.productId.title,
        waterSavedLiters: Number(row.waterSavedLiters),
      })),
      recentSales: sales.filter((entry) => entry.productId).map((row) => ({
        category: row.productId.category,
        conditionLabel: row.productId.conditionLabel,
        ecoScoreGrade: row.productId.ecoScoreGrade,
        id: String(row.productId._id),
        imageUrl: row.productId.imageUrl,
        materialName: row.productId.materialId.name,
        price: Number(row.purchasePrice),
        soldAt: row.purchasedAt,
        title: row.productId.title,
      })),
      role: user.role,
      soldListingCount: listings.filter((item) => item.status === 'sold').length,
      totalListings: listings.length,
      totalSalesValue: sales.reduce((sum, row) => sum + Number(row.purchasePrice), 0),
      totalCo2DivertedKg: Number(user.totalCo2DivertedKg),
      totalSpent: purchases.reduce((sum, row) => sum + Number(row.purchasePrice), 0),
      totalWaterSavedLiters: Number(user.totalWaterSavedLiters),
    },
  });
}));

export { usersRouter };
