const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Security Middlewares
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' } // allow images to be loaded from frontend
}));
const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
    : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({ origin: corsOrigins, credentials: true }));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Make uploads static
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/category');
const brandRoutes = require('./routes/brand');
const productRoutes = require('./routes/product');
const orderRoutes = require('./routes/order');
const settingsRoutes = require('./routes/settings');
const shippingRoutes = require('./routes/shipping');
const faqRoutes = require('./routes/faq');
const legalRoutes = require('./routes/legal');
const socialMediaRoutes = require('./routes/socialMedia');

// Mount routers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/brands', brandRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/shipping', shippingRoutes);
app.use('/api/v1/faq', faqRoutes);
app.use('/api/v1/legal', legalRoutes);
app.use('/api/v1/social-media', socialMediaRoutes);

app.get('/', (req, res) => {
    res.send('SMG E-commerce API is running...');
});

// Error Handler middleware
// app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
