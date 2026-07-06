const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const Order = require('./src/models/Order');

mongoose.connect('mongodb://127.0.0.1:27017/smg_ecommerce').then(async () => {
    const orders = await Order.find().sort({createdAt: -1}).limit(1);
    if(orders.length > 0) {
        console.log('Order Items:', orders[0].orderItems);
    }
    const products = await Product.find({ variants: { $exists: true, $not: { $size: 0 } } });
    if(products.length > 0) {
        console.log('Product with variants:', products[0]._id, products[0].name.en, products[0].variants.map(v => ({id: v._id, qty: v.quantity})));
    }
    mongoose.disconnect();
}).catch(console.error);
