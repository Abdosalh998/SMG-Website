const mongoose = require('mongoose');

const shippingSchema = new mongoose.Schema({
    governorateEn: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    governorateAr: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    cost: {
        type: Number,
        required: true,
        min: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Shipping', shippingSchema);
