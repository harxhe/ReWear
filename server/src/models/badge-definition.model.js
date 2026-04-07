import { mongoose } from '../db/mongoose.js';

const badgeDefinitionSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, trim: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  ruleType: { type: String, enum: ['purchase_count', 'water_saved', 'co2_diverted', 'material_purchase_count'], required: true },
  ruleThreshold: { type: Number, required: true, min: 0 },
  materialName: { type: String, default: null },
}, { timestamps: true });

export const BadgeDefinition = mongoose.models.BadgeDefinition || mongoose.model('BadgeDefinition', badgeDefinitionSchema);
