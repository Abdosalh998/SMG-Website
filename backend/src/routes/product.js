const express = require('express');
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct } = require('../controllers/product');
const { protect, authorize } = require('../middlewares/auth');
const { upload, processImage } = require('../middlewares/upload');

const router = express.Router();

router.route('/')
    .get(getProducts)
    .post(protect, authorize('admin'), upload.array('images', 5), processImage, createProduct);

router.route('/:id')
    .get(getProduct)
    .put(protect, authorize('admin'), upload.array('images', 5), processImage, updateProduct)
    .delete(protect, authorize('admin'), deleteProduct);

module.exports = router;
