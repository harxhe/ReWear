BEGIN;

INSERT INTO materials_registry (name, category, description, water_cost_liters, carbon_cost_kg, base_value)
VALUES
  ('Cotton', 'Natural Fiber', 'A common staple fiber with high water intensity in virgin production.', 2700, 5.90, 72),
  ('Linen', 'Natural Fiber', 'Flax-based fabric with lower processing impact and strong durability.', 650, 2.10, 92),
  ('Hemp', 'Natural Fiber', 'Highly durable fabric with low agricultural input needs.', 500, 1.80, 96),
  ('Wool', 'Animal Fiber', 'Warm, durable fiber with moderate to high carbon footprint.', 1900, 8.50, 68),
  ('Recycled Denim', 'Recycled Fiber', 'Repurposed cotton-rich textile with strong circularity value.', 1200, 3.40, 88),
  ('Polyester', 'Synthetic Fiber', 'Virgin synthetic fabric with low water but high fossil fuel dependence.', 180, 9.50, 40),
  ('Recycled Polyester', 'Recycled Fiber', 'Synthetic fiber made from recovered inputs with better reuse profile.', 95, 5.40, 63),
  ('Nylon', 'Synthetic Fiber', 'Performance synthetic with high embodied carbon.', 160, 11.20, 34)
ON CONFLICT (name) DO UPDATE
SET
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  water_cost_liters = EXCLUDED.water_cost_liters,
  carbon_cost_kg = EXCLUDED.carbon_cost_kg,
  base_value = EXCLUDED.base_value,
  updated_at = NOW();

INSERT INTO badge_definitions (slug, title, description, rule_type, rule_threshold, material_name)
VALUES
  ('circular-citizen', 'Circular Citizen', 'Unlock after completing your first second-hand purchase.', 'purchase_count', 1, NULL),
  ('water-guardian', 'Water Guardian', 'Unlock after saving 5000 liters of water.', 'water_saved', 5000, NULL),
  ('carbon-cutter', 'Carbon Cutter', 'Unlock after diverting 25 kg of CO2.', 'co2_diverted', 25, NULL),
  ('hemp-hero', 'Hemp Hero', 'Unlock after buying two hemp items.', 'material_purchase_count', 2, 'Hemp')
ON CONFLICT (slug) DO UPDATE
SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  rule_type = EXCLUDED.rule_type,
  rule_threshold = EXCLUDED.rule_threshold,
  material_name = EXCLUDED.material_name;

COMMIT;
