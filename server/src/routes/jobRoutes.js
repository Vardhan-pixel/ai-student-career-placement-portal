import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/User.js';

const router = Router();

function normaliseSkills(skills = []) {
  return skills.map((skill) => skill.trim().toLowerCase()).filter(Boolean);
}

function matchScore(job, skills) {
  const requirements = normaliseSkills(job.requiredSkills);
  if (!requirements.length) return 100;
  const studentSkills = new Set(normaliseSkills(skills));
  const matches = requirements.filter((skill) => studentSkills.has(skill)).length;
  return Math.round((matches / requirements.length) * 100);
}

router.get('/', async (_request, response) => {
  const jobs = await Job.find({ isActive: true }).sort({ createdAt: -1 });
  return response.json({ jobs });
});

router.get('/recommended', requireAuth, async (request, response) => {
  const user = await User.findById(request.auth.sub);
  if (!user) return response.status(404).json({ message: 'Account not found.' });

  const jobs = await Job.find({ isActive: true }).sort({ createdAt: -1 });
  const recommendations = jobs
    .map((job) => ({ ...job.toObject(), matchScore: matchScore(job, user.profile?.skills) }))
    .sort((first, second) => second.matchScore - first.matchScore);

  return response.json({ jobs: recommendations });
});

router.post('/:jobId/apply', requireAuth, async (request, response) => {
  if (request.auth.role !== 'student') {
    return response.status(403).json({ message: 'Only student accounts can apply for jobs.' });
  }
  const job = await Job.findOne({ _id: request.params.jobId, isActive: true });
  if (!job) return response.status(404).json({ message: 'This job is no longer available.' });

  try {
    const application = await Application.create({ student: request.auth.sub, job: job._id });
    return response.status(201).json({ message: 'Application submitted.', application });
  } catch (error) {
    if (error.code === 11000) {
      return response.status(409).json({ message: 'You have already applied for this job.' });
    }
    throw error;
  }
});

export default router;
