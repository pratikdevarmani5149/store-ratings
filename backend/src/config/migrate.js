/**
 * Creates the database schema. Run once with: npm run migrate
 * Safe to re-run: every statement uses IF NOT EXISTS.
 */
const db = require('./db');

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(60) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  address       VARCHAR(400) NOT NULL DEFAULT '',
  role          VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'user', 'store_owner')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Older installations created "name" with a 20-character minimum. Name length
-- is now validated in the application layer instead, so the DB constraint is dropped.
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_name_check;

CREATE TABLE IF NOT EXISTS stores (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(60) NOT NULL,
  email         VARCHAR(255) NOT NULL,
  address       VARCHAR(400) NOT NULL DEFAULT '',
  description   TEXT NOT NULL DEFAULT '',
  owner_id      INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE stores ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS store_images (
  id            SERIAL PRIMARY KEY,
  store_id      INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  image_url     VARCHAR(1000) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ratings (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id      INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  rating        SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, store_id)
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_stores_owner ON stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_store_images_store ON store_images(store_id);
CREATE INDEX IF NOT EXISTS idx_ratings_store ON ratings(store_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user ON ratings(user_id);
`;

async function migrate() {
  try {
    await db.query(SCHEMA);
    console.log('Migration complete: tables users, stores, store_images, ratings are ready.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
