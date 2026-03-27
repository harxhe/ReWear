import { query } from '../db/query.js';

async function getUserBadgeStats(userId) {
  const result = await query(
    `
      SELECT
        COUNT(p.id)::int AS purchase_count,
        COALESCE(SUM(p.water_saved_liters), 0) AS total_water_saved_liters,
        COALESCE(SUM(p.co2_diverted_kg), 0) AS total_co2_diverted_kg
      FROM purchases p
      WHERE p.buyer_id = $1
    `,
    [userId],
  );

  return {
    purchaseCount: result.rows[0].purchase_count,
    totalCo2DivertedKg: Number(result.rows[0].total_co2_diverted_kg),
    totalWaterSavedLiters: Number(result.rows[0].total_water_saved_liters),
  };
}

async function getMaterialPurchaseCount(userId, materialName) {
  const result = await query(
    `
      SELECT COUNT(*)::int AS purchase_count
      FROM purchases p
      INNER JOIN products pr ON pr.id = p.product_id
      INNER JOIN materials_registry mr ON mr.id = pr.material_id
      WHERE p.buyer_id = $1 AND mr.name = $2
    `,
    [userId, materialName],
  );

  return result.rows[0].purchase_count;
}

function badgeUnlocked(badge, stats, materialPurchaseCount) {
  switch (badge.rule_type) {
    case 'purchase_count':
      return stats.purchaseCount >= Number(badge.rule_threshold);
    case 'water_saved':
      return stats.totalWaterSavedLiters >= Number(badge.rule_threshold);
    case 'co2_diverted':
      return stats.totalCo2DivertedKg >= Number(badge.rule_threshold);
    case 'material_purchase_count':
      return materialPurchaseCount >= Number(badge.rule_threshold);
    default:
      return false;
  }
}

export async function syncUserBadges(userId) {
  const badgeDefinitionsResult = await query(
    `
      SELECT id, slug, title, description, rule_type, rule_threshold, material_name
      FROM badge_definitions
      ORDER BY id ASC
    `,
  );

  const stats = await getUserBadgeStats(userId);

  for (const badge of badgeDefinitionsResult.rows) {
    const materialPurchaseCount = badge.material_name
      ? await getMaterialPurchaseCount(userId, badge.material_name)
      : 0;

    if (badgeUnlocked(badge, stats, materialPurchaseCount)) {
      await query(
        `
          INSERT INTO user_badges (user_id, badge_id)
          VALUES ($1, $2)
          ON CONFLICT (user_id, badge_id) DO NOTHING
        `,
        [userId, badge.id],
      );
    }
  }
}

export async function getUnlockedBadges(userId) {
  const result = await query(
    `
      SELECT bd.slug, bd.title, bd.description, ub.unlocked_at
      FROM user_badges ub
      INNER JOIN badge_definitions bd ON bd.id = ub.badge_id
      WHERE ub.user_id = $1
      ORDER BY ub.unlocked_at ASC
    `,
    [userId],
  );

  return result.rows.map((row) => ({
    slug: row.slug,
    title: row.title,
    description: row.description,
    unlockedAt: row.unlocked_at,
  }));
}
