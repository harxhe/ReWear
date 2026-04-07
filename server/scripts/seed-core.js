import { connectToDatabase, disconnectFromDatabase } from '../src/db/mongoose.js';
import { BadgeDefinition } from '../src/models/badge-definition.model.js';
import { Material } from '../src/models/material.model.js';

await connectToDatabase();

const materials = [
  { name: 'Cotton', category: 'Natural Fiber', description: 'A common staple fiber with high water intensity in virgin production.', waterCostLiters: 2700, carbonCostKg: 5.9, baseValue: 72 },
  { name: 'Linen', category: 'Natural Fiber', description: 'Flax-based fabric with lower processing impact and strong durability.', waterCostLiters: 650, carbonCostKg: 2.1, baseValue: 92 },
  { name: 'Hemp', category: 'Natural Fiber', description: 'Highly durable fabric with low agricultural input needs.', waterCostLiters: 500, carbonCostKg: 1.8, baseValue: 96 },
  { name: 'Wool', category: 'Animal Fiber', description: 'Warm, durable fiber with moderate to high carbon footprint.', waterCostLiters: 1900, carbonCostKg: 8.5, baseValue: 68 },
  { name: 'Recycled Denim', category: 'Recycled Fiber', description: 'Repurposed cotton-rich textile with strong circularity value.', waterCostLiters: 1200, carbonCostKg: 3.4, baseValue: 88 },
  { name: 'Polyester', category: 'Synthetic Fiber', description: 'Virgin synthetic fabric with low water but high fossil fuel dependence.', waterCostLiters: 180, carbonCostKg: 9.5, baseValue: 40 },
  { name: 'Recycled Polyester', category: 'Recycled Fiber', description: 'Synthetic fiber made from recovered inputs with better reuse profile.', waterCostLiters: 95, carbonCostKg: 5.4, baseValue: 63 },
  { name: 'Nylon', category: 'Synthetic Fiber', description: 'Performance synthetic with high embodied carbon.', waterCostLiters: 160, carbonCostKg: 11.2, baseValue: 34 },
];

const badges = [
  { slug: 'circular-citizen', title: 'Circular Citizen', description: 'Unlock after completing your first second-hand purchase.', ruleType: 'purchase_count', ruleThreshold: 1, materialName: null },
  { slug: 'water-guardian', title: 'Water Guardian', description: 'Unlock after saving 5000 liters of water.', ruleType: 'water_saved', ruleThreshold: 5000, materialName: null },
  { slug: 'carbon-cutter', title: 'Carbon Cutter', description: 'Unlock after diverting 25 kg of CO2.', ruleType: 'co2_diverted', ruleThreshold: 25, materialName: null },
  { slug: 'hemp-hero', title: 'Hemp Hero', description: 'Unlock after buying two hemp items.', ruleType: 'material_purchase_count', ruleThreshold: 2, materialName: 'Hemp' },
];

try {
  for (const material of materials) {
    await Material.findOneAndUpdate({ name: material.name }, material, { returnDocument: 'after', upsert: true });
  }

  for (const badge of badges) {
    await BadgeDefinition.findOneAndUpdate({ slug: badge.slug }, badge, { returnDocument: 'after', upsert: true });
  }

  console.log('Core MongoDB seed data loaded successfully.');
} finally {
  await disconnectFromDatabase();
}
