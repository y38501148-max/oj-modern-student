import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { readPage } from '../src/ui/page.mjs';

test('首页从原站读取题目、榜单和链接，账号使用右侧显示名', () => {
  const dom = new JSDOM(`<nav id="navbar"><a class="navbar-brand" href="/index">AC 编程</a><a href="/problem/index">题库</a><a href="/user/1/index">个人信息</a><ul class="navbar-right"><a href="/user/1/index">欢迎，测试同学</a><a href="/user/logout">登出</a></ul></nav><div id="page"><div class="containing"><a href="/problem/12/createSolution">12--加法</a><a href="/problem/2/index">排序</a><table><tr><td>月份</td><td>学号</td><td>姓名</td><td>过题</td></tr><tr><td>2026年1月</td><td>123xxx</td><td>甲</td><td>10</td></tr><tr><td>2026年2月</td><td>124xxx</td><td>乙</td><td>20</td></tr></table><a href="/problem/DEVStatistics?problem_id=1">指南</a><p>暂时关闭注册功能。</p></div></div><div id="footer"><a href="https://example.org/terms">服务条款</a></div>`);
  const page = readPage(dom.window.document,'https://accoding.buaa.edu.cn/index');
  assert.equal(page.account.name,'测试同学');
  assert.equal(page.account.href,'/user/1/index');
  assert.equal(page.solutions[0].id,'12');
  assert.equal(page.solutions[0].title,'加法');
  assert.equal(page.solutions[0].href,'/problem/12/createSolution');
  assert.equal(page.recommendations[0].href,'/problem/2/index');
  assert.equal(page.champions.length,2);
  assert.equal(page.champions[0].month,'2026年2月');
  assert.equal(page.champions[0].count,'20');
  assert.equal(page.guides.length,1);
  assert.equal(page.notices.length,1);
  assert.equal(page.terms,'https://example.org/terms');
  dom.window.close();
});
