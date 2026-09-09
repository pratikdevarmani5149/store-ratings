const storeModel = require('../models/storeModel');

async function getDashboard(req, res, next) {
  try {
    const store = await storeModel.findByOwnerId(req.user.id);
    if (!store) {
      return res.status(404).json({ message: 'No store is linked to this account yet.' });
    }

    const [raters, { average, count }, images] = await Promise.all([
      storeModel.getRatersForStore(store.id),
      storeModel.getAverageRating(store.id),
      storeModel.listImages(store.id),
    ]);

    res.json({
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        description: store.description,
      },
      averageRating: average,
      ratingCount: count,
      raters,
      images,
    });
  } catch (err) {
    next(err);
  }
}

// Lets a store owner write or edit the description shown to visitors.
async function updateDescription(req, res, next) {
  try {
    const store = await storeModel.findByOwnerId(req.user.id);
    if (!store) {
      return res.status(404).json({ message: 'No store is linked to this account yet.' });
    }
    const updated = await storeModel.updateDescription(store.id, req.body.description);
    res.json({ store: updated });
  } catch (err) {
    next(err);
  }
}

async function addImage(req, res, next) {
  try {
    const store = await storeModel.findByOwnerId(req.user.id);
    if (!store) {
      return res.status(404).json({ message: 'No store is linked to this account yet.' });
    }
    const image = await storeModel.addImage(store.id, req.body.imageUrl);
    res.status(201).json({ image });
  } catch (err) {
    next(err);
  }
}

async function deleteImage(req, res, next) {
  try {
    const store = await storeModel.findByOwnerId(req.user.id);
    if (!store) {
      return res.status(404).json({ message: 'No store is linked to this account yet.' });
    }
    const deleted = await storeModel.deleteImage(req.params.imageId, store.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Image not found.' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboard, updateDescription, addImage, deleteImage };
