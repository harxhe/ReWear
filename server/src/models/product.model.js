import { mongoose } from '../db/mongoose.js';

const productSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true, index: true },
  materialNameCache: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: { type: String, required: true, trim: true, index: true },
  price: { type: Number, required: true, min: 0 },
  conditionLabel: { type: String, enum: ['Brand New', 'Like New', 'Gently Used', 'Worn'], required: true },
  conditionWeight: { type: Number, required: true, min: 0, max: 100 },
  ecoScoreNumeric: { type: Number, required: true, min: 0, max: 100 },
  ecoScoreGrade: { type: String, enum: ['A', 'B', 'C', 'D', 'E'], required: true, index: true },
  waterSavedLiters: { type: Number, required: true, min: 0 },
  co2DivertedKg: { type: Number, required: true, min: 0 },
  imageUrl: { type: String, default: null },
  status: { type: String, enum: ['available', 'sold', 'archived'], default: 'available', index: true },
}, { timestamps: true });

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
