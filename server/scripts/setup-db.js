import { connectToDatabase, disconnectFromDatabase } from '../src/db/mongoose.js';
import { BadgeDefinition } from '../src/models/badge-definition.model.js';
import { Material } from '../src/models/material.model.js';
import { Product } from '../src/models/product.model.js';
import { Purchase } from '../src/models/purchase.model.js';
import { UserBadge } from '../src/models/user-badge.model.js';
import { User } from '../src/models/user.model.js';
import { WishlistItem } from '../src/models/wishlist-item.model.js';

await connectToDatabase();

try {
  await Promise.all([
    User.syncIndexes(),
    Material.syncIndexes(),
    Product.syncIndexes(),
    Purchase.syncIndexes(),
    BadgeDefinition.syncIndexes(),
    UserBadge.syncIndexes(),
    WishlistItem.syncIndexes(),
  ]);

  console.log('MongoDB collections and indexes are ready.');
} finally {
  await disconnectFromDatabase();
}
