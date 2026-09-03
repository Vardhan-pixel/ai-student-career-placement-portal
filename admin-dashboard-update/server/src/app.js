import cors from 'cors';
import express from 'express';
import { databaseStatus } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import careerRoutes from './routes/careerRoutes.js';
import recruiterRoutes from './routes/recruiterRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173' }));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/recruiter', recruiterRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api', (_request, response) => {
  response.json({ message: 'Placement Portal API is running.' });
});

app.get('/api/health', (_request, response) => {
  response.json({
    status: 'ok',
    database: databaseStatus(),
    timestamp: new Date().toISOString(),
  });
});

export default app;
