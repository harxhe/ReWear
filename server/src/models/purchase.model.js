import { mongoose } from '../db/mongoose.js';

const purchaseSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
  purchasePrice: { type: Number, required: true, min: 0 },
  waterSavedLiters: { type: Number, required: true, min: 0 },
  co2DivertedKg: { type: Number, required: true, min: 0 },
  purchasedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export const Purchase = mongoose.models.Purchase || mongoose.model('Purchase', purchaseSchema);
