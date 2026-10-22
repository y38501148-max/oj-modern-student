import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { parsePersonalHistory } from '../src/personal-history.mjs';
test('个人记录按用户 ID 筛选，并能读取已变为创建题解链接的提交 ID',()=>{
  const dom=new JSDOM(`<form id="form_of_submission"><table><tr id="tr0"><td id="submission_id0"><a href="/submission/123/solution"><input value="创建题解"></a></td><td><a href="/user/7/index">同名用户</a></td><td id="submission_result0"><label data-content="123&#10;Accepted | 1 * (1 / 1) | 5 ms | 1024 KB">Accepted</label></td><td id="submission_score0">1</td><td id="submission_time0">5</td><td id="submission_memory0">1024</td></tr><tr id="tr1"><td id="submission_id1">124</td><td><a href="/user/8/index">同名用户</a></td><td id="submission_result1">Wrong Answer</td></tr></table><a onclick="change_page('./submission?offset=15')">下一页</a></form>`);
  const page=parsePersonalHistory(dom.window.document,7);
  assert.deepEqual(page.rows,[{id:'123',result:'AC',score:'1',time_cost:'5',memory_cost:'1024',detail:'123\nAccepted | 1 * (1 / 1) | 5 ms | 1024 KB'}]);
  assert.equal(page.next,15);
  dom.window.document.querySelector('[onclick]').setAttribute('disabled','');
  assert.equal(parsePersonalHistory(dom.window.document,7).next,null);
  assert.throws(()=>parsePersonalHistory(new JSDOM('<h1>登录</h1>').window.document,7),/重新登录/);
  dom.window.close();
});
