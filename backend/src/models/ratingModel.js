const db = require('../config/db');

// Creates a rating, or updates it in place if this user already rated this store.
async function upsert({ userId, storeId, rating }) {
  const { rows } = await db.query(
    `INSERT INTO ratings (user_id, store_id, rating)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, store_id)
     DO UPDATE SET rating = EXCLUDED.rating, updated_at = NOW()
     RETURNING id, user_id, store_id, rating, updated_at`,
    [userId, storeId, rating]
  );
  return rows[0];
}

async function count() {
  const { rows } = await db.query('SELECT COUNT(*)::int AS count FROM ratings');
  return rows[0].count;
}

module.exports = { upsert, count };
