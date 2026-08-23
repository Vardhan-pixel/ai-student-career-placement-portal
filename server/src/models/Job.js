import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    company: { type: String, required: true, trim: true, maxlength: 120 },
    location: { type: String, required: true, trim: true, maxlength: 100 },
    workMode: { type: String, enum: ['On-site', 'Hybrid', 'Remote'], default: 'On-site' },
    description: { type: String, required: true, trim: true, maxlength: 3000 },
    requiredSkills: [{ type: String, trim: true, maxlength: 50 }],
    minCgpa: { type: Number, min: 0, max: 10, default: 0 },
    branches: [{ type: String, trim: true, maxlength: 100 }],
    applicationDeadline: { type: Date },
    isActive: { type: Boolean, default: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

export default mongoose.model('Job', jobSchema);
