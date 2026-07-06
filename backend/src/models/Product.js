const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        en: {
            type: String,
            required: [true, 'Please add a product name in English'],
            trim: true,
        },
        ar: {
            type: String,
            required: [true, 'Please add a product name in Arabic'],
            trim: true,
        }
    },
    description: {
        en: {
            type: String,
            required: [true, 'Please add a description in English'],
        },
        ar: {
            type: String,
            required: [true, 'Please add a description in Arabic'],
        }
    },
    price: {
        type: Number,
        // Optional, as variants will dictate price if they exist
    },
    discountPrice: {
        type: Number,
    },
    quantity: {
        type: Number,
        default: 0,
        // Optional for the root if variants are used
    },
    category: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        required: true,
    },
    brand: {
        type: mongoose.Schema.ObjectId,
        ref: 'Brand',
    },
    images: {
        type: [String],
        default: [],
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    variants: [{
        size: { type: String, trim: true },
        power: { type: String, trim: true },
        price: { type: Number, required: true },
        discountPrice: { type: Number },
        quantity: { type: Number, default: 0, required: true }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
