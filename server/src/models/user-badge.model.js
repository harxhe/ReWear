import { mongoose } from '../db/mongoose.js';

const userBadgeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  badgeId: { type: mongoose.Schema.Types.ObjectId, ref: 'BadgeDefinition', required: true },
  unlockedAt: { type: Date, default: Date.now },
}, { timestamps: false });

userBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

export const UserBadge = mongoose.models.UserBadge || mongoose.model('UserBadge', userBadgeSchema);
