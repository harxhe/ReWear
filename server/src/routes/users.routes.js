import { Router } from 'express';

import { query } from '../db/query.js';
import { asyncHandler } from '../lib/async-handler.js';
import { requireAuth } from '../lib/auth.js';
import { syncUserBadges, getUnlockedBadges } from '../services/badge.service.js';

const usersRouter = Router();

usersRouter.get('/me/profile', requireAuth, asyncHandler(async (request, response) => {
  const userResult = await query(
    `
      SELECT id, full_name, email, avatar_url, total_water_saved_liters, total_co2_diverted_kg, created_at
      , role
      FROM users
      WHERE id = $1
    `,
    [request.auth.userId],
  );

  const listingSummaryResult = await query(
    `
      SELECT
        COUNT(*)::int AS total_listings,
        COUNT(*) FILTER (WHERE status = 'available')::int AS available_listings,
        COUNT(*) FILTER (WHERE status = 'sold')::int AS sold_listings
      FROM products
      WHERE seller_id = $1
    `,
    [request.auth.userId],
  );

  const purchaseSummaryResult = await query(
    `
      SELECT COUNT(*)::int AS total_purchases
      FROM purchases
      WHERE buyer_id = $1
    `,
    [request.auth.userId],
  );

  const recentListingsResult = await query(
    `
      SELECT id, title, category, status, eco_score_grade, image_url, price, created_at
      FROM products
      WHERE seller_id = $1
      ORDER BY created_at DESC
      LIMIT 6
    `,
    [request.auth.userId],
  );

  const recentPurchasesResult = await query(
    `
      SELECT
        p.id,
        p.purchase_price,
        p.purchased_at,
        pr.title,
        pr.category,
        pr.eco_score_grade,
        pr.image_url,
        mr.name AS material_name
      FROM purchases p
      INNER JOIN products pr ON pr.id = p.product_id
      INNER JOIN materials_registry mr ON mr.id = pr.material_id
      WHERE p.buyer_id = $1
      ORDER BY p.purchased_at DESC
      LIMIT 6
    `,
    [request.auth.userId],
  );

  const listingSummary = listingSummaryResult.rows[0];
  const purchaseSummary = purchaseSummaryResult.rows[0];
  const user = userResult.rows[0];

  response.json({
    profile: {
      availableListings: Number(listingSummary.available_listings),
      avatarUrl: user.avatar_url,
      createdAt: user.created_at,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      recentListings: recentListingsResult.rows.map((row) => ({
        category: row.category,
        createdAt: row.created_at,
        ecoScoreGrade: row.eco_score_grade,
        id: row.id,
        imageUrl: row.image_url,
        price: Number(row.price),
        status: row.status,
        title: row.title,
      })),
      recentPurchases: recentPurchasesResult.rows.map((row) => ({
        category: row.category,
        ecoScoreGrade: row.eco_score_grade,
        id: row.id,
        imageUrl: row.image_url,
        materialName: row.material_name,
        price: Number(row.purchase_price),
        purchasedAt: row.purchased_at,
        title: row.title,
      })),
      soldListings: Number(listingSummary.sold_listings),
      totalCo2DivertedKg: Number(user.total_co2_diverted_kg),
      totalListings: Number(listingSummary.total_listings),
      totalPurchases: Number(purchaseSummary.total_purchases),
      totalWaterSavedLiters: Number(user.total_water_saved_liters),
    },
  });
}));

