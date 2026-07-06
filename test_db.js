const mongoose = require('mongoose');
const Product = require('./backend/src/models/Product');
const Order = require('./backend/src/models/Order');

mongoose.connect('mongodb://127.0.0.1:27017/smg_db').then(async () => {
    const orders = await Order.find();
    if(orders.length > 0) {
        console.log('Order Items:', orders[0].orderItems);
    }
    const products = await Product.find();
    const productWithVariants = products.find(p => p.variants && p.variants.length > 0);
    if(productWithVariants) {
        console.log('Product with variants:', productWithVariants._id, productWithVariants.variants.map(v => ({id: v._id, qty: v.quantity})));
    }
    mongoose.disconnect();
});
