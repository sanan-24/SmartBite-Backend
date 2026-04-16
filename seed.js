import mongoose from 'mongoose';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

const seedAdmin = async () => {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await User.create({
    name: 'Admin',
    email: 'admin@gmail.com',
    password: hashedPassword,
    role: 'admin'
  });
  console.log('Admin user created');
};

seedAdmin();
