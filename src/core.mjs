export const DEFAULT_SETTINGS = Object.freeze({ theme: true, copy: true, submission: true });
export const REPOSITORY = 'https://github.com/y38501148-max/oj-modern-student';
export const UPDATE_URL = 'https://raw.githubusercontent.com/y38501148-max/oj-modern-student/main/version.json';

export function isStudentSite(value) {
  try {
    const url = new URL(value);
    return url.origin === 'https://accoding.buaa.edu.cn';
  } catch { return false; }
}

export function newerVersion(candidate, installed) {
  if (!/^\d+\.\d+\.\d+$/.test(candidate) || !/^\d+\.\d+\.\d+$/.test(installed)) return false;
  const a = candidate.split('.').map(Number), b = installed.split('.').map(Number);
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] > b[i];
  return false;
}
