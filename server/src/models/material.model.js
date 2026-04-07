import { mongoose } from '../db/mongoose.js';

const materialSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  category: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  waterCostLiters: { type: Number, required: true, min: 0 },
  carbonCostKg: { type: Number, required: true, min: 0 },
  baseValue: { type: Number, required: true, min: 0, max: 100 },
}, { timestamps: true });

export const Material = mongoose.models.Material || mongoose.model('Material', materialSchema);
