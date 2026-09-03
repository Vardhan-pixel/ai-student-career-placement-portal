import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const RESUME_UPLOAD_DIR = path.join(__dirname, '../../uploads/resumes');

fs.mkdirSync(RESUME_UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination(_request, _file, callback) {
    callback(null, RESUME_UPLOAD_DIR);
  },
  filename(request, _file, callback) {
    callback(null, `${request.auth.sub}-${Date.now()}.pdf`);
  },
});

function fileFilter(_request, file, callback) {
  if (file.mimetype !== 'application/pdf') {
    return callback(new Error('Only PDF files are accepted.'));
  }
  return callback(null, true);
}

export const uploadResume = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
