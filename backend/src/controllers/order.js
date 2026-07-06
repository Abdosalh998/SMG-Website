const Order = require('../models/Order');
const Product = require('../models/Product');

exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('orderItems.product').sort('-createdAt');
        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('orderItems.product');
        if (!order) return res.status(404).json({ success: false, error: 'Not found' });
        res.status(200).json({ success: true, data: order });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.createOrder = async (req, res) => {
    try {
        const order = await Order.create(req.body);
        
        // Deduct stock
        for (const item of order.orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                if (item.variant && product.variants) {
                    const variant = product.variants.id(item.variant);
                    if (variant) {
                        variant.quantity = Math.max(0, Number(variant.quantity) - Number(item.quantity));
                        product.markModified('variants');
                    }
                } else {
                    product.quantity = Math.max(0, Number(product.quantity || 0) - Number(item.quantity));
                }
                await product.save();
            }
        }

        res.status(201).json({ success: true, data: order });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, error: 'Not found' });

        const oldStatus = order.orderStatus;

        if (req.body.status)        order.orderStatus   = req.body.status;
        if (req.body.orderStatus)   order.orderStatus   = req.body.orderStatus;
        if (req.body.paymentStatus) order.paymentStatus = req.body.paymentStatus;

        const newStatus = order.orderStatus;

        // ── Helper: adjust a single product's stock ──────────────────────────
        const adjustStock = async (productId, variantId, delta) => {
            // delta > 0 means RESTORE (add back to stock)
            // delta < 0 means DEDUCT (remove from stock)
            const product = await Product.findById(productId);
            if (!product) return;
            if (variantId && product.variants) {
                const variant = product.variants.id(variantId);
                if (variant) {
                    variant.quantity = Math.max(0, Number(variant.quantity) + delta);
                    product.markModified('variants');
                }
            } else {
                product.quantity = Math.max(0, Number(product.quantity || 0) + delta);
            }
            await product.save();
        };

        // ── Build a lookup key for product+variant ────────────────────────────
        const itemKey = (item) => `${item.product}_${item.variant || ''}`;

        // ── 1. Status-change stock adjustment (Cancelled ↔ Active) ────────────
        if (oldStatus !== 'Cancelled' && newStatus === 'Cancelled') {
            // Order cancelled → restore ALL current items
            for (const item of order.orderItems) {
                await adjustStock(item.product, item.variant, +Number(item.quantity));
            }
        } else if (oldStatus === 'Cancelled' && newStatus !== 'Cancelled') {
            // Order un-cancelled → deduct ALL new items (applied below after items update)
            // We handle this after updating orderItems
        }

        // ── 2. Order-items edit stock reconciliation ──────────────────────────
        if (req.body.orderItems && Array.isArray(req.body.orderItems) && newStatus !== 'Cancelled') {
            // Map old items by key → total old quantity
            const oldMap = {};
            for (const item of order.orderItems) {
                const key = itemKey(item);
                if (!oldMap[key]) {
                    oldMap[key] = { qty: 0, productId: String(item.product), variantId: item.variant ? String(item.variant) : null };
                }
                oldMap[key].qty += Number(item.quantity);
            }

            // Map new items by key → total new quantity
            const newMap = {};
            for (const item of req.body.orderItems) {
                const key = `${item.product}_${item.variant || ''}`;
                if (!newMap[key]) {
                    newMap[key] = { qty: 0, productId: String(item.product), variantId: item.variant || null };
                }
                newMap[key].qty += Number(item.quantity);
            }

            // Restore stock for items removed or quantity decreased
            for (const [key, old] of Object.entries(oldMap)) {
                const fresh = newMap[key];
                if (!fresh) {
                    // Item fully removed → restore full old qty
                    await adjustStock(old.productId, old.variantId, +old.qty);
                } else if (fresh.qty < old.qty) {
                    // Quantity reduced → restore the difference
                    await adjustStock(old.productId, old.variantId, old.qty - fresh.qty);
                }
            }

            // Deduct stock for items added or quantity increased
            for (const [key, fresh] of Object.entries(newMap)) {
                const old = oldMap[key];
                if (!old) {
                    // Brand new item → deduct full new qty
                    await adjustStock(fresh.productId, fresh.variantId, -fresh.qty);
                } else if (fresh.qty > old.qty) {
                    // Quantity increased → deduct the difference
                    await adjustStock(fresh.productId, fresh.variantId, -(fresh.qty - old.qty));
                }
            }
        }

        // If un-cancelling and no new items sent, deduct existing items
        if (oldStatus === 'Cancelled' && newStatus !== 'Cancelled' && !req.body.orderItems) {
            for (const item of order.orderItems) {
                await adjustStock(item.product, item.variant, -Number(item.quantity));
            }
        }

        // ── 3. Update editable fields ─────────────────────────────────────────
        if (req.body.customerName !== undefined) order.customerName = req.body.customerName;
        if (req.body.phone !== undefined)        order.phone        = req.body.phone;
        if (req.body.address !== undefined)      order.address      = req.body.address;
        if (req.body.notes !== undefined)        order.notes        = req.body.notes;
        if (req.body.totalAmount !== undefined)  order.totalAmount  = req.body.totalAmount;

        if (req.body.orderItems && Array.isArray(req.body.orderItems)) {
            order.orderItems = req.body.orderItems;
        }

        await order.save();
        res.status(200).json({ success: true, data: order });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, error: 'Not found' });

        // Restore stock
        for (const item of order.orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                if (item.variant && product.variants) {
                    const variant = product.variants.id(item.variant);
                    if (variant) {
                        variant.quantity = Number(variant.quantity) + Number(item.quantity);
                        product.markModified('variants');
                    }
                } else {
                    product.quantity = Number(product.quantity || 0) + Number(item.quantity);
                }
                await product.save();
            }
        }

        await order.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
