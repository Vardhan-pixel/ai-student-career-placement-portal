import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import Application from '../models/Application.js';
import Job from '../models/Job.js';

const router = Router();

router.use(requireAuth);
router.use((request, response, next) => {
  if (request.auth.role !== 'recruiter') {
    return response.status(403).json({ message: 'Recruiter access is required.' });
  }
  return next();
});

router.get('/jobs', async (request, response) => {
  const jobs = await Job.find({ postedBy: request.auth.sub }).sort({ createdAt: -1 });
  return response.json({ jobs });
});

router.post('/jobs', async (request, response) => {
  const { title, company, location, workMode, description, requiredSkills, minCgpa, branches } = request.body;
  if (!title || !company || !location || !description) {
    return response.status(400).json({ message: 'Title, company, location, and description are required.' });
  }
  if (!Array.isArray(requiredSkills)) {
    return response.status(400).json({ message: 'Required skills must be a list.' });
  }

  const job = await Job.create({
    title,
    company,
    location,
    workMode: workMode ?? 'On-site',
    description,
    requiredSkills: requiredSkills.map((skill) => skill.trim()).filter(Boolean),
    minCgpa: minCgpa || 0,
    branches: Array.isArray(branches) ? branches.map((branch) => branch.trim()).filter(Boolean) : [],
    postedBy: request.auth.sub,
  });
  return response.status(201).json({ message: 'Job posted.', job });
});

router.get('/jobs/:jobId/applications', async (request, response) => {
  const job = await Job.findOne({ _id: request.params.jobId, postedBy: request.auth.sub });
  if (!job) return response.status(404).json({ message: 'Job not found.' });

  const applications = await Application.find({ job: job._id })
    .populate('student', 'name email profile.education profile.skills profile.projects')
    .sort({ createdAt: -1 });
  return response.json({ job: { id: job._id, title: job.title }, applications });
});

router.patch('/applications/:applicationId', async (request, response) => {
  const allowedStatuses = ['shortlisted', 'rejected', 'selected'];
  if (!allowedStatuses.includes(request.body.status)) {
    return response.status(400).json({ message: 'Choose shortlisted, rejected, or selected.' });
  }

  const application = await Application.findById(request.params.applicationId).populate('job');
  if (!application || application.job.postedBy?.toString() !== request.auth.sub) {
    return response.status(404).json({ message: 'Application not found.' });
  }
  application.status = request.body.status;
  await application.save();
  return response.json({ message: 'Application status updated.', application });
});

export default router;
