const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');
const storeModel = require('../models/storeModel');
const ratingModel = require('../models/ratingModel');

async function getDashboard(req, res, next) {
  try {
    const [totalUsers, totalAdmins, totalOwners, totalStores, totalRatings] = await Promise.all([
      userModel.countByRole('user'),
      userModel.countByRole('admin'),
      userModel.countByRole('store_owner'),
      storeModel.count(),
      ratingModel.count(),
    ]);

    res.json({
      totalUsers: totalUsers + totalAdmins + totalOwners,
      totalStores,
      totalRatings,
    });
  } catch (err) {
    next(err);
  }
}

// Creates a user with any role (admin, user, or store_owner).
// When role is store_owner, storeId links them to an existing store they will manage.
async function createUser(req, res, next) {
  try {
    const { name, email, address, password, role, storeId } = req.body;

    if (!['admin', 'user', 'store_owner'].includes(role)) {
      return res.status(422).json({ message: 'Role must be admin, user, or store_owner.' });
    }
    if (await userModel.emailExists(email)) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await userModel.create({ name, email, passwordHash, address, role });

    if (role === 'store_owner' && storeId) {
      const store = await storeModel.findById(storeId);
      if (store) {
        const db = require('../config/db');
        await db.query('UPDATE stores SET owner_id = $1 WHERE id = $2', [user.id, storeId]);
      }
    }

    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
}

async function createStore(req, res, next) {
  try {
    const { name, email, address, description, ownerId } = req.body;
    const store = await storeModel.create({ name, email, address, description, ownerId });
    res.status(201).json({ store });
  } catch (err) {
    next(err);
  }
}

async function listUsers(req, res, next) {
  try {
    const { name, email, address, role, sortBy, sortOrder } = req.query;
    const users = await userModel.listAdminAndNormalUsers({ name, email, address, role, sortBy, sortOrder });
    res.json({ users });
  } catch (err) {
    next(err);
  }
}

async function listStores(req, res, next) {
  try {
    const { name, email, address, sortBy, sortOrder } = req.query;
    const stores = await storeModel.listStoresForAdmin({ name, email, address, sortBy, sortOrder });
    res.json({ stores });
  } catch (err) {
    next(err);
  }
}

async function getUserDetail(req, res, next) {
  try {
    const user = await userModel.getUserDetail(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

// Store owner accounts without a linked store yet, for the "assign owner" dropdown when creating a store.
async function listUnassignedOwners(req, res, next) {
  try {
    const db = require('../config/db');
    const { rows } = await db.query(
      `SELECT id, name, email FROM users
       WHERE role = 'store_owner'
       AND id NOT IN (SELECT owner_id FROM stores WHERE owner_id IS NOT NULL)
       ORDER BY name`
    );
    res.json({ owners: rows });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboard,
  createUser,
  createStore,
  listUsers,
  listStores,
  getUserDetail,
  listUnassignedOwners,
};
