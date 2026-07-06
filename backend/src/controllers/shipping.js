const Shipping = require('../models/Shipping');

// @desc    Get all shipping fees
// @route   GET /api/v1/shipping
// @access  Public
exports.getShippings = async (req, res) => {
    try {
        const query = req.query.isActive === 'true' ? { isActive: true } : {};
        const shippings = await Shipping.find(query).sort('governorateEn');
        res.status(200).json({ success: true, count: shippings.length, data: shippings });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Create new shipping fee
// @route   POST /api/v1/shipping
// @access  Private/Admin
exports.createShipping = async (req, res) => {
    try {
        const shipping = await Shipping.create(req.body);
        res.status(201).json({ success: true, data: shipping });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, error: 'Governorate already exists' });
        }
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update shipping fee
// @route   PUT /api/v1/shipping/:id
// @access  Private/Admin
exports.updateShipping = async (req, res) => {
    try {
        const shipping = await Shipping.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!shipping) {
            return res.status(404).json({ success: false, error: 'Not found' });
        }

        res.status(200).json({ success: true, data: shipping });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, error: 'Governorate already exists' });
        }
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete shipping fee
// @route   DELETE /api/v1/shipping/:id
// @access  Private/Admin
exports.deleteShipping = async (req, res) => {
    try {
        const shipping = await Shipping.findById(req.params.id);

        if (!shipping) {
            return res.status(404).json({ success: false, error: 'Not found' });
        }

        await shipping.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
