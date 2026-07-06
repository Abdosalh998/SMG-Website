const express = require('express');
const { getBrands, getBrand, createBrand, updateBrand, deleteBrand } = require('../controllers/brand');
const { protect, authorize } = require('../middlewares/auth');
const { upload, processImage } = require('../middlewares/upload');

const router = express.Router();

router.route('/')
    .get(getBrands)
    .post(protect, authorize('admin'), upload.single('image'), processImage, createBrand);

router.route('/:id')
    .get(getBrand)
    .put(protect, authorize('admin'), upload.single('image'), processImage, updateBrand)
    .delete(protect, authorize('admin'), deleteBrand);

module.exports = router;
