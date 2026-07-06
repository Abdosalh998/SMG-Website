const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    siteNameEn: { type: String, default: 'SMG Store' },
    siteNameAr: { type: String, default: 'متجر SMG' },
    whatsappNumber: { type: String, default: '+201207227467' },
    contactEmail: { type: String, default: 'support@smg.com' },
    seoTitleEn: { type: String, default: 'SMG - Premium E-Commerce Platform' },
    seoTitleAr: { type: String, default: 'SMG - منصة التسوق الإلكتروني المتميزة' },
    seoDescriptionEn: { type: String, default: 'Discover premium products at SMG.' },
    seoDescriptionAr: { type: String, default: 'اكتشف منتجات متميزة في SMG.' },
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
