const SocialMedia = require('../models/SocialMedia');

// Initialize default platforms if none exist
const initializeSocialMedia = async () => {
    const count = await SocialMedia.countDocuments();
    if (count === 0) {
        await SocialMedia.insertMany([
            { platform: 'whatsapp', url: 'https://wa.me/201034322741', displayOrder: 1, isActive: true },
            { platform: 'facebook', url: 'https://www.facebook.com/share/1Dt5jJVv8Q/?mibextid=wwXIfr', displayOrder: 2, isActive: true },
            { platform: 'instagram', url: 'https://instagram.com', displayOrder: 3, isActive: false },
            { platform: 'linkedin', url: 'https://linkedin.com', displayOrder: 4, isActive: false },
            { platform: 'youtube', url: 'https://youtube.com', displayOrder: 5, isActive: false },
            { platform: 'tiktok', url: 'https://tiktok.com', displayOrder: 6, isActive: false },
            { platform: 'telegram', url: 'https://t.me', displayOrder: 7, isActive: false },
            { platform: 'twitter', url: 'https://twitter.com', displayOrder: 8, isActive: false }
        ]);
    }
};

// Call once on controller load
initializeSocialMedia().catch(console.error);

exports.getAllPlatforms = async (req, res) => {
    try {
        // Admin gets all platforms, regardless of status
        const platforms = await SocialMedia.find().sort('displayOrder');
        res.status(200).json({ success: true, data: platforms });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getActivePlatforms = async (req, res) => {
    try {
        // Public endpoint gets only active platforms
        const platforms = await SocialMedia.find({ isActive: true }).sort('displayOrder');
        res.status(200).json({ success: true, data: platforms });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updatePlatform = async (req, res) => {
    try {
        const { platform } = req.params;
        const { url, isActive, displayOrder } = req.body;

        if (url && !url.startsWith('http')) {
            return res.status(400).json({ success: false, message: 'URL must start with http or https' });
        }

        const updatedPlatform = await SocialMedia.findOneAndUpdate(
            { platform },
            { url, isActive, displayOrder },
            { new: true, runValidators: true }
        );

        if (!updatedPlatform) {
            return res.status(404).json({ success: false, message: 'Platform not found' });
        }

        res.status(200).json({ success: true, data: updatedPlatform });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
