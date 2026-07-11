const mongoose = require('mongoose');

const socialMediaSchema = new mongoose.Schema({
    platform: { 
        type: String, 
        required: true, 
        unique: true,
        enum: ['whatsapp', 'facebook', 'instagram', 'linkedin', 'youtube', 'tiktok', 'telegram', 'twitter']
    },
    url: { 
        type: String, 
        required: true 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },
    displayOrder: { 
        type: Number, 
        default: 0 
    }
}, { timestamps: true });

module.exports = mongoose.model('SocialMedia', socialMediaSchema);
