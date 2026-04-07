import bcrypt from 'bcryptjs';

import { connectToDatabase, disconnectFromDatabase } from '../src/db/mongoose.js';
import { Material } from '../src/models/material.model.js';
import { Product } from '../src/models/product.model.js';
import { User } from '../src/models/user.model.js';
import { calculateSustainabilityMetrics } from '../src/services/sustainability.service.js';

const demoPassword = 'demo12345';

const demoUsers = [
  { email: 'seller@rewear.demo', fullName: 'Mira Seller', role: 'seller' },
  { email: 'buyer@rewear.demo', fullName: 'Noah Buyer', role: 'buyer' },
];

const demoProducts = [
  { category: 'Tops', conditionLabel: 'Gently Used', description: 'Soft cotton overshirt with a relaxed fit and clean stitching.', imageUrl: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80', materialName: 'Cotton', price: 32, title: 'Used Cotton Work Shirt' },
  { category: 'Outerwear', conditionLabel: 'Worn', description: 'Broken-in hemp chore jacket with visible character and lots of life left.', imageUrl: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1200&q=80', materialName: 'Hemp', price: 58, title: 'Worn Hemp Chore Jacket' },
  { category: 'Denim', conditionLabel: 'Like New', description: 'Structured recycled denim jeans with a tapered vintage cut.', imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80', materialName: 'Recycled Denim', price: 46, title: 'Recycled Denim Taper Jeans' },
  { category: 'Dresses', conditionLabel: 'Gently Used', description: 'Airy linen midi dress with earthy stripes and an easy drape.', imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80', materialName: 'Linen', price: 52, title: 'Used Linen Midi Dress' },
  { category: 'Outerwear', conditionLabel: 'Like New', description: 'Clean recycled polyester puffer built for cold commutes and light layering.', imageUrl: 'https://images.unsplash.com/photo-1548883354-94bcfe321cbb?auto=format&fit=crop&w=1200&q=80', materialName: 'Recycled Polyester', price: 64, title: 'Recycled Puffer Vest' },
  { category: 'Accessories', conditionLabel: 'Worn', description: 'Chunky wool scarf with soft texture and visible vintage character.', imageUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80', materialName: 'Wool', price: 24, title: 'Vintage Wool Winter Scarf' },
  { category: 'Tops', conditionLabel: 'Brand New', description: 'Sleek nylon training shell with a modern sporty cut.', imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80', materialName: 'Nylon', price: 29, title: 'Nylon Training Shell Top' },
  { category: 'Accessories', conditionLabel: 'Gently Used', description: 'Minimal hemp tote with sturdy handles and everyday market-room carry.', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80', materialName: 'Hemp', price: 18, title: 'Hemp Market Tote' },
  { category: 'Tops', conditionLabel: 'Like New', description: 'Lightweight recycled polyester zip pullover for transitional layering.', imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80', materialName: 'Recycled Polyester', price: 35, title: 'Recycled Zip Pullover' },
];

await connectToDatabase();

try {
  const passwordHash = await bcrypt.hash(demoPassword, 10);
  const userIds = new Map();

  for (const user of demoUsers) {
    const doc = await User.findOneAndUpdate(
      { email: user.email },
      { ...user, passwordHash },
      { returnDocument: 'after', upsert: true },
    );

    userIds.set(user.email, doc._id);
  }

  const materials = await Material.find();
  const materialMap = new Map(materials.map((row) => [row.name, row]));

  for (const product of demoProducts) {
    const material = materialMap.get(product.materialName);

    if (!material) {
      throw new Error(`Material ${product.materialName} was not found. Run db:seed first.`);
    }

    const metrics = calculateSustainabilityMetrics({
      conditionLabel: product.conditionLabel,
      materialBaseValue: material.baseValue,
      materialCarbonCostKg: material.carbonCostKg,
      materialName: material.name,
      materialWaterCostLiters: material.waterCostLiters,
    });

    await Product.findOneAndUpdate(
      { title: product.title },
      {
        sellerId: userIds.get('seller@rewear.demo'),
        materialId: material._id,
        materialNameCache: material.name,
        title: product.title,
        description: product.description,
        category: product.category,
        price: product.price,
        conditionLabel: product.conditionLabel,
        conditionWeight: metrics.conditionWeight,
        ecoScoreNumeric: metrics.ecoScoreNumeric,
        ecoScoreGrade: metrics.ecoScoreGrade,
        waterSavedLiters: metrics.waterSavedLiters,
        co2DivertedKg: metrics.co2DivertedKg,
        imageUrl: product.imageUrl,
        status: 'available',
      },
      { returnDocument: 'after', upsert: true },
    );
  }

  console.log('Demo users and products seeded successfully.');
  console.log('Seller login: seller@rewear.demo / demo12345');
  console.log('Buyer login: buyer@rewear.demo / demo12345');
} finally {
  await disconnectFromDatabase();
}
