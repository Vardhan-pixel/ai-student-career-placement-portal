# AI-Powered Student Career & Placement Portal

Phase 1 provides a local development foundation:

- `client/`: React + Vite frontend
- `server/`: Node.js + Express API
- MongoDB connection scaffold through Mongoose
- A frontend-to-backend health-check request

## Prerequisites (macOS)

Install Node.js LTS with Homebrew, then confirm it is available:

```bash
brew install node
node --version
npm --version
```

MongoDB can run locally or be supplied through MongoDB Atlas. For a local MongoDB Community installation:

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

## Setup

From the project root, install the frontend and backend dependencies:

```bash
npm install --prefix client
npm install --prefix server
```

Create the local environment files (they are intentionally ignored by Git):

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

If using MongoDB Atlas, replace `MONGODB_URI` in `server/.env` with your Atlas connection string. The default points to a local database named `placement_portal`.

Set `JWT_SECRET` in `server/.env` to a long, unique value before starting the backend. This is used to sign login sessions.

## Run locally

Open two terminal windows in this folder.

```bash
npm run dev --prefix server
```

```bash
npm run dev --prefix client
```

Visit the URL printed by Vite (normally `http://localhost:5173`). The page calls `GET /api/health` and shows whether the API and MongoDB connection are available.

## API checks

```bash
curl http://localhost:5001/api/health
curl http://localhost:5001/api
```

The server starts even if MongoDB is unavailable, making it easy to verify the API first. The `/api/health` response reports the database connection state.

## Phase 2: authentication

Student self-registration and login are available at `/api/auth/register` and `/api/auth/login`. A successful request returns a JWT and public user information. The database supports `student`, `recruiter`, and `admin` roles; public sign-up intentionally creates only students. Recruiter and admin creation will be added as protected workflows.

## Phase 3: student profile

After signing in, students can save their education, skills, projects, and career goal. The profile API (`GET` and `PUT` `/api/profile`) is protected by the JWT created at login.

## Phase 4: jobs and applications

Seed the local database with three sample placement jobs:

```bash
npm run seed:jobs --prefix server
```

Signed-in students see skills-based match scores, can apply once for each job, and can track application status. The relevant API endpoints are `GET /api/jobs/recommended`, `POST /api/jobs/:jobId/apply`, and `GET /api/applications/me`.
