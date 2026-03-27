import { Router } from 'express';

import { query } from '../db/query.js';
import { asyncHandler } from '../lib/async-handler.js';
import { requireAuth } from '../lib/auth.js';
import { syncUserBadges, getUnlockedBadges } from '../services/badge.service.js';

const usersRouter = Router();

usersRouter.get('/me/dashboard', requireAuth, asyncHandler(async (request, response) => {
  await syncUserBadges(request.auth.userId);

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

  const totals = totalsResult.rows[0];
  const badges = await getUnlockedBadges(request.auth.userId);

  response.json({
    dashboard: {
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
      totalCo2DivertedKg: Number(totals.total_co2_diverted_kg),
      totalSpent: Number(totals.total_spent),
      totalWaterSavedLiters: Number(totals.total_water_saved_liters),
    },
  });
}));

export { usersRouter };
