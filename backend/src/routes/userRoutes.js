const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const { handleValidation, ratingRule } = require('../middleware/validate');

const router = express.Router();

router.use(authenticate, requireRole('user'));

router.get('/stores', userController.listStores);

router.post(
  '/ratings',
  [body('storeId').isInt().withMessage('A valid store is required.'), ratingRule, handleValidation],
  userController.submitRating
);

module.exports = router;
