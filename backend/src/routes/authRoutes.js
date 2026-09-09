const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authenticate = require('../middleware/auth');
const { handleValidation, nameRule, emailRule, addressRule, passwordRule } = require('../middleware/validate');

const router = express.Router();

router.post(
  '/signup',
  [nameRule, emailRule, addressRule, passwordRule('password'), handleValidation],
  authController.signup
);

router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('Enter a valid email address.'),
    body('password').notEmpty().withMessage('Password is required.'),
    handleValidation,
  ],
  authController.login
);

router.get('/me', authenticate, authController.me);

router.put(
  '/profile',
  authenticate,
  [nameRule, addressRule, handleValidation],
  authController.updateProfile
);

router.put(
  '/password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required.'),
    passwordRule('newPassword'),
    handleValidation,
  ],
  authController.updatePassword
);

module.exports = router;
