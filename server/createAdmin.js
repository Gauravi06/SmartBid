const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected ✅');

    const existing = await User.findOne({ email: 'admin@smartbid.com' });
    if (existing) {
      console.log('Admin already exists ✅');
      process.exit();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const admin = new User({
      username: 'Admin',
      email:    'admin@smartbid.com',
      password: hashedPassword,
      role:     'admin',
      wallet:   999999
    });

    await admin.save();
    console.log('Admin created successfully ✅');
    console.log('Email:    admin@smartbid.com');
    console.log('Password: admin123');
    process.exit();
  })
  .catch(err => {
    console.log('Error:', err);
    process.exit();
  });