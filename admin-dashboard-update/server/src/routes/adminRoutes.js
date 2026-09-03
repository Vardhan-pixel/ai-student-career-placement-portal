import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/User.js';

const router = Router();

router.use(requireAuth);
router.use((request, response, next) => {
  if (request.auth.role !== 'admin') {
    return response.status(403).json({ message: 'Admin access is required.' });
  }
  return next();
});

router.get('/stats', async (_request, response) => {
  const [
    totalStudents,
    totalRecruiters,
    totalJobs,
    activeJobs,
    totalApplications,
    statusBreakdown,
    topSkills,
  ] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'recruiter' }),
    Job.countDocuments({}),
    Job.countDocuments({ isActive: true }),
    Application.countDocuments({}),
    Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Job.aggregate([
      { $unwind: '$requiredSkills' },
      { $group: { _id: { $toLower: '$requiredSkills' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]),
  ]);

  const statusCounts = { applied: 0, shortlisted: 0, rejected: 0, selected: 0 };
  statusBreakdown.forEach((row) => {
    statusCounts[row._id] = row.count;
  });

  const placementRate = totalApplications
    ? Math.round((statusCounts.selected / totalApplications) * 100)
    : 0;

  return response.json({
    totals: {
      students: totalStudents,
      recruiters: totalRecruiters,
      jobs: totalJobs,
      activeJobs,
      applications: totalApplications,
    },
    statusCounts,
    placementRate,
    topSkills: topSkills.map((skill) => ({ skill: skill._id, count: skill.count })),
  });
});

export default router;
