const express = require('express');
const { getSettings, updateSettings } = require('../controllers/settings');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.route('/')
    .get(getSettings) // public to get whatsapp number
    .put(protect, authorize('admin'), updateSettings);

module.exports = router;
