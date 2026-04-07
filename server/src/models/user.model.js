import { mongoose } from '../db/mongoose.js';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['buyer', 'seller'], required: true, default: 'buyer' },
  avatarUrl: { type: String, default: null },
  totalWaterSavedLiters: { type: Number, default: 0 },
  totalCo2DivertedKg: { type: Number, default: 0 },
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', userSchema);
