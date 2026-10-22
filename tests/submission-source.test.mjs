import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { parseSubmissionSource, trimSourceHeader } from '../src/submission-source.mjs';
test('查看源码分离原站元信息，保留源码注释、缩进和所有换行',()=>{
  const header='/* \r\n Author: 测试同学\r\n Result: AC\tSubmission_id: 42\r\n Created at: Thu Oct 22 2026 00:10:46 GMT+0800 (China Standard Time)\r\n Problem_id: 7\tTime: 10\tMemory: 1700\r\n*/\r\n\r\n';
  const code='/* 我的注释 */\r\nint main() {\r\n\treturn 0;\r\n}\r\n';
  const parsed=parseSubmissionSource(header+code,42);
  assert.equal(parsed.code,code);assert.equal(parsed.author,'测试同学');assert.equal(parsed.problemId,'7');
  assert.equal(parseSubmissionSource(header+code,43),null);
  const dom=new JSDOM('<code><span class="comment"></span><span class="keyword"></span></code>');
  const node=dom.window.document.querySelector('code');node.children[0].textContent=header;node.children[1].textContent='int';node.append(dom.window.document.createTextNode(' main() {\r\n\treturn 0;\r\n}\r\n'));
  trimSourceHeader(node,parsed.prefix);
  assert.equal(node.textContent,'int main() {\r\n\treturn 0;\r\n}\r\n');
  assert.equal(node.querySelector('.keyword').textContent,'int');
  dom.window.close();
});
