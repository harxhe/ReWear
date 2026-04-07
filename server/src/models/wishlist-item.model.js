import { mongoose } from '../db/mongoose.js';

const wishlistItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

wishlistItemSchema.index({ userId: 1, productId: 1 }, { unique: true });

export const WishlistItem = mongoose.models.WishlistItem || mongoose.model('WishlistItem', wishlistItemSchema);
