const db = require('../config/db');

const SORTABLE_COLUMNS = ['name', 'email', 'address', 'rating'];

function sanitizeSort(sortBy, sortOrder) {
  const column = SORTABLE_COLUMNS.includes(sortBy) ? sortBy : 'name';
  const order = String(sortOrder).toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  return { column, order };
}

async function create({ name, email, address, description, ownerId }) {
  const { rows } = await db.query(
    `INSERT INTO stores (name, email, address, description, owner_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, address, description, owner_id, created_at`,
    [name, email, address, description || '', ownerId || null]
  );
  return rows[0];
}

// Admin listing: every store with its average rating, filterable by name/email/address.
async function listStoresForAdmin({ name, email, address, sortBy, sortOrder }) {
  const { column, order } = sanitizeSort(sortBy, sortOrder);
  const conditions = [];
  const params = [];

  if (name) {
    params.push(`%${name}%`);
    conditions.push(`s.name ILIKE $${params.length}`);
  }
  if (email) {
    params.push(`%${email}%`);
    conditions.push(`s.email ILIKE $${params.length}`);
  }
  if (address) {
    params.push(`%${address}%`);
    conditions.push(`s.address ILIKE $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderColumn = column === 'rating' ? 'rating' : `s.${column}`;

  const sql = `
    SELECT s.id, s.name, s.email, s.address, s.description,
           COALESCE(AVG(r.rating), 0)::numeric(3,2) AS rating,
           COUNT(r.id)::int AS rating_count,
           (SELECT COALESCE(json_agg(image_url ORDER BY created_at), '[]')
            FROM store_images WHERE store_id = s.id) AS images
    FROM stores s
    LEFT JOIN ratings r ON r.store_id = s.id
    ${where}
    GROUP BY s.id
    ORDER BY ${orderColumn} ${order}
  `;
  const { rows } = await db.query(sql, params);
  return rows;
}

// Normal-user listing: every store, its average rating, and this user's own submitted rating.
async function listStoresForUser({ userId, name, address, sortBy, sortOrder }) {
  const { column, order } = sanitizeSort(sortBy, sortOrder);
  const conditions = [];
  const params = [userId];

  if (name) {
    params.push(`%${name}%`);
    conditions.push(`s.name ILIKE $${params.length}`);
  }
  if (address) {
    params.push(`%${address}%`);
    conditions.push(`s.address ILIKE $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderColumn = column === 'rating' ? 'overall_rating' : `s.${column === 'email' ? 'name' : column}`;

  const sql = `
    SELECT s.id, s.name, s.email, s.address, s.description,
           COALESCE(AVG(r.rating), 0)::numeric(3,2) AS overall_rating,
           (SELECT rating FROM ratings WHERE store_id = s.id AND user_id = $1) AS user_rating,
           (SELECT COALESCE(json_agg(image_url ORDER BY created_at), '[]')
            FROM store_images WHERE store_id = s.id) AS images
    FROM stores s
    LEFT JOIN ratings r ON r.store_id = s.id
    ${where}
    GROUP BY s.id
    ORDER BY ${orderColumn} ${order}
  `;
  const { rows } = await db.query(sql, params);
  return rows;
}

async function findById(id) {
  const { rows } = await db.query('SELECT * FROM stores WHERE id = $1', [id]);
  return rows[0] || null;
}

async function findByOwnerId(ownerId) {
  const { rows } = await db.query('SELECT * FROM stores WHERE owner_id = $1', [ownerId]);
  return rows[0] || null;
}

// Store-owner dashboard: everyone who rated this store, plus the average.
async function getRatersForStore(storeId) {
  const { rows } = await db.query(
    `SELECT u.id AS user_id, u.name, u.email, r.rating, r.created_at
     FROM ratings r
     JOIN users u ON u.id = r.user_id
     WHERE r.store_id = $1
     ORDER BY r.created_at DESC`,
    [storeId]
  );
  return rows;
}

async function getAverageRating(storeId) {
  const { rows } = await db.query(
    `SELECT COALESCE(AVG(rating), 0)::numeric(3,2) AS avg_rating, COUNT(*)::int AS count
     FROM ratings WHERE store_id = $1`,
    [storeId]
  );
  return { average: Number(rows[0].avg_rating), count: rows[0].count };
}

async function count() {
  const { rows } = await db.query('SELECT COUNT(*)::int AS count FROM stores');
  return rows[0].count;
}

async function updateDescription(storeId, description) {
  const { rows } = await db.query(
    'UPDATE stores SET description = $1 WHERE id = $2 RETURNING id, description',
    [description || '', storeId]
  );
  return rows[0] || null;
}

async function listImages(storeId) {
  const { rows } = await db.query(
    'SELECT id, image_url, created_at FROM store_images WHERE store_id = $1 ORDER BY created_at',
    [storeId]
  );
  return rows;
}

async function addImage(storeId, imageUrl) {
  const { rows } = await db.query(
    'INSERT INTO store_images (store_id, image_url) VALUES ($1, $2) RETURNING id, image_url, created_at',
    [storeId, imageUrl]
  );
  return rows[0];
}

// Deletes an image only if it belongs to the given store, so one owner can't delete another's photo.
async function deleteImage(imageId, storeId) {
  const { rowCount } = await db.query(
    'DELETE FROM store_images WHERE id = $1 AND store_id = $2',
    [imageId, storeId]
  );
  return rowCount > 0;
}

module.exports = {
  create,
  listStoresForAdmin,
  listStoresForUser,
  findById,
  findByOwnerId,
  getRatersForStore,
  getAverageRating,
  count,
  updateDescription,
  listImages,
  addImage,
  deleteImage,
};
