import test from 'node:test';
import assert from 'node:assert/strict';
import { isStudentSite, newerVersion } from '../src/core.mjs';

test('学生端入口排除管理端、非 HTTPS 和仿冒域名', () => {
  assert.equal(isStudentSite('https://accoding.buaa.edu.cn/problem/1/index'), true);
  for (const url of ['https://accoding.buaa.edu.cn:4000/','http://accoding.buaa.edu.cn/','https://accoding.buaa.edu.cn.evil.test/','not a url']) assert.equal(isStudentSite(url), false);
});
test('版本按数字比较，只接受正式三段版本', () => {
  assert.equal(newerVersion('0.10.0','0.2.0'), true);
  assert.equal(newerVersion('1.0.0','0.99.99'), true);
  for (const candidate of ['0.1.0','0.0.9','0.2.0-beta','x.y.z','']) assert.equal(newerVersion(candidate,'0.1.0'), false);
});
