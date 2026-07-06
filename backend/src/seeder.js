const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smg_ecommerce');

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@smg.com' });
    if (adminExists) {
      console.log('Admin user already exists');
      process.exit();
    }

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@smg.com',
      password: 'password123',
      role: 'admin',
    });

    console.log('Admin user created successfully');
    console.log(`Email: ${adminUser.email}`);
    console.log(`Password: password123`);
    process.exit();
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
};

seedAdmin();
