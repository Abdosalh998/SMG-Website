const Product = require('../models/Product');

/**
 * Multer returns FormData bracket fields as flat strings: "name[en]" => "Blower"
 * This helper converts them into nested objects: { name: { en: "Blower" } }
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

    // Convert numerics
    if (result.price) result.price = parseFloat(result.price);
    if (result.discountPrice) result.discountPrice = parseFloat(result.discountPrice);
    if (result.quantity) result.quantity = parseInt(result.quantity, 10);

    // Parse variants if sent as JSON string
    if (result.variants && typeof result.variants === 'string') {
        try {
            result.variants = JSON.parse(result.variants);
        } catch (e) {
            console.error('Failed to parse variants JSON', e);
            result.variants = [];
        }
    }

    // Remove empty brand to avoid ObjectId cast error
    if (!result.brand || result.brand === '' || result.brand === 'undefined') {
        delete result.brand;
    }

    return result;
};

exports.getProducts = async (req, res) => {
    try {
        const reqQuery = { ...req.query };
        const removeFields = ['select', 'sort', 'page', 'limit'];
        removeFields.forEach(param => delete reqQuery[param]);

        let queryStr = JSON.stringify(reqQuery);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        let query = Product.find(JSON.parse(queryStr)).populate('category').populate('brand');

        if (req.query.select) {
            query = query.select(req.query.select.split(',').join(' '));
        }

        query = query.sort(req.query.sort ? req.query.sort.split(',').join(' ') : '-createdAt');

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 100;
        const total = await Product.countDocuments();

        query = query.skip((page - 1) * limit).limit(limit);

        const products = await query;
        res.status(200).json({ success: true, count: products.length, total, data: products });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category').populate('brand');
        if (!product) return res.status(404).json({ success: false, error: 'Not found' });
        res.status(200).json({ success: true, data: product });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const data = parseFormDataBody(req.body);
        const product = await Product.create(data);
        res.status(201).json({ success: true, data: product });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const data = parseFormDataBody(req.body);

        // If no new images were uploaded, remove `images` key from update 
        // so existing images in the DB are preserved
        if (!data.images || data.images.length === 0) {
            delete data.images;
        }

        const product = await Product.findByIdAndUpdate(req.params.id, data, {
            new: true,
            runValidators: true
        });
        if (!product) return res.status(404).json({ success: false, error: 'Not found' });
        res.status(200).json({ success: true, data: product });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ success: false, error: 'Not found' });
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
