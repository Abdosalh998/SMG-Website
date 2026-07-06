const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
    titleEn: { type: String, required: true, trim: true },
    titleAr: { type: String, required: true, trim: true },
    contentEn: { type: String, required: true, trim: true },
    contentAr: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 }
}, { _id: true });

const legalPageSchema = new mongoose.Schema({
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    titleEn: { type: String, required: true, trim: true },
    titleAr: { type: String, required: true, trim: true },
    introEn: { type: String, default: '', trim: true },
    introAr: { type: String, default: '', trim: true },
    sections: [sectionSchema],
    isActive: { type: Boolean, default: true },
    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('LegalPage', legalPageSchema);
