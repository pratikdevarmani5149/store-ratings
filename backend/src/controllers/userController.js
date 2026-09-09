const storeModel = require('../models/storeModel');
const ratingModel = require('../models/ratingModel');

async function listStores(req, res, next) {
  try {
    const { name, address, sortBy, sortOrder } = req.query;
    const stores = await storeModel.listStoresForUser({
      userId: req.user.id,
      name,
      address,
      sortBy,
      sortOrder,
    });
    res.json({ stores });
  } catch (err) {
    next(err);
  }
}

// Creates a new rating, or overwrites the user's existing rating for that store.
async function submitRating(req, res, next) {
  try {
    const { storeId, rating } = req.body;

    const store = await storeModel.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Store not found.' });
    }

    const saved = await ratingModel.upsert({ userId: req.user.id, storeId, rating });
    res.status(200).json({ rating: saved });
  } catch (err) {
    next(err);
  }
}

module.exports = { listStores, submitRating };
