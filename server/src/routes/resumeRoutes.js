import fs from 'fs';
import { Router } from 'express';
import path from 'path';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { requireAuth } from '../middleware/auth.js';
import { RESUME_UPLOAD_DIR, uploadResume } from '../middleware/upload.js';
import User from '../models/User.js';
import { extractSkillsFromText } from '../utils/skillKeywords.js';

const router = Router();

router.use(requireAuth);
router.use((request, response, next) => {
  if (request.auth.role !== 'student') {
    return response.status(403).json({ message: 'Only students can manage a resume.' });
  }
  return next();
});

router.get('/', async (request, response) => {
  const user = await User.findById(request.auth.sub);
  if (!user) return response.status(404).json({ message: 'Account not found.' });
  return response.json({ resume: user.profile?.resume ?? null });
});

router.post('/upload', uploadResume.single('resume'), async (request, response) => {
  if (!request.file) {
    return response.status(400).json({ message: 'Attach a PDF resume to upload.' });
  }

  const user = await User.findById(request.auth.sub);
  if (!user) {
    fs.unlink(request.file.path, () => {});
    return response.status(404).json({ message: 'Account not found.' });
  }

  try {
    const buffer = fs.readFileSync(request.file.path);
    const parsed = await pdfParse(buffer);
    const skills = extractSkillsFromText(parsed.text);

    const previousFileName = user.profile?.resume?.fileName;
    user.profile.resume = {
      fileName: request.file.filename,
      originalName: request.file.originalname,
      skills,
      uploadedAt: new Date(),
    };
    await user.save();

    if (previousFileName && previousFileName !== request.file.filename) {
      fs.unlink(path.join(RESUME_UPLOAD_DIR, previousFileName), () => {});
    }

    return response.json({
      message: 'Resume uploaded and analyzed.',
      resume: user.profile.resume,
    });
  } catch {
    fs.unlink(request.file.path, () => {});
    return response.status(422).json({ message: 'Could not read that PDF. Try re-exporting it and upload again.' });
  }
});

router.get('/download', async (request, response) => {
  const user = await User.findById(request.auth.sub);
  const fileName = user?.profile?.resume?.fileName;
  if (!fileName) return response.status(404).json({ message: 'No resume uploaded yet.' });

  const filePath = path.join(RESUME_UPLOAD_DIR, fileName);
  if (!fs.existsSync(filePath)) return response.status(404).json({ message: 'Resume file is missing on the server.' });

  return response.download(filePath, user.profile.resume.originalName || 'resume.pdf');
});

export default router;
