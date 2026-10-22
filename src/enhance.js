import { DEFAULT_SETTINGS, REPOSITORY, newerVersion, sampleKind } from './core.mjs';
import { ensureShell, ensurePersonalHistory, ensureSubmissionView, mountAction, mountEditorTools, mountScore, pruneMounts } from './ui/mount';
import { enhanceSubmissionHistory } from './submissions.mjs';
import { bindInlineSubmission } from './inline-submission.mjs';

export function mountEnhancements() {
const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};
const ui = node => { node.dataset.omsUi = ''; return node; };
const button = (text, handler) => {
  const node = ui(el('span', 'oms-control oms-ui'));
  mountAction(node,text,handler,text.startsWith('复制')); return node;
};
let settings = { ...DEFAULT_SETTINGS };
let toastTimer;
function toast(text) {
  let node = document.querySelector('#oms-toast');
  if (!node) { node = ui(el('div', 'oms-toast')); node.id = 'oms-toast'; node.setAttribute('role', 'status'); document.body.append(node); }
  node.textContent = text; node.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { node.hidden = true; }, 3000);
}
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); toast('已复制'); }
  catch { toast('复制失败，请允许剪贴板访问后重试'); }
}
function enhanceStatement(root) {
  // Math-rendered sample numbers are normalized from their source, not visual duplicates.
  let kind = null, sampleHeading = null;
  for (const node of root.querySelectorAll('h1,h2,h3,h4,h5,h6,pre')) {
    if (/^H\d$/.test(node.tagName)) {
      const heading = node.cloneNode(true);
      heading.querySelectorAll('[data-oms-ui],.MathJax,.MathJax_Preview,.MathJax_Display,.MathJax_SVG,.MathJax_SVG_Display,.MJX_Assistive_MathML').forEach(n => n.remove());
      kind = sampleKind(heading.textContent); sampleHeading = node;
    } else if (kind && !('omsSample' in node.dataset)) {
      node.dataset.omsSample = '';
      const label = kind === 'input' ? '复制输入' : '复制输出';
      const control = button(label, () => {
        const copy = node.cloneNode(true); copy.querySelectorAll('[data-oms-ui]').forEach(n => n.remove());
        void copyText(copy.textContent);
      });
      control.classList.add('oms-sample-copy');
      control.setAttribute('aria-label', label + '样例');
      node.classList.add('oms-sample');
      if (sampleHeading) { sampleHeading.classList.add('oms-sample-heading'); sampleHeading.append(control); }
      else node.before(control);
    }
  }
}
function enhanceEditor(textarea) {
  if ('omsEditor' in textarea.dataset) return;
  textarea.dataset.omsEditor = '';
  textarea.classList.add('oms-editor');
  textarea.spellcheck = false; textarea.wrap = 'off';
  textarea.setAttribute('autocapitalize', 'off'); textarea.setAttribute('autocomplete', 'off');
  const modal = textarea.closest('.modal'); modal?.classList.add('oms-submit-modal');
  const tools = ui(el('div', 'oms-editor-host oms-ui'));
  textarea.before(tools); mountEditorTools(tools,textarea,text=>{void copyText(text);});
  const status = ui(el('div', 'oms-editor-status', 'Tab 缩进 · Shift+Tab 取消缩进 · Esc 后按 Tab 移出编辑器'));
  textarea.after(status);
  textarea.setAttribute('aria-label', '源代码');
  status.id = 'oms-editor-help-' + document.querySelectorAll('.oms-editor').length;
  textarea.setAttribute('aria-describedby', status.id);
  let escapeTab = false;
  textarea.addEventListener('keydown', event => {
    if (event.key === 'Escape') { escapeTab = true; return; }
    if (event.key !== 'Tab' || event.ctrlKey || event.metaKey || event.altKey) { escapeTab = false; return; }
    if (escapeTab) { escapeTab = false; return; }
    event.preventDefault();
    const start = textarea.selectionStart, end = textarea.selectionEnd;
    const lineStart = textarea.value.lastIndexOf('\n', start - 1) + 1;
    if (event.shiftKey) {
      const selection = textarea.value.slice(lineStart, end);
      const changed = selection.replace(/^( {1,4}|\t)/gm, '');
      const firstRemoved = selection.length - selection.replace(/^( {1,4}|\t)/, '').length;
      textarea.setRangeText(changed, lineStart, end, 'select');
      textarea.setSelectionRange(Math.max(lineStart, start - firstRemoved), end - (selection.length - changed.length));
    } else if (start !== end) {
      const selection = textarea.value.slice(lineStart, end), changed = selection.replace(/^/gm, '    ');
      textarea.setRangeText(changed, lineStart, end, 'select');
      textarea.setSelectionRange(start + 4, end + changed.length - selection.length);
    } else textarea.setRangeText('    ', start, end, 'end');
    // Native input events keep Angular ng-model and the original form in sync.
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  });

}
function enhance() {
  pruneMounts();
  document.documentElement.classList.toggle('oms-theme', settings.theme);
  if (settings.theme) {
    ensureSubmissionView(text=>{void copyText(text);});
    ensureShell(chrome.runtime.getManifest().version);
    for (const page of document.querySelectorAll('#page,[ng-view]')) {
      const columns = [...page.children].filter(node => node.matches('div[class*="col-"]'));
      const inContest = document.documentElement.classList.contains('oms-contest-page');
      if (columns.length >= 2 && (inContest || columns.some(node => node.querySelector('.markdown-body')))) {
        page.classList.add('oms-columns');
        columns.forEach(node => {
          node.classList.toggle('oms-main', !!node.querySelector('.markdown-body') || inContest && node.matches('.col-lg-8,.col-lg-10'));
          node.classList.toggle('oms-empty-aside', !node.textContent.trim() && !node.querySelector('input,button,a,img'));
        });
        if (inContest) {
          const navigation = columns.find(node=>node.querySelector('.form-horizontal .list-group-item'));
          if (navigation) {
            navigation.classList.add('oms-contest-toolbar');
            navigation.querySelector('[ng-include="\'detail/time.html\'"]')?.classList.add('oms-contest-clock');
            const questions = navigation.querySelector('[ng-include="\'detail/detail-question.html\'"]');
            if (questions && !questions.closest('details')) {
              const details=el('details','oms-contest-notices'), summary=el('summary','','公告与提问');
              questions.before(details);details.append(summary,questions);
            }
          }
        }
      }
    }
    for (const table of document.querySelectorAll('#page table.table,[ng-view] table.table')) {
      if (table.closest('.oms-table-wrap,.modal,.markdown-body') || table.parentElement.closest('table')) continue;
      const wrap = el('div', 'oms-table-wrap'); table.before(wrap); wrap.append(table);
    }
    enhanceSubmissionHistory(document, location.href, mountScore);
    const history=ensurePersonalHistory();
    if(settings.submission && history)bindInlineSubmission(document.querySelector('#myModal form'),history);
    for (const control of document.querySelectorAll('[onclick*="change_page("]')) {
      control.classList.add('oms-pagination-button');
      const current=control.parentElement;
      current?.classList.add('oms-native-pagination');
      for(const sibling of current?.children || []) if (sibling.matches('.btn-success')) {sibling.classList.add('oms-pagination-current');sibling.setAttribute('aria-current','page');}
      if(control.hasAttribute('disabled')) {control.setAttribute('aria-disabled','true');control.setAttribute('tabindex','-1');}
    }
    if (document.documentElement.classList.contains('oms-contest-page')) {
      const history=document.querySelector('.oms-submission-aside');
      const submit=document.querySelector('.oms-main [data-target="#myModal"]');
      if (history && submit && !submit.parentElement.querySelector('.oms-history-link')) {
        const control=button('提交记录',()=>history.scrollIntoView({behavior:'smooth',block:'start'}));control.classList.add('oms-history-link');submit.before(control);
      }
    }
  }
  if (settings.copy) for (const root of document.querySelectorAll('.markdown-body:not(textarea)')) {
    if (root.closest('.modal') || !root.querySelector('h2,h3,pre') || !document.querySelector('.problem-title')) continue;
    enhanceStatement(root);
  }
  if (settings.submission) for (const textarea of document.querySelectorAll('textarea[name="code"],textarea#code[ng-model]')) enhanceEditor(textarea);
}
let reloadNoticeDismissed = false;
function updateNotice(state, invalidated = false) {
  if (invalidated && reloadNoticeDismissed) return;
  const old = document.querySelector('#oms-update');
  if (old) return;
  if (!invalidated && (!newerVersion(state.update?.version || '', state.version) || state.dismissedVersion === state.update.version)) return;
  const bar = ui(el('aside', 'oms-update')); bar.id = 'oms-update'; bar.setAttribute('aria-label', '扩展更新');
  const text = invalidated ? '扩展已更新或重新加载，保存代码后刷新页面以启用。' : state.channel === 'edge'
    ? `新版本 ${state.update.version} 已发布，Edge 将在商店上架后自动更新。`
    : `发现新版本 ${state.update.version}。下载并替换原扩展目录，再到扩展管理页点击“重新加载”。`;
  bar.append(el('span', '', text));
  if (invalidated) bar.append(button('刷新页面', () => {
    const hasCode = [...document.querySelectorAll('textarea[name="code"],textarea#code')].some(node => node.value);
    if (!hasCode || confirm('编辑器中有代码，请确认已保存到本地。现在刷新页面？')) location.reload();
  }));
  else { const link = el('a', 'oms-button', state.channel === 'edge' ? '查看更新说明' : '下载更新'); link.href = REPOSITORY + '/releases/latest'; link.target = '_blank'; link.rel = 'noopener noreferrer'; bar.append(link); }
  bar.append(button('稍后', () => { bar.remove(); if (invalidated) reloadNoticeDismissed = true; else void chrome.runtime.sendMessage({ type: 'dismiss', version: state.update.version }); }));
  (document.querySelector('#page,[ng-view]') || document.body).before(bar);
}
async function start() {
  try {
    const state = await chrome.runtime.sendMessage({ type: 'state' });
    if (state && !state.error) { settings = state.settings; updateNotice(state); }
  } catch (error) { console.warn('OJ Modern Student：无法读取扩展设置', error); }
  enhance();
  let pending = false;
  const observer = new MutationObserver(records => {
    if (records.every(record => record.target.closest?.('[data-oms-ui]'))) return;
    if (pending) return;
    pending = true; requestAnimationFrame(() => { pending = false; enhance(); });
  });
  observer.observe(document.body, { childList: true, subtree: true });
  setInterval(async () => {
    if (document.hidden) return;
    try { const state = await chrome.runtime.sendMessage({ type: 'state' }); if (state && !state.error) updateNotice(state); }
    catch (error) { if (/context invalidated/i.test(error.message)) updateNotice(null, true); }
  }, 60_000);
}
void start();

}
