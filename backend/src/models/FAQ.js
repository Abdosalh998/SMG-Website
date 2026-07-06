const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
    questionEn: {
        type: String,
        required: true,
        trim: true
    },
    questionAr: {
        type: String,
        required: true,
        trim: true
    },
    answerEn: {
        type: String,
        required: true,
        trim: true
    },
    answerAr: {
        type: String,
        required: true,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('FAQ', faqSchema);
