import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';

if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required.');
await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5_000 });

const email = 'admin@placementportal.local';
const password = 'Admin123!';
const passwordHash = await bcrypt.hash(password, 12);
await User.findOneAndUpdate(
  { email },
  { $set: { name: 'Demo Admin', email, password: passwordHash, role: 'admin' } },
  { upsert: true, new: true },
);
console.log(`Admin account ready: ${email} / ${password}`);
await mongoose.disconnect();
