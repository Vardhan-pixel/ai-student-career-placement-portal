import bcrypt from 'bcryptjs';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = Router();

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}

function createToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' },
  );
}

router.post('/register', async (request, response) => {
  const { name, email, password } = request.body;

  if (!name || !email || !password) {
    return response.status(400).json({ message: 'Name, email, and password are required.' });
  }
  if (password.length < 8) {
    return response.status(400).json({ message: 'Password must be at least 8 characters.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return response.status(409).json({ message: 'An account with this email already exists.' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  // Public registration is intentionally student-only. Recruiter/admin accounts
  // will be created through protected admin workflows in a later phase.
  const user = await User.create({ name, email: normalizedEmail, password: passwordHash, role: 'student' });
  const token = createToken(user);

  return response.status(201).json({ token, user: publicUser(user) });
});

router.post('/login', async (request, response) => {
  const { email, password } = request.body;

  if (!email || !password) {
    return response.status(400).json({ message: 'Email and password are required.' });
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return response.status(401).json({ message: 'Invalid email or password.' });
  }

  return response.json({ token: createToken(user), user: publicUser(user) });
});

export default router;
