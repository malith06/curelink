require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../modules/users/user.model');

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('Missing MONGODB_URI in env');
      process.exit(1);
    }
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    // Check if an admin already exists
    const existingAdmin = await User.findOne({ role: 'ADMIN' });
    if (existingAdmin) {
      console.log('Admin already exists with email:', existingAdmin.email);
      process.exit(0);
    }

    // Create default admin
    const admin = await User.create({
      fullName: 'System Administrator',
      email: 'admin@curelink.com',
      phone: '0000000000',
      passwordHash: 'admin123',
      role: 'ADMIN',
      isActive: true,
      emailVerified: true
    });

    console.log(`Successfully created Admin account. Email: admin@curelink.com | Password: admin123`);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

seedAdmin();
