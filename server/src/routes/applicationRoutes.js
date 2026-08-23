import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import Application from '../models/Application.js';

const router = Router();

router.get('/me', requireAuth, async (request, response) => {
  const applications = await Application.find({ student: request.auth.sub })
    .populate('job', 'title company location workMode')
    .sort({ createdAt: -1 });
  return response.json({ applications });
});

export default router;
