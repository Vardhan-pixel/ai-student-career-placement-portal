import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';

if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required.');
await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5_000 });

const email = 'recruiter@placementportal.local';
const password = 'Recruiter123!';
const passwordHash = await bcrypt.hash(password, 12);
await User.findOneAndUpdate(
  { email },
  { $set: { name: 'Demo Recruiter', email, password: passwordHash, role: 'recruiter' } },
  { upsert: true, new: true },
);
console.log(`Recruiter account ready: ${email} / ${password}`);
await mongoose.disconnect();
