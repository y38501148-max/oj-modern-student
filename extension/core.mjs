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

export function sampleKind(text) {
  const name = text.replace(/\$\s*(\d+)\s*\$/g, '$1').replace(/[\s:：#\d（）()_\-]/g, '').toLowerCase();
  if (/^(输入样例|样例输入|输入示例|示例输入|sampleinput|inputsample|exampleinput)$/.test(name)) return 'input';
  if (/^(输出样例|样例输出|输出示例|示例输出|sampleoutput|outputsample|exampleoutput)$/.test(name)) return 'output';
  return null;
}

// Retain math sources while discarding MathJax's duplicate visual/accessibility trees.
export function statementMarkdown(root, baseUrl) {
  const copy = root.cloneNode(true);
  copy.querySelectorAll('[data-oms-ui],.MathJax,.MathJax_Display,.MathJax_Preview,.MJX_Assistive_MathML,mjx-container').forEach(node => node.remove());
  copy.querySelectorAll('script[type^="math/tex"]').forEach(node => {
    const delimiter = node.type.includes('mode=display') ? '$$' : '$';
    node.replaceWith(copy.ownerDocument.createTextNode(delimiter + node.textContent + delimiter));
  });
  copy.querySelectorAll('script,style,button').forEach(node => node.remove());
  const children = node => [...node.childNodes].map(convert).join('');
  const fenceFor = text => '`'.repeat(Math.max(3, ...[...text.matchAll(/`+/g)].map(m => m[0].length + 1)));
  const link = value => { try { const u = new URL(value, baseUrl); return /^https?:$/.test(u.protocol) ? u.href : ''; } catch { return ''; } };
  function convert(node) {
    if (node.nodeType === 3) return node.textContent;
    if (node.nodeType !== 1) return '';
    const tag = node.tagName.toLowerCase();
    if (tag === 'pre') { const text = node.textContent, fence = fenceFor(text); return `\n\n${fence}\n${text}${text.endsWith('\n') ? '' : '\n'}${fence}\n\n`; }
    if (tag === 'code') { const text = node.textContent, fence = '`'.repeat(Math.max(1, ...[...text.matchAll(/`+/g)].map(m => m[0].length + 1))); return `${fence} ${text} ${fence}`; }
    if (tag === 'br') return '\n';
    if (tag === 'img') return `![${node.alt || ''}](${link(node.getAttribute('src'))})`;
    if (tag === 'a') return `[${children(node)}](${link(node.getAttribute('href'))})`;
    if (tag === 'strong' || tag === 'b') return `**${children(node)}**`;
    if (tag === 'em' || tag === 'i') return `*${children(node)}*`;
    if (/^h[1-6]$/.test(tag)) return `\n\n${'#'.repeat(Number(tag[1]))} ${children(node).trim().replace(/\s+/g, ' ')}\n\n`;
    if (tag === 'table') {
      const rows = [...node.rows].map(row => [...row.cells].map(cell => children(cell).trim().replace(/\|/g, '\\|').replace(/\n/g, '<br>')));
      if (!rows.length) return '';
      return '\n\n' + rows.map((row, i) => '| ' + row.join(' | ') + ' |' + (i === 0 ? '\n| ' + row.map(() => '---').join(' | ') + ' |' : '')).join('\n') + '\n\n';
    }
    if (tag === 'li') return `${node.parentElement.tagName === 'OL' ? [...node.parentElement.children].indexOf(node) + 1 + '.' : '-'} ${children(node).trim().replace(/\n/g, '\n  ')}\n`;
    if (tag === 'blockquote') return '\n\n' + children(node).trim().split('\n').map(line => '> ' + line).join('\n') + '\n\n';
    if (['p','div','section','ul','ol'].includes(tag)) return '\n\n' + children(node) + '\n\n';
    return children(node);
  }
  // Compact layout whitespace outside code fences; sample/code whitespace is exact.
  const lines = [], raw = children(copy).trim().split('\n');
  let fence = null;
  for (const line of raw) {
    if (fence) { lines.push(line); if (line === fence) fence = null; }
    else {
      if (/^`{3,}$/.test(line)) fence = line;
      if (line.trim() || lines.at(-1) !== '') lines.push(line);
    }
  }
  return lines.join('\n') + '\n';
}
