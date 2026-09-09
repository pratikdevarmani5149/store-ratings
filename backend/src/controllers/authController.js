const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, address: user.address, role: user.role };
}

// Public self-registration. Always creates a "user" role account -
// admin and store_owner accounts are only created by an administrator.
async function signup(req, res, next) {
  try {
    const { name, email, address, password } = req.body;

    if (await userModel.emailExists(email)) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await userModel.create({ name, email, passwordHash, address, role: 'user' });

    const token = signToken(user);
    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await userModel.findByEmail(email);

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const matches = await bcrypt.compare(password, user.password_hash);
    if (!matches) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Account not found.' });
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

// Any logged-in user (of any role) can change their own password.
async function updatePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await userModel.findById(req.user.id);

    const matches = await bcrypt.compare(currentPassword, user.password_hash);
    if (!matches) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await userModel.updatePassword(user.id, passwordHash);
    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    next(err);
  }
}

// Lets any logged-in user edit their own name and address from Settings.
async function updateProfile(req, res, next) {
  try {
    const { name, address } = req.body;
    const user = await userModel.updateProfile(req.user.id, { name, address });
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

module.exports = { signup, login, me, updatePassword, updateProfile };
