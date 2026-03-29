BEGIN;

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'buyer',
  avatar_url TEXT,
  total_water_saved_liters NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_co2_diverted_kg NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_role_valid CHECK (role IN ('buyer', 'seller'))
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20);
UPDATE users
SET role = CASE
  WHEN EXISTS (SELECT 1 FROM products p WHERE p.seller_id = users.id) THEN 'seller'
  ELSE 'buyer'
END
WHERE role IS NULL OR role = 'both';
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'buyer';
ALTER TABLE users ALTER COLUMN role SET NOT NULL;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_valid;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_role_valid'
  ) THEN
    ALTER TABLE users
    ADD CONSTRAINT users_role_valid CHECK (role IN ('buyer', 'seller'));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS materials_registry (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE,
  category VARCHAR(80) NOT NULL,
  description TEXT,
  water_cost_liters NUMERIC(12, 2) NOT NULL,
  carbon_cost_kg NUMERIC(10, 2) NOT NULL,
  base_value NUMERIC(5, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT materials_water_cost_nonnegative CHECK (water_cost_liters >= 0),
  CONSTRAINT materials_carbon_cost_nonnegative CHECK (carbon_cost_kg >= 0),
  CONSTRAINT materials_base_value_range CHECK (base_value >= 0 AND base_value <= 100)
);

CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  seller_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  material_id BIGINT NOT NULL REFERENCES materials_registry(id),
  title VARCHAR(160) NOT NULL,
  description TEXT,
  category VARCHAR(80) NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  condition_label VARCHAR(32) NOT NULL,
  condition_weight NUMERIC(5, 2) NOT NULL,
  eco_score_numeric NUMERIC(5, 2) NOT NULL,
  eco_score_grade CHAR(1) NOT NULL,
  water_saved_liters NUMERIC(12, 2) NOT NULL,
  co2_diverted_kg NUMERIC(10, 2) NOT NULL,
  image_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT products_price_nonnegative CHECK (price >= 0),
  CONSTRAINT products_condition_weight_range CHECK (condition_weight >= 0 AND condition_weight <= 100),
  CONSTRAINT products_score_range CHECK (eco_score_numeric >= 0 AND eco_score_numeric <= 100),
  CONSTRAINT products_grade_valid CHECK (eco_score_grade IN ('A', 'B', 'C', 'D', 'E')),
  CONSTRAINT products_condition_valid CHECK (condition_label IN ('Brand New', 'Like New', 'Gently Used', 'Worn')),
  CONSTRAINT products_status_valid CHECK (status IN ('available', 'sold', 'archived'))
);

CREATE TABLE IF NOT EXISTS purchases (
  id BIGSERIAL PRIMARY KEY,
  buyer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
  purchase_price NUMERIC(10, 2) NOT NULL,
  water_saved_liters NUMERIC(12, 2) NOT NULL,
  co2_diverted_kg NUMERIC(10, 2) NOT NULL,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT purchases_price_nonnegative CHECK (purchase_price >= 0)
);

CREATE TABLE IF NOT EXISTS badge_definitions (
  id BIGSERIAL PRIMARY KEY,
  slug VARCHAR(80) NOT NULL UNIQUE,
  title VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  rule_type VARCHAR(40) NOT NULL,
  rule_threshold NUMERIC(12, 2) NOT NULL,
  material_name VARCHAR(80),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT badge_rule_type_valid CHECK (rule_type IN ('purchase_count', 'water_saved', 'co2_diverted', 'material_purchase_count'))
);

CREATE TABLE IF NOT EXISTS user_badges (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id BIGINT NOT NULL REFERENCES badge_definitions(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT user_badges_unique UNIQUE (user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS wishlist_items (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT wishlist_items_unique UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_material_id ON products(material_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_grade ON products(eco_score_grade);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_purchases_buyer_id ON purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist_items(user_id);

COMMIT;
