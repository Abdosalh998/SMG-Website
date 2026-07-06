const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
    },
    customerName: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    governorate: {
        type: String,
        required: true,
    },
    notes: {
        type: String,
    },
    orderItems: [
        {
            product: {
                type: mongoose.Schema.ObjectId,
                ref: 'Product',
                required: true,
            },
            variant: {
                type: mongoose.Schema.ObjectId
            },
            nameEn: String,
            nameAr: String,
            quantity: {
                type: Number,
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },
        }
    ],
    subTotal: {
        type: Number,
        required: true,
    },
    shippingCost: {
        type: Number,
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    paymentMethod: {
        type: String,
        default: 'WhatsApp',
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed'],
        default: 'Pending',
    },
    orderStatus: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending',
    }
}, { timestamps: true });

// Generate Order Number
orderSchema.pre('save', function() {
    if (!this.orderNumber) {
        const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
        this.orderNumber = `SMG-${Date.now().toString().slice(-4)}-${randomStr}`;
    }
});

module.exports = mongoose.model('Order', orderSchema);
