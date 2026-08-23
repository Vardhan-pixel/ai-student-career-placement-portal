import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import Job from '../models/Job.js';
import User from '../models/User.js';

const router = Router();

function normalise(skills = []) {
  return skills.map((skill) => skill.trim().toLowerCase()).filter(Boolean);
}

router.get('/roadmap', requireAuth, async (request, response) => {
  const user = await User.findById(request.auth.sub);
  if (!user) return response.status(404).json({ message: 'Account not found.' });

  const jobs = await Job.find({ isActive: true });
  const currentSkills = new Set(normalise(user.profile?.skills));
  const rankedJobs = jobs
    .map((job) => {
      const requirements = normalise(job.requiredSkills);
      const matched = requirements.filter((skill) => currentSkills.has(skill));
      return { job, requirements, score: requirements.length ? matched.length / requirements.length : 1 };
    })
    .sort((first, second) => second.score - first.score);

  const bestMatch = rankedJobs[0];
  const missingSkills = bestMatch ? bestMatch.requirements.filter((skill) => !currentSkills.has(skill)) : [];
  const steps = [
    currentSkills.size ? 'Keep your profile and project descriptions up to date.' : 'Add your current technical and soft skills to your student profile.',
    ...missingSkills.slice(0, 3).map((skill) => `Build one small project or complete a focused course using ${skill}.`),
    'Apply to suitable jobs and track your application progress in the portal.',
  ];

  return response.json({
    goal: user.profile?.careerGoal || 'Explore suitable placement opportunities',
    bestMatch: bestMatch ? { title: bestMatch.job.title, company: bestMatch.job.company, score: Math.round(bestMatch.score * 100) } : null,
    missingSkills,
    steps,
  });
});

export default router;
