const Brand = require('../models/Brand');

const parseFormDataBody = (body) => {
    const result = {};
    for (const key in body) {
        const bracketMatch = key.match(/^(\w+)\[(\w+)\]$/);
        if (bracketMatch) {
            const [, parent, child] = bracketMatch;
            if (!result[parent]) result[parent] = {};
            result[parent][child] = body[key];
        } else {
            result[key] = body[key];
        }
    }
    return result;
};

exports.getBrands = async (req, res) => {
    try {
        const brands = await Brand.find();
        res.status(200).json({ success: true, count: brands.length, data: brands });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.getBrand = async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) return res.status(404).json({ success: false, error: 'Not found' });
        res.status(200).json({ success: true, data: brand });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.createBrand = async (req, res) => {
    try {
        const data = parseFormDataBody(req.body);
        console.log('Creating brand with data:', data);
        const brand = await Brand.create(data);
        res.status(201).json({ success: true, data: brand });
    } catch (err) {
        console.error('Create Brand Error:', err);
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.updateBrand = async (req, res) => {
    try {
        const data = parseFormDataBody(req.body);
        const brand = await Brand.findByIdAndUpdate(req.params.id, data, {
            new: true,
            runValidators: true
        });
        if (!brand) return res.status(404).json({ success: false, error: 'Not found' });
        res.status(200).json({ success: true, data: brand });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.deleteBrand = async (req, res) => {
    try {
        const brand = await Brand.findByIdAndDelete(req.params.id);
        if (!brand) return res.status(404).json({ success: false, error: 'Not found' });
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
