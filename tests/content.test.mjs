import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
const source = await readFile(new URL('../extension/content.js',import.meta.url),'utf8');
const pause = () => new Promise(resolve => setTimeout(resolve, 90));
const pages = new Set();
afterEach(async()=>{for(const close of [...pages])await close();});
const statement = '<h1 class="problem-title">加法</h1><h2>输入样例1</h2><pre><code>  1\t2\n\n</code></pre><h2>输出样例1</h2><pre><code>3\n</code></pre>';
function page(settings = {}, state = {}, options = {}) {
  const dom = new JSDOM(options.html || `<div id="page"><div class="col-lg-2"></div><div class="col-lg-8"><div class="markdown-body">${statement}</div></div><div class="col-lg-2"><div class="modal"><div class="modal-dialog"><form action="/problem/1/submit" method="post"><textarea name="code"></textarea><button type="submit">提交</button></form></div></div></div></div>`, { url:options.url || 'https://accoding.buaa.edu.cn/problem/1/index',runScripts:'outside-only',pretendToBeVisual:true });
  const copies = [], messages = [];
  const observers = [];
  const NativeObserver = dom.window.MutationObserver;
  dom.window.MutationObserver = class extends NativeObserver { constructor(callback) { super(callback); observers.push(this); } };
  dom.window.matchMedia = () => ({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
  dom.window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  dom.window.chrome = { runtime: { getManifest:()=>({version:'0.2.0'}), getURL:path=>'chrome-extension://test/'+path, sendMessage: async msg => { messages.push(msg); return { version:'0.1.0',channel:'github',settings:{theme:true,copy:true,submission:true,...settings},update:{version:'0.1.0'},...state }; } } };
  Object.defineProperty(dom.window.navigator,'clipboard',{value:{writeText:async text=>copies.push(text)}});
  if(options.fetch)dom.window.fetch=options.fetch;
  dom.window.eval(source);
  let closed=false;
  const close=async()=>{if(closed)return;closed=true;dom.window.document.body.replaceChildren();await pause();observers.forEach(o=>o.disconnect());dom.window.close();pages.delete(close);};
  pages.add(close);
  return { dom, window:dom.window, document:dom.window.document, copies,messages, close };
}
test('复制样例保持所有空白，异步更换题面后只复制当前题', async () => {
  const p = page(); await pause();
  assert.equal(p.document.querySelectorAll('.oms-block-copy').length,2);
  assert.equal(p.document.querySelector('pre button'),null);
  assert.equal(p.document.querySelector('h2 .oms-block-copy')!==null,true);
  assert.ok([...p.document.querySelectorAll('.oms-block-copy button')].every(button=>button.textContent==='复制'));
  p.document.querySelector('.oms-block-copy button').click(); await pause();
  assert.equal(p.copies[0], '  1\t2\n\n');
  const root = p.document.querySelector('.markdown-body');
  root.innerHTML = '<h1 class="problem-title">第二题</h1><h2>输入样例</h2><pre>new\n</pre>';
  await pause();
  assert.equal(p.document.querySelectorAll('.oms-copybar').length,0);
  assert.equal(root.querySelectorAll('.oms-block-copy').length,1);
  root.querySelector('.oms-block-copy button').click(); await pause();
  assert.equal(p.copies[1], 'new\n');
  await p.close();
});
test('题面模板代码和文本框均在框外复制，读取当前内容且保留空白',async()=>{
  const code='#include <stdio.h>\n\nint main() {\n\treturn 0;\n}\n';
  const p=page({}, {}, {html:'<div id="page"><div class="markdown-body"><h1 class="problem-title">模板</h1><h2>输入提示</h2><p>可以参考这段代码：</p><pre><code>'+code.replaceAll('<','&lt;')+'</code></pre><p>数据</p><textarea readonly>旧内容</textarea></div></div>'});
  await pause();
  const root=p.document.querySelector('.markdown-body');
  assert.equal(root.querySelectorAll('.oms-block-copy').length,2);
  assert.equal(root.querySelectorAll('pre button,textarea button').length,0);
  root.querySelector('pre').previousElementSibling.querySelector('button').click();await pause();
  assert.equal(p.copies[0],code);
  root.querySelector('textarea').value='  更新\t文本\n\n';
  root.querySelector('textarea').previousElementSibling.querySelector('button').click();await pause();
  assert.equal(p.copies[1],'  更新\t文本\n\n');
  root.append(p.document.createElement('p'));await pause();
  assert.equal(root.querySelectorAll('.oms-block-copy').length,2);
  assert.ok([...root.querySelectorAll('.oms-block-copy button')].every(button=>button.textContent==='复制'));
  await p.close();
});
test('提交优化保留原表单，Tab 更新原 textarea 并派发 input，Esc+Tab 可离开', async () => {
  const p = page(), textarea = p.document.querySelector('textarea'), form = textarea.form;
  await pause();
  assert.equal(textarea.form,form);
  assert.equal(form.action,'https://accoding.buaa.edu.cn/problem/1/submit');
  assert.equal(p.document.querySelectorAll('.oms-editor-tools').length,1);
  assert.equal(p.document.querySelector('.oms-editor-tools button').textContent,'复制');
  p.document.querySelector('.modal').append(p.document.createElement('p'));
  await pause();
  assert.equal(p.document.querySelectorAll('.oms-editor-tools').length,1);
  textarea.value = 'int main() {}'; textarea.setSelectionRange(0,0);
  let received = 0; textarea.addEventListener('input',()=>received++);
  textarea.dispatchEvent(new p.window.KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true}));
  assert.equal(textarea.value,'    int main() {}'); assert.equal(received,1);
  textarea.dispatchEvent(new p.window.KeyboardEvent('keydown',{key:'Tab',shiftKey:true,bubbles:true,cancelable:true}));
  assert.equal(textarea.value,'int main() {}'); assert.equal(received,2);
  textarea.dispatchEvent(new p.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  const escape = new p.window.KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true});
  textarea.dispatchEvent(escape); assert.equal(escape.defaultPrevented,false);
  assert.equal(form.querySelector('button[type="submit"]').textContent,'提交');
  await p.close();
});
test('三项功能可以独立关闭', async () => {
  const p = page({theme:false,copy:false,submission:false}); await pause();
  assert.equal(p.document.documentElement.classList.contains('oms-theme'),false);
  assert.equal(p.document.querySelectorAll('[data-oms-ui],.oms-editor').length,0);
  await p.close();
});
test('赛事链接分页标记当前页与禁用态，保留下一页地址',async()=>{
  const p=page({}, {}, {url:'https://accoding.buaa.edu.cn/contest/index',html:'<div id="page"><div><h3>所有比赛</h3><table class="table"><tbody><tr class="contest-title-tr"><td>比赛ID</td><td>比赛状态</td><td>比赛标题</td><td>所属课程</td><td>开始时间</td><td>结束时间</td></tr><tr><td>1</td><td>进行中</td><td>练习赛</td><td>程序设计</td><td>开始</td><td>结束</td></tr></tbody></table></div><div><a href="./index?page=0" disabled class="button btn btn-default loginbtn btnstyle">上一页</a><a id="button1" href="./index?page=1" class="button btn btn-success">1</a><a href="./index?page=2" class="button btn btn-default">2</a><a id="next" href="./index?page=2" class="button btn btn-default loginbtn btnstyle">下一页</a></div></div>'});
  await pause();
  assert.equal(p.document.querySelector('#button1').getAttribute('aria-current'),'page');
  assert.equal(p.document.querySelector('[disabled]').getAttribute('aria-disabled'),'true');
  assert.equal(p.document.querySelector('[disabled]').getAttribute('tabindex'),'-1');
  assert.equal(p.document.querySelector('#next').href,'https://accoding.buaa.edu.cn/contest/index?page=2');
  assert.equal(p.document.querySelector('#next').parentElement.getAttribute('aria-label'),'分页');
  assert.ok(p.document.querySelector('table').closest('.oms-table-wrap'));
  await p.close();
});
test('赛事状态与时间分层展示，保留完整标题和精确时间',async()=>{
  const p=page({}, {}, {url:'https://accoding.buaa.edu.cn/contest/index',html:'<div id="page"><table class="table"><tbody><tr class="contest-title-tr"><td>ID</td><td>状态</td><td>标题</td><td>课程</td><td>开始</td><td>结束</td></tr><tr><td>1331</td><td><label class="redtd">正在进行中…</label></td><td><a href="/contest-ng/index.html#/1331">程序设计基础第五次练习赛</a></td><td><a href="/group/7/index">2026级程序设计基础</a></td><td>2026-10-22 08:00:00</td><td>2026-10-25 23:50:00</td></tr></tbody></table></div>'});
  await pause();
  assert.equal(p.document.querySelector('.oms-contest-status').textContent,'进行中');
  assert.equal(p.document.querySelector('.oms-contest-title').title,'程序设计基础第五次练习赛');
  assert.equal(p.document.querySelector('.oms-contest-title').getAttribute('href'),'/contest-ng/index.html#/1331');
  const time=p.document.querySelector('.oms-contest-date');
  assert.equal(time.dateTime,'2026-10-22T08:00:00');
  assert.equal(time.textContent,'2026-10-22 08:00:00');
  assert.equal(time.title,'2026-10-22 08:00:00');
  p.document.querySelector('#page').append(p.document.createElement('p'));await pause();
  assert.equal(p.document.querySelectorAll('.oms-contest-date').length,2);
  await p.close();
});
test('更新提示不刷新或改变编辑器，同版稍后不再显示', async () => {
  const p = page({}, {update:{version:'0.2.0'}}); await pause();
  const textarea = p.document.querySelector('textarea'); textarea.value = 'draft';
  assert.match(p.document.querySelector('#oms-update').textContent,/0.2.0/);
  assert.match(p.document.querySelector('#oms-update a').href,/\/releases\/latest$/);
  [...p.document.querySelectorAll('#oms-update button')].find(n=>n.textContent.replace(/\s/g,'')==='稍后').click();
  assert.equal(textarea.value,'draft');
  assert.equal(p.document.querySelector('#oms-update'),null);
  assert.ok(p.messages.some(msg=>msg.type==='dismiss'&&msg.version==='0.2.0'));
  await p.close();
  const dismissed = page({}, {update:{version:'0.2.0'},dismissedVersion:'0.2.0'}); await pause();
  assert.equal(dismissed.document.querySelector('#oms-update'),null);
  await dismissed.close();
});

