import { REPOSITORY, newerVersion } from './core.mjs';
const $ = selector => document.querySelector(selector);
let state;
function render(value) {
  state = value;
  $('#version').textContent = `v${state.version} · ${state.channel === 'edge' ? 'Edge 商店版' : 'GitHub 手动安装版'}`;
  for (const key of ['theme','copy','submission']) $('#' + key).checked = state.settings[key];
  const available = newerVersion(state.update?.version || '', state.version);
  $('#update-status').textContent = state.update?.error ? `检查失败：${state.update.error}。请稍后重试。` : available ? `新版本 ${state.update.version} 已发布` : state.update?.checkedAt ? '当前已是 GitHub 最新版本' : '尚未检查更新';
  $('#download').hidden = !available;
  $('#download').textContent = state.channel === 'edge' ? '更新说明' : '下载更新';
  $('#download').href = REPOSITORY + '/releases/latest';
  if (state.channel === 'edge' && state.storeUpdate) $('#update-status').textContent = `Edge ${state.storeUpdate} 已下载，将在扩展空闲时更新。`;
  $('#channel-help').textContent = state.channel === 'edge' ? '扩展由 Edge 商店自动更新，商店版本可能晚于 GitHub。' : '下载新版并替换原扩展目录，然后在 chrome://extensions 点击“重新加载”。';
}
$('#repository').href = REPOSITORY;
$('#installation').href = REPOSITORY + '#安装';
for (const key of ['theme','copy','submission']) $('#' + key).addEventListener('change', async () => {
  const settings = Object.fromEntries(['theme','copy','submission'].map(name => [name, $('#' + name).checked]));
  try {
    const result = await chrome.runtime.sendMessage({ type: 'settings', settings });
    if (result.error) throw new Error(result.error);
    $('#settings-status').textContent = '已保存，刷新 OJ 页面后生效。';
  } catch (error) { $('#settings-status').textContent = `保存失败：${error.message}`; }
});
$('#check').addEventListener('click', async () => {
  $('#check').disabled = true; $('#update-status').textContent = '正在检查更新…';
  try {
    const result = await chrome.runtime.sendMessage({ type: 'check' });
    if (result.error) throw new Error(result.error);
    render(result);
    if (result.channel === 'edge') {
      const store = await chrome.runtime.sendMessage({ type: 'store-check' });
      if (store.status === 'update_available') $('#update-status').textContent = 'Edge 新版本已就绪，浏览器将在扩展空闲时更新。';
      else if (store.status === 'throttled') $('#channel-help').textContent = '浏览器暂时限制检查频率，将继续自动检查商店更新。';
    }
  } catch (error) { $('#update-status').textContent = `检查失败：${error.message}`; }
  finally { $('#check').disabled = false; }
});
try {
  const result = await chrome.runtime.sendMessage({ type: 'state' });
  if (result.error) throw new Error(result.error);
  render(result);
} catch (error) { $('#update-status').textContent = `读取失败：${error.message}`; }
