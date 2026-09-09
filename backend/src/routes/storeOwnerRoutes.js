const express = require('express');
const { body } = require('express-validator');
const storeOwnerController = require('../controllers/storeOwnerController');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const { handleValidation, descriptionRule } = require('../middleware/validate');

const router = express.Router();

router.use(authenticate, requireRole('store_owner'));

router.get('/dashboard', storeOwnerController.getDashboard);

router.put('/store/description', [descriptionRule, handleValidation], storeOwnerController.updateDescription);

router.post(
  '/store/images',
  [
    body('imageUrl')
      .trim()
      .isURL({ require_protocol: true })
      .withMessage('Enter a valid image URL, starting with http:// or https://'),
    handleValidation,
  ],
  storeOwnerController.addImage
);

router.delete('/store/images/:imageId', storeOwnerController.deleteImage);

module.exports = router;
