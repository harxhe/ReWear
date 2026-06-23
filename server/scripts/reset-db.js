import { connectToDatabase, disconnectFromDatabase, mongoose } from '../src/db/mongoose.js';
import { Product } from '../src/models/product.model.js';

await connectToDatabase();

try {
  await Product.deleteMany({});
  console.log('ReWear MongoDB products cleared successfully.');
} finally {
  await disconnectFromDatabase();
}
