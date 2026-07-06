const express = require('express');
const { getOrders, getOrder, createOrder, updateOrderStatus, deleteOrder } = require('../controllers/order');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// Public can create an order via checkout
router.post('/', createOrder);

// Only admin can view all orders and update status
router.get('/', protect, authorize('admin'), getOrders);

router.route('/:id')
    .get(protect, authorize('admin'), getOrder)
    .put(protect, authorize('admin'), updateOrderStatus)
    .delete(protect, authorize('admin'), deleteOrder);

module.exports = router;
