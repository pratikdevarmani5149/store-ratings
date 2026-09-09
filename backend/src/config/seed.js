/**
 * Creates the first System Administrator account so someone can log in
 * and start adding stores, users, and other admins. Run with: npm run seed
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

async function seed() {
  const name = process.env.SEED_ADMIN_NAME;
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const address = process.env.SEED_ADMIN_ADDRESS || '';

  if (!name || !email || !password) {
    console.error('SEED_ADMIN_NAME, SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env');
    process.exit(1);
  }

  try {
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      console.log(`An account with email ${email} already exists. Nothing to do.`);
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await db.query(
      `INSERT INTO users (name, email, password_hash, address, role)
       VALUES ($1, $2, $3, $4, 'admin')`,
      [name, email, passwordHash, address]
    );

    console.log('Administrator account created:');
    console.log(`  email: ${email}`);
    console.log('  password: (the value of SEED_ADMIN_PASSWORD in your .env)');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();
