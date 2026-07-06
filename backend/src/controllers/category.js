const Category = require('../models/Category');

/**
 * Multer returns FormData bracket fields as flat strings: "name[en]" => "Metal Blower"
 * This helper converts them into nested objects: { name: { en: "Metal Blower" } }
 */
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

exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json({ success: true, count: categories.length, data: categories });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.getCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ success: false, error: 'Not found' });
        res.status(200).json({ success: true, data: category });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.createCategory = async (req, res) => {
    try {
        console.log('Raw body:', req.body);
        const data = parseFormDataBody(req.body);
        console.log('Parsed data:', data);
        const category = await Category.create(data);
        res.status(201).json({ success: true, data: category });
    } catch (err) {
        console.error('Error creating category:', err);
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const data = parseFormDataBody(req.body);
        const category = await Category.findByIdAndUpdate(req.params.id, data, {
            new: true,
            runValidators: true
        });
        if (!category) return res.status(404).json({ success: false, error: 'Not found' });
        res.status(200).json({ success: true, data: category });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).json({ success: false, error: 'Not found' });
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
