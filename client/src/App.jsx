import { useEffect, useState } from 'react';

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5001/api';

export default function App() {
  const [health, setHealth] = useState({ state: 'checking', message: 'Checking API…' });
  const [mode, setMode] = useState('register');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [auth, setAuth] = useState(() => {
    const storedUser = localStorage.getItem('placementPortalUser');
    return storedUser ? { user: JSON.parse(storedUser) } : null;
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState({ education: {}, skills: [], projects: '', careerGoal: '' });
  const [profileStatus, setProfileStatus] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [jobStatus, setJobStatus] = useState('');

  useEffect(() => {
    fetch(`${apiUrl}/health`)
      .then(async (response) => {
        if (!response.ok) throw new Error('The API returned an error.');
        const data = await response.json();
        setHealth({
          state: 'online',
          message: `API is online. MongoDB: ${data.database}.`,
        });
      })
      .catch(() => {
        setHealth({
          state: 'offline',
          message: 'API is unavailable. Start the backend on port 5001.',
        });
      });
  }, []);

  useEffect(() => {
    if (!auth) return;
    const token = localStorage.getItem('placementPortalToken');
    setLoadingProfile(true);
    fetch(`${apiUrl}/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message ?? 'Unable to load your profile.');
        setProfile({ education: {}, skills: [], projects: '', careerGoal: '', ...data.profile });
      })
      .catch((requestError) => setProfileStatus(requestError.message))
      .finally(() => setLoadingProfile(false));
  }, [auth]);

  useEffect(() => {
    if (!auth) return;
    loadCareerData();
  }, [auth]);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await fetch(`${apiUrl}/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? 'Unable to continue.');

      localStorage.setItem('placementPortalToken', data.token);
      localStorage.setItem('placementPortalUser', JSON.stringify(data.user));
      setAuth(data);
      setForm({ name: '', email: '', password: '' });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  function signOut() {
    localStorage.removeItem('placementPortalToken');
    localStorage.removeItem('placementPortalUser');
    setAuth(null);
    setProfileStatus('');
    setJobs([]);
    setApplications([]);
  }

  async function loadCareerData() {
    const token = localStorage.getItem('placementPortalToken');
    try {
      const [jobResponse, applicationResponse] = await Promise.all([
        fetch(`${apiUrl}/jobs/recommended`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${apiUrl}/applications/me`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const jobData = await jobResponse.json();
      const applicationData = await applicationResponse.json();
      if (!jobResponse.ok) throw new Error(jobData.message ?? 'Unable to load jobs.');
      if (!applicationResponse.ok) throw new Error(applicationData.message ?? 'Unable to load applications.');
      setJobs(jobData.jobs);
      setApplications(applicationData.applications);
    } catch (requestError) {
      setJobStatus(requestError.message);
    }
  }

  async function applyForJob(jobId) {
    setJobStatus('Submitting application…');
    const token = localStorage.getItem('placementPortalToken');
    try {
      const response = await fetch(`${apiUrl}/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? 'Unable to submit your application.');
      setJobStatus('Application submitted.');
      await loadCareerData();
    } catch (requestError) {
      setJobStatus(requestError.message);
    }
  }

  function updateProfile(event) {
    const { name, value } = event.target;
    if (name.startsWith('education.')) {
      const field = name.replace('education.', '');
      setProfile({ ...profile, education: { ...profile.education, [field]: value } });
      return;
    }
    setProfile({ ...profile, [name]: value });
  }

  async function saveProfile(event) {
    event.preventDefault();
    setProfileStatus('Saving…');
    const token = localStorage.getItem('placementPortalToken');
    const payload = {
      ...profile,
      skills: typeof profile.skills === 'string' ? profile.skills.split(',') : profile.skills,
      education: {
        ...profile.education,
        graduationYear: profile.education.graduationYear ? Number(profile.education.graduationYear) : undefined,
        cgpa: profile.education.cgpa ? Number(profile.education.cgpa) : undefined,
      },
    };
    try {
      const response = await fetch(`${apiUrl}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? 'Unable to save your profile.');
      setProfile({ ...data.profile, skills: data.profile.skills.join(', ') });
      setProfileStatus('Profile saved.');
    } catch (requestError) {
      setProfileStatus(requestError.message);
    }
  }

  return (
    <main className="page-shell">
      <section className="hero" aria-labelledby="portal-title">
        <p className="eyebrow">Phase 2 · Account access</p>
        <h1 id="portal-title">Student Career &amp; Placement Portal</h1>
        <p className="intro">
          A foundation for student profiles, AI career guidance, job matching, and placement operations.
        </p>
        <div className={`health health--${health.state}`} role="status">
          <span className="health__dot" aria-hidden="true" />
          {health.message}
        </div>
        {auth ? (
          <section className="auth-card" aria-label="Signed-in account">
            <p className="eyebrow">Phase 3 · Student profile</p>
            <h2>Welcome, {auth.user.name}</h2>
            <p>You are logged in as a <strong>{auth.user.role}</strong>.</p>
            {loadingProfile ? <p>Loading your profile…</p> : (
              <form onSubmit={saveProfile}>
                <h3>Education</h3>
                <label>College<input name="education.college" value={profile.education.college ?? ''} onChange={updateProfile} placeholder="Your college" /></label>
                <div className="form-row">
                  <label>Degree<input name="education.degree" value={profile.education.degree ?? ''} onChange={updateProfile} placeholder="B.Tech" /></label>
                  <label>Branch<input name="education.branch" value={profile.education.branch ?? ''} onChange={updateProfile} placeholder="Computer Science" /></label>
                </div>
                <div className="form-row">
                  <label>Graduation year<input name="education.graduationYear" type="number" min="2000" max="2100" value={profile.education.graduationYear ?? ''} onChange={updateProfile} /></label>
                  <label>CGPA<input name="education.cgpa" type="number" min="0" max="10" step="0.01" value={profile.education.cgpa ?? ''} onChange={updateProfile} /></label>
                </div>
                <label>Skills <span>(comma-separated)</span><input name="skills" value={Array.isArray(profile.skills) ? profile.skills.join(', ') : profile.skills} onChange={updateProfile} placeholder="React, Node.js, Python" /></label>
                <label>Projects<textarea name="projects" value={profile.projects ?? ''} onChange={updateProfile} placeholder="Briefly describe your best projects" rows="4" /></label>
                <label>Career goal<textarea name="careerGoal" value={profile.careerGoal ?? ''} onChange={updateProfile} placeholder="e.g. Become a full-stack developer" rows="3" /></label>
                {profileStatus && <p className={profileStatus === 'Profile saved.' ? 'form-success' : 'form-error'} role="status">{profileStatus}</p>}
                <button className="primary-button">Save profile</button>
              </form>
            )}
            <section className="jobs-section" aria-labelledby="jobs-heading">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Phase 4 · Jobs</p>
                  <h2 id="jobs-heading">Recommended for you</h2>
                </div>
                <button type="button" className="secondary-button" onClick={loadCareerData}>Refresh jobs</button>
              </div>
              <p className="muted">Match scores compare your saved skills with each job’s required skills.</p>
              {jobStatus && <p className={jobStatus === 'Application submitted.' ? 'form-success' : 'form-error'} role="status">{jobStatus}</p>}
              <div className="job-grid">
                {jobs.map((job) => {
                  const applied = applications.some((application) => application.job?._id === job._id);
                  return (
                    <article className="job-card" key={job._id}>
                      <div className="job-card__top"><span className="match-score">{job.matchScore}% match</span><span>{job.workMode}</span></div>
                      <h3>{job.title}</h3>
                      <p className="job-company">{job.company} · {job.location}</p>
                      <p>{job.description}</p>
                      <p className="skills">{job.requiredSkills.join(' · ')}</p>
                      <button className="primary-button" disabled={applied} onClick={() => applyForJob(job._id)}>{applied ? 'Applied' : 'Apply now'}</button>
                    </article>
                  );
                })}
              </div>
              {!jobs.length && <p className="muted">No jobs yet. Run the sample-job seed command below.</p>}
            </section>
            <section className="applications-section" aria-labelledby="applications-heading">
              <h2 id="applications-heading">My applications</h2>
              {applications.length ? applications.map((application) => (
                <div className="application-row" key={application._id}>
                  <span><strong>{application.job?.title}</strong> · {application.job?.company}</span>
                  <span className="status-pill">{application.status}</span>
                </div>
              )) : <p className="muted">You have not applied to any jobs yet.</p>}
            </section>
            <button type="button" className="secondary-button" onClick={signOut}>Sign out</button>
          </section>
        ) : (
          <section className="auth-card" aria-labelledby="auth-heading">
            <div className="auth-tabs">
              <button className={mode === 'register' ? 'active' : ''} type="button" onClick={() => { setMode('register'); setError(''); }}>Create account</button>
              <button className={mode === 'login' ? 'active' : ''} type="button" onClick={() => { setMode('login'); setError(''); }}>Sign in</button>
            </div>
            <h2 id="auth-heading">{mode === 'register' ? 'Start as a student' : 'Welcome back'}</h2>
            <form onSubmit={handleSubmit}>
              {mode === 'register' && <label>Full name<input name="name" value={form.name} onChange={updateField} minLength="2" required /></label>}
              <label>Email address<input name="email" type="email" value={form.email} onChange={updateField} required /></label>
              <label>Password<input name="password" type="password" value={form.password} onChange={updateField} minLength="8" required /></label>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="primary-button" disabled={submitting}>{submitting ? 'Please wait…' : mode === 'register' ? 'Create student account' : 'Sign in'}</button>
            </form>
          </section>
        )}
      </section>
    </main>
  );
}
