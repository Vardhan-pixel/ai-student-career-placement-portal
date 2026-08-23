import 'dotenv/config';
import mongoose from 'mongoose';
import Job from '../models/Job.js';

const sampleJobs = [
  {
    title: 'Frontend Developer Intern',
    company: 'Nova Labs',
    location: 'Bengaluru',
    workMode: 'Hybrid',
    description: 'Work with a product team to build responsive React interfaces for student-focused tools.',
    requiredSkills: ['React', 'JavaScript', 'HTML', 'CSS'],
    minCgpa: 6.5,
    branches: ['Computer Science', 'Information Technology'],
  },
  {
    title: 'Software Engineer Trainee',
    company: 'Vertex Systems',
    location: 'Hyderabad',
    workMode: 'On-site',
    description: 'Build and test web services while learning from an engineering mentor.',
    requiredSkills: ['Node.js', 'JavaScript', 'MongoDB', 'Git'],
    minCgpa: 7,
    branches: ['Computer Science', 'Information Technology', 'Electronics'],
  },
  {
    title: 'Data Analyst Intern',
    company: 'InsightWorks',
    location: 'Remote',
    workMode: 'Remote',
    description: 'Turn student and hiring data into practical dashboards and reports.',
    requiredSkills: ['Python', 'SQL', 'Excel', 'Data Analysis'],
    minCgpa: 6,
    branches: ['Computer Science', 'Mathematics', 'Statistics'],
  },
];

if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required.');
await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5_000 });
await Job.bulkWrite(sampleJobs.map((job) => ({
  updateOne: {
    filter: { title: job.title, company: job.company },
    update: { $set: job },
    upsert: true,
  },
})));
console.log(`Added or updated ${sampleJobs.length} sample jobs.`);
await mongoose.disconnect();
