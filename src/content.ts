import { isStudentSite } from './core.mjs';
import { mountEnhancements } from './enhance';
import './ui/interface.css';
if (isStudentSite(location.href) && !(globalThis as any).__ojModernStudent) {
  (globalThis as any).__ojModernStudent = true;
  mountEnhancements();
}
