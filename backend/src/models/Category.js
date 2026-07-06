const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        en: {
            type: String,
            required: [true, 'Please add a category name in English'],
            trim: true,
        },
        ar: {
            type: String,
            required: [true, 'Please add a category name in Arabic'],
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
categorySchema.pre('save', function() {
    if (this.name && this.name.en) {
        this.slug = this.name.en.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
    }
});

module.exports = mongoose.model('Category', categorySchema);
