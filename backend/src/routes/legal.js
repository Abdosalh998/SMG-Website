const express = require('express');
const router = express.Router();
const { getLegalPage, getLegalPages, updateLegalPage } = require('../controllers/legal');
const { protect, authorize } = require('../middlewares/auth');

router.route('/')
    .get(protect, authorize('admin'), getLegalPages);

router.route('/:slug')
    .get(getLegalPage)
    .put(protect, authorize('admin'), updateLegalPage);

module.exports = router;
