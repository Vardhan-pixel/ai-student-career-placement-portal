ADMIN DASHBOARD UPDATE — FILES TO COPY INTO YOUR PROJECT
==========================================================

NEW FILES (create these):
  server/src/routes/adminRoutes.js
  server/src/scripts/seedAdmin.js

MODIFIED FILES (replace these, or manually apply the small diffs):
  server/src/app.js         (added 2 lines: import + app.use for adminRoutes)
  server/package.json       (added "seed:admin" script)
  client/src/App.jsx        (added AdminDashboard component + role routing)
  client/src/index.css      (added .stats-grid / .stat-card styles)

HOW TO APPLY
------------
1. Copy the two new files into your project at the paths shown above.
2. Replace your existing app.js, package.json, App.jsx, and index.css
   with the versions in this folder (they are drop-in replacements —
   nothing else in those files was touched).

HOW TO TEST
-----------
1. Restart the backend (Ctrl+C, then `npm run dev --prefix server`)
   — required so it loads the new /api/admin/stats route.
2. In a third terminal, seed the admin account:
     cd "/Users/apple/Desktop/FSD Project"
     npm run seed:admin --prefix server
   This prints:
     Admin account ready: admin@placementportal.local / Admin123!
3. Restart the frontend too (Ctrl+C, then `npm run dev --prefix client`)
   so it picks up the new AdminDashboard component.
4. Go to the site, sign out, sign in with the admin credentials above.
5. You should see the Admin Dashboard with:
     - Students / Recruiters / Jobs / Active jobs / Applications / Placement rate
     - Application status breakdown (applied/shortlisted/rejected/selected)
     - Most in-demand skills (aggregated from posted jobs' requiredSkills)

NOTES
-----
- No database migration needed — your User model already had 'admin'
  in its role enum, so no schema change was required.
- Admin routes are protected the same way recruiter routes are:
  requireAuth + a role check middleware (403 if role !== 'admin').
- All data is real-time from MongoDB aggregation queries — nothing
  is hardcoded or mocked.
