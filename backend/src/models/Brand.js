const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
    name: {
        en: {
            type: String,
            required: [true, 'Please add a brand name in English'],
            trim: true,
        },
        ar: {
            type: String,
            required: [true, 'Please add a brand name in Arabic'],
            trim: true,
        }
    },
    slug: String,
    image: {
        type: String,
        default: 'no-photo.jpg'
    }
}, { timestamps: true });

// Auto-generate slug from name.en before saving
brandSchema.pre('save', function() {
    if (this.name && this.name.en) {
        this.slug = this.name.en.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
    }
});

module.exports = mongoose.model('Brand', brandSchema);
