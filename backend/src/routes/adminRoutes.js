const express = require('express');
const { body } = require('express-validator');
const adminController = require('../controllers/adminController');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const { handleValidation, nameRule, emailRule, addressRule, passwordRule, descriptionRule } = require('../middleware/validate');

const router = express.Router();

// Every route here requires a logged-in administrator.
router.use(authenticate, requireRole('admin'));

router.get('/dashboard', adminController.getDashboard);

router.post(
  '/users',
  [nameRule, emailRule, addressRule, passwordRule('password'), handleValidation],
  adminController.createUser
);

router.get('/users', adminController.listUsers);
router.get('/users/:id', adminController.getUserDetail);
router.get('/store-owners/unassigned', adminController.listUnassignedOwners);

router.post(
  '/stores',
  [
    body('name').trim().isLength({ min: 1, max: 60 }).withMessage('Store name must be at most 60 characters.'),
    emailRule,
    addressRule,
    descriptionRule,
    handleValidation,
  ],
  adminController.createStore
);

router.get('/stores', adminController.listStores);

module.exports = router;
