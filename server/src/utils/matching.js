// Combines a student's manually-entered profile skills with skills detected
// from their uploaded resume, so job matching and the career roadmap reflect
// both sources without either route needing to know about resumes directly.
export function combinedSkills(user) {
  const manual = user.profile?.skills ?? [];
  const fromResume = user.profile?.resume?.skills ?? [];
  return [...manual, ...fromResume];
}
