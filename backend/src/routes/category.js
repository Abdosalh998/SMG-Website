const express = require('express');
const { getCategories, getCategory, createCategory, updateCategory, deleteCategory } = require('../controllers/category');
const { protect, authorize } = require('../middlewares/auth');
const { upload, processImage } = require('../middlewares/upload');

const router = express.Router();

router.route('/')
    .get(getCategories)
    .post(protect, authorize('admin'), upload.single('image'), processImage, createCategory);

router.route('/:id')
    .get(getCategory)
    .put(protect, authorize('admin'), upload.single('image'), processImage, updateCategory)
    .delete(protect, authorize('admin'), deleteCategory);

module.exports = router;
