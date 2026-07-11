const express = require('express');
const router = express.Router();
const { getAllPlatforms, getActivePlatforms, updatePlatform } = require('../controllers/socialMedia');
const { protect, authorize } = require('../middlewares/auth');

// Public route for widget
router.get('/active', getActivePlatforms);

// Protected routes for admin dashboard
router.use(protect);
router.use(authorize('admin'));

router.get('/', getAllPlatforms);
router.put('/:platform', updatePlatform);

module.exports = router;
