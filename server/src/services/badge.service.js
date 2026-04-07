import { BadgeDefinition } from '../models/badge-definition.model.js';
import { Product } from '../models/product.model.js';
import { Purchase } from '../models/purchase.model.js';
import { UserBadge } from '../models/user-badge.model.js';

async function getUserBadgeStats(userId, session) {
  const purchases = await Purchase.find({ buyerId: userId }).session(session || null).lean();

  return {
    purchaseCount: purchases.length,
    totalCo2DivertedKg: purchases.reduce((sum, purchase) => sum + Number(purchase.co2DivertedKg || 0), 0),
    totalWaterSavedLiters: purchases.reduce((sum, purchase) => sum + Number(purchase.waterSavedLiters || 0), 0),
  };
}

async function getMaterialPurchaseCount(userId, materialName, session) {
  const purchases = await Purchase.find({ buyerId: userId }).select('productId').session(session || null).lean();
  const productIds = purchases.map((purchase) => purchase.productId);

  return Product.countDocuments({ _id: { $in: productIds }, materialNameCache: materialName }).session(session || null);
}

function badgeUnlocked(badge, stats, materialPurchaseCount) {
  switch (badge.ruleType) {
    case 'purchase_count':
      return stats.purchaseCount >= Number(badge.ruleThreshold);
    case 'water_saved':
      return stats.totalWaterSavedLiters >= Number(badge.ruleThreshold);
    case 'co2_diverted':
      return stats.totalCo2DivertedKg >= Number(badge.ruleThreshold);
    case 'material_purchase_count':
      return materialPurchaseCount >= Number(badge.ruleThreshold);
    default:
      return false;
  }
}

export async function syncUserBadges(userId, session) {
  const badgeDefinitions = await BadgeDefinition.find().sort({ createdAt: 1 }).session(session || null).lean();
  const stats = await getUserBadgeStats(userId, session);

  for (const badge of badgeDefinitions) {
    const materialPurchaseCount = badge.materialName
      ? await getMaterialPurchaseCount(userId, badge.materialName, session)
      : 0;

    if (badgeUnlocked(badge, stats, materialPurchaseCount)) {
      await UserBadge.updateOne(
        { badgeId: badge._id, userId },
        { $setOnInsert: { unlockedAt: new Date() } },
        { upsert: true, session },
      );
    }
  }
}

export async function getUnlockedBadges(userId) {
  const userBadges = await UserBadge.find({ userId }).populate('badgeId').sort({ unlockedAt: 1 });

  return userBadges.map((entry) => ({
    slug: entry.badgeId.slug,
    title: entry.badgeId.title,
    description: entry.badgeId.description,
    unlockedAt: entry.unlockedAt,
  }));
}
