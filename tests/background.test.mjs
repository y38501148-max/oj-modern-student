import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
const core = (await readFile(new URL('../src/core.mjs',import.meta.url),'utf8')).replace(/^export /gm,'');
const background = (await readFile(new URL('../src/background.js',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'');
function worker({channel='github',failed=false} = {}) {
  const stored = {}, requests = [], events = {}, badges = [];
  const event = name => ({addListener:fn=>{ events[name]=fn; }});
  const context = {
    console, AbortSignal, Date, Promise,
    fetch:async (url,options) => { requests.push({url,options}); if (failed) throw Error('offline'); return {ok:true,json:async()=>({version:'0.2.0'})}; },
    chrome: {
      runtime: {getManifest:()=>({version:'0.1.0'}),getURL:()=> 'chrome-extension://test/',onInstalled:event('installed'),onStartup:event('startup'),onUpdateAvailable:event('updateAvailable'),onMessage:event('message'),requestUpdateCheck:async()=>({status:'update_available'})},
      storage:{local:{get:async keys=>Object.fromEntries((typeof keys === 'string'?[keys]:keys).map(key=>[key,stored[key]])),set:async values=>Object.assign(stored,values),remove:async key=>{delete stored[key];}}},
      alarms:{create:()=>{},onAlarm:event('alarm')},
      action:{setBadgeText:async value=>badges.push(value.text),setBadgeBackgroundColor:async()=>{}}
    }
  };
  vm.runInNewContext(`${core}\nconst CHANNEL=${JSON.stringify(channel)};\n${background}`,context);
  const send = (type,extra={},popup=true) => new Promise(resolve=>events.message({type,...extra},{url:popup?'chrome-extension://test/popup.html':'https://accoding.buaa.edu.cn/'},resolve));
  return {stored,requests,events,badges,send};
}
test('更新仅请求固定公开版本文件，不带凭证；缓存避免重复请求', async () => {
  const w = worker();
  const first = await w.send('check');
  assert.equal(first.update.version,'0.2.0'); assert.equal(w.requests.length,1);
  assert.equal(w.requests[0].url,'https://raw.githubusercontent.com/y38501148-max/oj-modern-student/main/version.json');
  assert.equal(w.requests[0].options.credentials,'omit');
  await w.send('state'); assert.equal(w.requests.length,1);
  assert.ok(w.badges.includes('NEW'));
});
test('检查失败保留功能设置，返回可读错误', async () => {
  const w = worker({failed:true});
  await w.send('settings',{settings:{theme:false,copy:true,submission:true}});
  const result = await w.send('check');
  assert.equal(result.settings.theme,false);
  assert.equal(result.update.error,'offline');
});
test('内容脚本不能强制网络检查或写入设置，稍后选择会保留', async () => {
  const w = worker();
  assert.ok((await w.send('check',{},false)).error);
  assert.ok((await w.send('settings',{settings:{theme:false}},false)).error);
  await w.send('dismiss',{version:'0.2.0'},false);
  assert.equal(w.stored.dismissedVersion,'0.2.0'); assert.equal(w.requests.length,0);
});
test('仅商店构建允许调用浏览器更新检查', async () => {
  assert.ok((await worker().send('store-check')).error);
  assert.equal((await worker({channel:'edge'}).send('store-check')).status,'update_available');
});
