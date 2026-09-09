const { body, validationResult } = require('express-validator');

// Runs after any set of validator rules; returns a 422 with field-level messages.
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Please correct the highlighted fields.',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

// Shared field rules, per the assignment's validation requirements.
const nameRule = body('name')
  .trim()
  .isLength({ min: 1, max: 60 })
  .withMessage('Name must be between 1 and 60 characters.');

const descriptionRule = body('description')
  .optional({ checkFalsy: true })
  .trim()
  .isLength({ max: 1000 })
  .withMessage('Description must be at most 1000 characters.');

const emailRule = body('email')
  .trim()
  .isEmail()
  .withMessage('Enter a valid email address.')
  .normalizeEmail();

const addressRule = body('address')
  .trim()
  .isLength({ max: 400 })
  .withMessage('Address must be at most 400 characters.');

const passwordRule = (field = 'password') =>
  body(field)
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be 8-16 characters long.')
    .matches(/[A-Z]/)
    .withMessage('Password must include at least one uppercase letter.')
    .matches(/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/;'`~]/)
    .withMessage('Password must include at least one special character.');

const ratingRule = body('rating')
  .isInt({ min: 1, max: 5 })
  .withMessage('Rating must be a whole number from 1 to 5.');

module.exports = {
  handleValidation,
  nameRule,
  emailRule,
  addressRule,
  passwordRule,
  descriptionRule,
  ratingRule,
};
