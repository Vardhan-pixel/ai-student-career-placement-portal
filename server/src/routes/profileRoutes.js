import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import User from '../models/User.js';

const router = Router();

router.use(requireAuth);

async function findSignedInUser(request, response) {
  const user = await User.findById(request.auth.sub);
  if (!user) {
    response.status(404).json({ message: 'Account not found.' });
    return null;
  }
  return user;
}

router.get('/', async (request, response) => {
  const user = await findSignedInUser(request, response);
  if (!user) return;
  return response.json({ profile: user.profile ?? {} });
});

router.put('/', async (request, response) => {
  const user = await findSignedInUser(request, response);
  if (!user) return;

  const { education = {}, skills = [], projects = '', careerGoal = '' } = request.body;
  if (!Array.isArray(skills)) {
    return response.status(400).json({ message: 'Skills must be a list.' });
  }

  user.profile = {
    education: {
      college: education.college ?? '',
      degree: education.degree ?? '',
      branch: education.branch ?? '',
      graduationYear: education.graduationYear || undefined,
      cgpa: education.cgpa || undefined,
    },
    skills: skills.map((skill) => skill.trim()).filter(Boolean),
    projects,
    careerGoal,
    resume: user.profile?.resume,
  };
  await user.save();

  return response.json({ message: 'Profile saved.', profile: user.profile });
});

export default router;
