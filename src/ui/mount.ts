import { createApp, h, reactive } from 'vue';
import type { App } from 'vue';
import { Button, ConfigProvider } from 'ant-design-vue';
import { CopyOutlined } from '@ant-design/icons-vue';
import Shell from './Shell.vue';
import EditorTools from './EditorTools.vue';
import PersonalHistory from './PersonalHistory.vue';
import SubmissionView from './SubmissionView.vue';
import ScoreCell from './ScoreCell.vue';
import { productTheme } from './theme';
import { readPage } from './page.mjs';
import { parseSubmissionSource, trimSourceHeader } from '../submission-source.mjs';

const mounts = new Map<HTMLElement, App>();
const scoreCells=new WeakMap<HTMLElement,{score?:string|number|null;detail?:string|null;pending:boolean;error?:string}>();
let shell: ReturnType<typeof readPage> | undefined;
let personalHistory: {submissionStarted:()=>void;submissionCreated:(row:any)=>void;submissionCancelled:()=>void;refresh:()=>void}|undefined;
export function pruneMounts() {
  for (const [host, app] of mounts) if (!host.isConnected) { app.unmount(); mounts.delete(host); }
}
export function mountAction(host: HTMLElement, label: string, handler: () => void, copy = false) {
  const app = createApp({ render: () => h(ConfigProvider,{prefixCls:'oms-ant',theme:productTheme},()=>h(Button,{onClick:handler,size:'small'}, {default:()=>label,...(copy?{icon:()=>h(CopyOutlined)}:{})})) });
  app.mount(host); mounts.set(host, app);
}
export function mountScore(host:HTMLElement,submission:any) {
  const props={score:submission.score,detail:submission.detail,pending:submission.result==='WT' || submission.result==='JG',error:submission.error};
  const existing=scoreCells.get(host);
  if(existing){Object.assign(existing,props);return;}
  const state=reactive(props);scoreCells.set(host,state);
  const app=createApp({render:()=>h(ConfigProvider,{prefixCls:'oms-ant',theme:productTheme},()=>h(ScoreCell,state))});
  app.mount(host);mounts.set(host,app);
}
export function mountEditorTools(host: HTMLElement, textarea: HTMLTextAreaElement, copy: (text: string) => void) {
  const app = createApp(EditorTools,{textarea,copy}); app.mount(host); mounts.set(host, app);
}
export function ensureSubmissionView(copy:(text:string)=>void) {
  const id=location.pathname.match(/^\/submission\/(\d+)\/?$/)?.[1];
  if(!id || document.querySelector('#oms-code-app'))return;
  const source=document.querySelector<HTMLPreElement>('body>pre'), code=source?.querySelector('code');
  if(!source || !code)return;
  const submission=parseSubmissionSource(code.textContent,id);
  if(!submission)return;
  trimSourceHeader(code,submission.prefix);
  const host=document.createElement('div');host.id='oms-code-app';host.dataset.omsUi='';document.body.prepend(host);
  document.documentElement.classList.add('oms-submission-page');
  const app=createApp(SubmissionView,{submission,source,copy});app.mount(host);mounts.set(host,app);
}
export function ensurePersonalHistory() {
  const problem=location.pathname.match(/^\/problem\/(\d+)\/index\/?$/);
  if (!problem) return;
  if(document.querySelector('.oms-personal-history'))return personalHistory;
  const heading=[...document.querySelectorAll('#page h4')].find(node=>node.textContent?.trim()==='相关推荐');
  if (!heading) return;
  const host=document.createElement('section');host.className='oms-personal-history oms-submission-aside oms-ui';host.dataset.omsUi='';
  let next=heading.nextElementSibling;
  while(next && !next.matches('script,.modal')) {const sibling=next.nextElementSibling;next.remove();next=sibling;}
  heading.replaceWith(host);
  const csrf=document.querySelector<HTMLInputElement>('input[name="_csrf"]')?.value || '';
  const app=createApp(PersonalHistory,{problemId:problem[1],csrf});personalHistory=app.mount(host) as unknown as NonNullable<typeof personalHistory>;mounts.set(host,app);
  return personalHistory;
}
export function ensureShell(version: string) {
  if (!document.querySelector('#navbar,[ng-view]>nav')) return;
  if (shell) {
    const current = readPage(document,location.href);
    if (shell.title !== current.title || shell.section !== current.section) Object.assign(shell,{title:current.title,section:current.section});
    if (shell.account?.name !== current.account?.name) shell.account = current.account;
    if (shell.logout !== current.logout) shell.logout = current.logout;
    if (JSON.stringify(shell.links) !== JSON.stringify(current.links)) shell.links=current.links;
    return;
  }
  const page = reactive(readPage(document,location.href)); shell = page;
  const host = document.createElement('div'); host.id='oms-app'; host.dataset.omsUi=''; document.body.prepend(host);
  const root = document.querySelector('#container') || document.querySelector('body>.container-fluid');
  root?.classList.add('oms-native-root');
  if (page.home) document.documentElement.classList.add('oms-home-page');
  if (page.courses) document.documentElement.classList.add('oms-course-page');
  if (page.inContest) document.documentElement.classList.add('oms-contest-page');
  const app = createApp(Shell,{page,version});
  app.mount(host); mounts.set(host,app);
}
