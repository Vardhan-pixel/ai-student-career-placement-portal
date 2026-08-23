import 'dotenv/config';
import app from './app.js';
import { connectDatabase } from './config/database.js';

const port = Number(process.env.PORT) || 5001;

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing. Add it to server/.env before using authentication.');
  process.exit(1);
}

// Database connectivity is optional in Phase 1: keep the API available while
// MongoDB is installed locally or an Atlas URI is being configured.
void connectDatabase(process.env.MONGODB_URI);

app.listen(port, () => {
  console.log(`API listening at http://localhost:${port}`);
});
