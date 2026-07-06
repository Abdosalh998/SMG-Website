const express = require('express');
const router = express.Router();
const {
    getFAQs,
    createFAQ,
    updateFAQ,
    deleteFAQ,
    reorderFAQs
} = require('../controllers/faq');

const { protect, authorize } = require('../middlewares/auth');

router.route('/reorder')
    .put(protect, authorize('admin'), reorderFAQs);

router.route('/')
    .get(getFAQs)
    .post(protect, authorize('admin'), createFAQ);

router.route('/:id')
    .put(protect, authorize('admin'), updateFAQ)
    .delete(protect, authorize('admin'), deleteFAQ);

module.exports = router;
