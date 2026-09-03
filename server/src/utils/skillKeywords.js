// A curated list of common technical skills/keywords used to scan resume
// text. Matching is case-insensitive and looks for whole-word / whole-phrase
// occurrences, so short tokens like "R" or "Go" are intentionally excluded
// to avoid false positives inside ordinary sentences.
export const SKILL_KEYWORDS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby',
  'Kotlin', 'Swift', 'HTML', 'CSS', 'SASS', 'Tailwind',
  'React', 'React Native', 'Angular', 'Vue', 'Next.js', 'Redux', 'Node.js',
  'Express', 'Django', 'Flask', 'Spring Boot', 'REST API', 'GraphQL',
  'MongoDB', 'MySQL', 'PostgreSQL', 'SQLite', 'Redis', 'Firebase',
  'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'CI/CD',
  'Git', 'GitHub', 'Linux', 'Bash',
  'Machine Learning', 'Deep Learning', 'Data Science', 'Pandas', 'NumPy',
  'TensorFlow', 'PyTorch', 'Scikit-learn', 'Data Structures', 'Algorithms',
  'Object Oriented Programming', 'System Design', 'Agile', 'Scrum',
  'Jira', 'Figma', 'UI/UX', 'Testing', 'Jest', 'Cypress',
];

/**
 * Scans free-text resume content for occurrences of known skill keywords.
 * Returns a deduplicated list using each keyword's canonical casing.
 */
export function extractSkillsFromText(text) {
  if (!text) return [];
  const normalized = text.toLowerCase();
  const found = new Set();

  for (const keyword of SKILL_KEYWORDS) {
    const escaped = keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(^|[^a-z0-9])${escaped}($|[^a-z0-9])`, 'i');
    if (pattern.test(normalized)) {
      found.add(keyword);
    }
  }

  return Array.from(found);
}
