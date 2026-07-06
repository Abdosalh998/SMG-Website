const express = require('express');
const router = express.Router();
const {
    getShippings,
    createShipping,
    updateShipping,
    deleteShipping
} = require('../controllers/shipping');

const { protect, authorize } = require('../middlewares/auth');

router.route('/')
    .get(getShippings)
    .post(protect, authorize('admin'), createShipping);

router.route('/:id')
    .put(protect, authorize('admin'), updateShipping)
    .delete(protect, authorize('admin'), deleteShipping);

module.exports = router;