test('查看代码页复制纯源码，保留缩进和换行并移除原站提交头', async()=>{
  const code='/* 用户自己的注释 */\nint main() {\n    return 0;\n}\n';
  const header='/* \n Author: 测试同学\n Result: AC\tSubmission_id: 42\n Created at: Thu Oct 22 2026 00:10:46 GMT+0800 (China Standard Time)\n Problem_id: 7\tTime: 10\tMemory: 1700\n*/\n\n';
  const p=page({}, {}, {url:'https://accoding.buaa.edu.cn/submission/42',html:'<pre><code>'+(header+code)+'</code></pre>'});
  await pause();
  assert.equal(p.document.querySelectorAll('#oms-code-app').length,1);
  assert.equal(p.document.querySelector('.oms-code-card .oms-ant-btn-primary').textContent,'复制');
  assert.equal(p.document.querySelector('.oms-source-pre code').textContent,code);
  p.document.querySelector('.oms-code-card .oms-ant-btn-primary').click();await pause();
  assert.equal(p.copies[0],code);
  assert.match(p.document.querySelector('.oms-code-meta').textContent,/题目 #7/);
  await p.close();
});

const inlinePage = `<div id="page"><div class="col-lg-8"><div class="markdown-body">${statement}</div></div><div class="col-lg-4"><div id="myModal" class="modal"><form id="form" action="/problem/1/submit" method="post"><input type="hidden" name="_csrf" value="test-token"><select name="lang"><option value="c">C</option></select><textarea name="code"></textarea><button id="button" type="button" onclick="check()">确认提交</button></form></div><h4>相关推荐</h4><h3>推荐题目</h3></div></div>`;
const historyHtml = (id=42,result='Waiting') => `<form id="form_of_submission"><table><tr id="tr0"><td id="submission_id0"><a href="/submission/${id}">${id}</a></td><td><a href="/user/7/index">测试同学</a></td><td id="submission_result0">${result}</td><td id="submission_score0">0</td><td id="submission_time0">0</td><td id="submission_memory0">0</td></tr></table></form>`;
const htmlResponse = (html,url='https://accoding.buaa.edu.cn/problem/1/submission',ok=true) => ({ok,url,text:async()=>html});

test('普通题提交留在题面，防重复点击，并轮询 Waiting → Judging → AC', async()=>{
  let created=false, submits=0, polls=0, release;
  const pendingResponse=new Promise(resolve=>{release=resolve;});
  const code='int main() {\n    // a+b & c=2\n    return 0;\n}\n';
  const p=page({}, {}, {html:inlinePage,fetch:async(url,options={})=>{
    if(url==='/api/users/me')return {ok:true,json:async()=>({id:7,nickname:'测试同学'})};
    if(String(url).includes('getSubmissionApi')){
      assert.deepEqual(JSON.parse(new URL(url,'https://accoding.buaa.edu.cn').searchParams.get('submission_id')),['42']);
      polls++;
      if(polls===1)throw Error('暂时离线');
      return {ok:true,json:async()=>[{id:42,result:polls===2?'JG':'AC',score:1,time_cost:10,memory_cost:1700,detail:'42\nAccepted | 1 * (1 / 1) | 10 ms | 1700 KB'},{id:999,result:'WA'}]};
    }
    if(String(url).includes('/submission?offset=0'))return htmlResponse(created?historyHtml():'<form id="form_of_submission"></form>');
    assert.equal(url,'https://accoding.buaa.edu.cn/problem/1/submit');
    assert.equal(options.method,'POST');
    assert.equal(options.credentials,'same-origin');
    assert.equal(options.body.get('code'),code);
    assert.equal(options.body.get('_csrf'),'test-token');
    assert.equal(options.body.get('lang'),'c');
    submits++;await pendingResponse;created=true;return htmlResponse(historyHtml());
  }});
  await pause();
  const form=p.document.querySelector('#form'),button=p.document.querySelector('#button');
  assert.equal(button.type,'submit');assert.equal(button.hasAttribute('onclick'),false);
  let legacyClicks=0;
  button.onclick=()=>{legacyClicks++;};
  button.click();await pause();
  assert.match(p.document.querySelector('.oms-submit-status').textContent,/请输入代码/);assert.equal(submits,0);assert.equal(legacyClicks,0);
  p.document.querySelector('textarea').value=code;
  const submit=()=>form.dispatchEvent(new p.window.Event('submit',{bubbles:true,cancelable:true}));
  assert.equal(submit(),false);submit();await pause();
  assert.equal(submits,1);assert.equal(button.disabled,true);
  assert.match(p.document.querySelector('.oms-submission-table tbody').textContent,/提交中/);
  release();await pause();
  const table=()=>p.document.querySelector('.oms-submission-table tbody');
  assert.match(table().textContent,/42Waiting/);assert.equal(button.disabled,false);
  await new Promise(resolve=>setTimeout(resolve,3100));
  assert.match(p.document.querySelector('.oms-history-status').textContent,/正在重试/);
  assert.match(table().textContent,/Waiting/);
  await new Promise(resolve=>setTimeout(resolve,3100));
  assert.match(table().textContent,/Judging/);
  await new Promise(resolve=>setTimeout(resolve,3100));
  assert.deepEqual([...table().querySelectorAll('td')].map(cell=>cell.textContent),['42','AC','100','10','1700']);
  assert.equal(p.document.querySelector('.oms-history-status'),null);
  assert.equal(p.window.location.pathname,'/problem/1/index');
  assert.equal(p.document.querySelector('textarea').value,code);
  assert.equal(submits,1);assert.equal(polls,3);
  table().querySelector('.oms-score-trigger').click();await pause();
  assert.match(p.document.querySelector('.oms-score-detail-heading').textContent,/1 个数据点/);
  assert.match(p.document.querySelector('.oms-score-detail').textContent,/100 \/ 100/);
  await p.close();
});

test('比赛分数悬停和键盘聚焦显示详情，重新评测后更新内容',async()=>{
  let detail='42\nAccepted | 1 * (1 / 2) | 1 ms | 1024 KB\nWrong Answer | 0 * (1 / 2) | 2 ms | 2048 KB';
  const p=page({}, {}, {url:'https://accoding.buaa.edu.cn/contest-ng/index.html#/1331/problems',html:'<div ng-view><div><table class="table"><thead><tr><th>ID</th><th>结果</th><th>时间</th><th>内存</th></tr></thead><tbody><tr><td><a href="/submission/42">42</a></td><td>WA</td><td>2</td><td>2048</td></tr></tbody></table></div></div>',fetch:async()=>({ok:true,json:async()=>[{id:42,score:0.5,result:'WA',detail}]})});
  await pause();
  const score=p.document.querySelector('.oms-score-trigger');
  score.dispatchEvent(new p.window.MouseEvent('mouseenter'));await new Promise(resolve=>setTimeout(resolve,200));
  assert.match(p.document.querySelector('.oms-score-detail-heading').textContent,/2 个数据点/);
  assert.match(p.document.querySelector('.oms-score-detail').textContent,/Wrong Answer/);
  assert.match(p.document.querySelector('.oms-score-detail').textContent,/0 \/ 50/);
  detail='42\nCompile Error\n<script>alert(1)</script>';
  p.document.querySelector('tbody tr').cells[1].textContent='CE';await pause();
  score.focus();await pause();
  assert.match(p.document.querySelector('.oms-score-detail-message').textContent,/<script>alert\(1\)<\/script>/);
  assert.equal(p.document.querySelector('.oms-score-detail script'),null);
  assert.equal(p.document.querySelector('.oms-score-detail table'),null);
  await p.close();
});

test('提交被拒绝或网络中断时保留代码，恢复按钮且不自动重交', async()=>{
  for(const networkFailure of [false,true]){
    let submits=0;
    const p=page({}, {}, {html:inlinePage,fetch:async(url)=>{
      if(url==='/api/users/me')return {ok:true,json:async()=>({id:7,nickname:'测试同学'})};
      if(String(url).includes('/submission?offset=0'))return htmlResponse('<form id="form_of_submission"></form>');
      submits++;
      if(networkFailure)throw Error('network error');
      return htmlResponse('<div class="alert-danger">请选择语言。</div>','https://accoding.buaa.edu.cn/problem/1/submit',false);
    }});
    await pause();
    p.document.querySelector('textarea').value='draft';p.document.querySelector('#button').click();await pause();
    assert.match(p.document.querySelector('.oms-submit-status').textContent,networkFailure?/提交结果未确认/:/请选择语言/);
    assert.equal(p.document.querySelector('textarea').value,'draft');
    assert.equal(p.document.querySelector('#button').disabled,false);
    assert.equal(p.document.querySelector('.oms-submission-table'),null);
    assert.equal(p.window.location.pathname,'/problem/1/index');assert.equal(submits,1);
    await p.close();
  }
});
