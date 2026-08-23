import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'recruiter', 'admin'],
      default: 'student',
    },
    profile: {
      education: {
        college: { type: String, trim: true, maxlength: 160 },
        degree: { type: String, trim: true, maxlength: 100 },
        branch: { type: String, trim: true, maxlength: 100 },
        graduationYear: { type: Number, min: 2000, max: 2100 },
        cgpa: { type: Number, min: 0, max: 10 },
      },
      skills: [{ type: String, trim: true, maxlength: 50 }],
      projects: { type: String, trim: true, maxlength: 2000 },
      careerGoal: { type: String, trim: true, maxlength: 500 },
    },
  },
  { timestamps: true },
);

export default mongoose.model('User', userSchema);