usersRouter.get('/me/dashboard', requireAuth, asyncHandler(async (request, response) => {
  await syncUserBadges(request.auth.userId);

  const userResult = await query(
    `
      SELECT role
      FROM users
      WHERE id = $1
    `,
    [request.auth.userId],
  );

  const totalsResult = await query(
    `
      SELECT
        COUNT(p.id)::int AS purchase_count,
        COALESCE(SUM(p.purchase_price), 0) AS total_spent,
        COALESCE(SUM(p.water_saved_liters), 0) AS total_water_saved_liters,
        COALESCE(SUM(p.co2_diverted_kg), 0) AS total_co2_diverted_kg
      FROM purchases p
      WHERE p.buyer_id = $1
    `,
    [request.auth.userId],
  );

  const purchasesResult = await query(
    `
      SELECT
        p.id,
        p.purchase_price,
        p.water_saved_liters,
        p.co2_diverted_kg,
        p.purchased_at,
        pr.title,
        pr.category,
        pr.condition_label,
        pr.eco_score_grade,
        mr.name AS material_name
      FROM purchases p
      INNER JOIN products pr ON pr.id = p.product_id
      INNER JOIN materials_registry mr ON mr.id = pr.material_id
      WHERE p.buyer_id = $1
      ORDER BY p.purchased_at DESC
    `,
    [request.auth.userId],
  );

  const sellerTotalsResult = await query(
    `
      SELECT
        COUNT(*)::int AS total_listings,
        COUNT(*) FILTER (WHERE status = 'available')::int AS active_listings,
        COUNT(*) FILTER (WHERE status = 'sold')::int AS sold_listings,
        COALESCE(SUM(price) FILTER (WHERE status = 'sold'), 0) AS total_sales_value
      FROM products
      WHERE seller_id = $1
    `,
    [request.auth.userId],
  );

  const sellerSalesResult = await query(
    `
      SELECT
        pr.id,
        pr.title,
        pr.category,
        pr.eco_score_grade,
        pr.image_url,
        pr.price,
        pr.condition_label,
        mr.name AS material_name,
        p.purchased_at
      FROM products pr
      INNER JOIN purchases p ON p.product_id = pr.id
      INNER JOIN materials_registry mr ON mr.id = pr.material_id
      WHERE pr.seller_id = $1
      ORDER BY p.purchased_at DESC
    `,
    [request.auth.userId],
  );

  const activeListingsResult = await query(
    `
      SELECT
        pr.id,
        pr.title,
        pr.category,
        pr.eco_score_grade,
        pr.image_url,
        pr.price,
        pr.condition_label,
        mr.name AS material_name,
        pr.created_at
      FROM products pr
      INNER JOIN materials_registry mr ON mr.id = pr.material_id
      WHERE pr.seller_id = $1 AND pr.status = 'available'
      ORDER BY pr.created_at DESC
      LIMIT 6
    `,
    [request.auth.userId],
  );

  const totals = totalsResult.rows[0];
  const sellerTotals = sellerTotalsResult.rows[0];
  const badges = await getUnlockedBadges(request.auth.userId);
  const role = userResult.rows[0]?.role || 'buyer';

  response.json({
    dashboard: {
      activeListings: Number(sellerTotals.active_listings),
      activeListingItems: activeListingsResult.rows.map((row) => ({
        category: row.category,
        conditionLabel: row.condition_label,
        createdAt: row.created_at,
        ecoScoreGrade: row.eco_score_grade,
        id: row.id,
        imageUrl: row.image_url,
        materialName: row.material_name,
        price: Number(row.price),
        title: row.title,
      })),
      badges,
      purchaseCount: totals.purchase_count,
      purchases: purchasesResult.rows.map((row) => ({
        id: row.id,
        category: row.category,
        co2DivertedKg: Number(row.co2_diverted_kg),
        conditionLabel: row.condition_label,
        ecoScoreGrade: row.eco_score_grade,
        materialName: row.material_name,
        price: Number(row.purchase_price),
        purchasedAt: row.purchased_at,
        title: row.title,
        waterSavedLiters: Number(row.water_saved_liters),
      })),
      recentSales: sellerSalesResult.rows.map((row) => ({
        category: row.category,
        conditionLabel: row.condition_label,
        ecoScoreGrade: row.eco_score_grade,
        id: row.id,
        imageUrl: row.image_url,
        materialName: row.material_name,
        price: Number(row.price),
        soldAt: row.purchased_at,
        title: row.title,
      })),
      role,
      soldListingCount: Number(sellerTotals.sold_listings),
      totalListings: Number(sellerTotals.total_listings),
      totalSalesValue: Number(sellerTotals.total_sales_value),
      totalCo2DivertedKg: Number(totals.total_co2_diverted_kg),
      totalSpent: Number(totals.total_spent),
      totalWaterSavedLiters: Number(totals.total_water_saved_liters),
    },
  });
}));

export { usersRouter };
