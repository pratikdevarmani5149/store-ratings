const db = require('../config/db');

const SORTABLE_COLUMNS = ['name', 'email', 'address', 'role', 'created_at'];

function sanitizeSort(sortBy, sortOrder) {
  const column = SORTABLE_COLUMNS.includes(sortBy) ? sortBy : 'name';
  const order = String(sortOrder).toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  return { column, order };
}

async function findByEmail(email) {
  const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0] || null;
}

async function create({ name, email, passwordHash, address, role }) {
  const { rows } = await db.query(
    `INSERT INTO users (name, email, password_hash, address, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, address, role, created_at`,
    [name, email, passwordHash, address, role]
  );
  return rows[0];
}

async function updatePassword(id, passwordHash) {
  await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, id]);
}

async function updateProfile(id, { name, address }) {
  const { rows } = await db.query(
    `UPDATE users SET name = $1, address = $2 WHERE id = $3
     RETURNING id, name, email, address, role`,
    [name, address, id]
  );
  return rows[0];
}

// Lists admin + normal users (used by the admin "manage users" screen), with optional filters and sorting.
async function listAdminAndNormalUsers({ name, email, address, role, sortBy, sortOrder }) {
  const { column, order } = sanitizeSort(sortBy, sortOrder);
  const conditions = [`role IN ('admin', 'user')`];
  const params = [];

  if (name) {
    params.push(`%${name}%`);
    conditions.push(`name ILIKE $${params.length}`);
  }
  if (email) {
    params.push(`%${email}%`);
    conditions.push(`email ILIKE $${params.length}`);
  }
  if (address) {
    params.push(`%${address}%`);
    conditions.push(`address ILIKE $${params.length}`);
  }
  if (role && ['admin', 'user'].includes(role)) {
    params.push(role);
    conditions.push(`role = $${params.length}`);
  }

  const sql = `
    SELECT id, name, email, address, role, created_at
    FROM users
    WHERE ${conditions.join(' AND ')}
    ORDER BY ${column} ${order}
  `;
  const { rows } = await db.query(sql, params);
  return rows;
}

// Full detail view for a single user, including their average store rating if they own a store.
async function getUserDetail(id) {
  const user = await findById(id);
  if (!user) return null;

  let averageRating = null;
  if (user.role === 'store_owner') {
    const { rows } = await db.query(
      `SELECT COALESCE(AVG(r.rating), 0)::numeric(3,2) AS avg_rating
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE s.owner_id = $1`,
      [id]
    );
    averageRating = Number(rows[0].avg_rating);
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    address: user.address,
    role: user.role,
    createdAt: user.created_at,
    averageRating,
  };
}

async function countByRole(role) {
  const { rows } = await db.query('SELECT COUNT(*)::int AS count FROM users WHERE role = $1', [role]);
  return rows[0].count;
}

async function emailExists(email) {
  const { rows } = await db.query('SELECT 1 FROM users WHERE email = $1', [email]);
  return rows.length > 0;
}

module.exports = {
  findByEmail,
  findById,
  create,
  updatePassword,
  updateProfile,
  listAdminAndNormalUsers,
  getUserDetail,
  countByRole,
  emailExists,
};
