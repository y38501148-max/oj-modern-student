import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { isStudentSite, newerVersion, sampleKind, statementMarkdown } from '../src/core.mjs';

test('学生端入口排除管理端、非 HTTPS 和仿冒域名', () => {
  assert.equal(isStudentSite('https://accoding.buaa.edu.cn/problem/1/index'), true);
  for (const url of ['https://accoding.buaa.edu.cn:4000/','http://accoding.buaa.edu.cn/','https://accoding.buaa.edu.cn.evil.test/','not a url']) assert.equal(isStudentSite(url), false);
});
test('版本按数字比较，只接受正式三段版本', () => {
  assert.equal(newerVersion('0.10.0','0.2.0'), true);
  assert.equal(newerVersion('1.0.0','0.99.99'), true);
  for (const candidate of ['0.1.0','0.0.9','0.2.0-beta','x.y.z','']) assert.equal(newerVersion(candidate,'0.1.0'), false);
});
test('识别中英文及带编号的样例标题，排除输入格式和样例解释', () => {
  for (const text of ['输入样例1','样例输入（2）','输入样例 $3$','Sample Input #1']) assert.equal(sampleKind(text), 'input');
  for (const text of ['输出样例：1','样例输出','Sample Output 2']) assert.equal(sampleKind(text), 'output');
  for (const text of ['输入格式','输出','样例解释','提示']) assert.equal(sampleKind(text), null);
});
test('Markdown 复制保留公式、图片、表格及代码原始空白，排除控件和重复公式', () => {
  const dom = new JSDOM(`<article><div data-oms-ui>复制题面</div><h1>加法</h1><p>计算 <span class="MathJax">视觉重复</span><script type="math/tex">a_i+b</script>。</p><p><img alt="示意" src="/img/test.png"></p><table><tr><th>量</th><th>值</th></tr><tr><td>a</td><td>1</td></tr></table><h2>输入样例</h2><pre><code>  1\t2  \n\n3\n</code><button data-oms-ui>复制输入</button></pre><script>unwanted()</script></article>`);
  const result = statementMarkdown(dom.window.document.querySelector('article'),'https://accoding.buaa.edu.cn/problem/1/index');
  assert.match(result, /\$a_i\+b\$/);
  assert.match(result, /!\[示意\]\(https:\/\/accoding.buaa.edu.cn\/img\/test.png\)/);
  assert.match(result, /\| 量 \| 值 \|\n\| --- \| --- \|/);
  assert.ok(result.includes('```\n  1\t2  \n\n3\n```'));
  assert.doesNotMatch(result, /视觉重复|复制输入|复制题面|unwanted/);
  dom.window.close();
});
