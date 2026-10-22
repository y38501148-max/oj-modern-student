import { DEFAULT_SETTINGS, REPOSITORY, UPDATE_URL, newerVersion } from './core.mjs';
import { CHANNEL } from './config.js';

const installed = chrome.runtime.getManifest().version;
let checking;
async function state() {
  const saved = await chrome.storage.local.get(['settings', 'update', 'dismissedVersion', 'storeUpdate']);
  return { version: installed, channel: CHANNEL, repository: REPOSITORY, settings: { ...DEFAULT_SETTINGS, ...saved.settings }, update: saved.update || null, dismissedVersion: saved.dismissedVersion, storeUpdate: saved.storeUpdate };
}
async function checkUpdate(force = false) {
  if (checking) return checking;
  checking = (async () => {
    const { update } = await chrome.storage.local.get('update');
    if (!force && Date.now() - (update?.checkedAt || 0) < 6 * 3600_000) return state();
    try {
      const response = await fetch(UPDATE_URL, { credentials: 'omit', cache: 'no-store', signal: AbortSignal.timeout(12_000), referrerPolicy: 'no-referrer' });
      if (!response.ok) throw new Error(`版本服务返回 ${response.status}`);
      const data = await response.json();
      if (!/^\d+\.\d+\.\d+$/.test(data.version)) throw new Error('版本信息格式错误');
      await chrome.storage.local.set({ update: { version: data.version, checkedAt: Date.now(), error: null } });
    } catch (error) {
      await chrome.storage.local.set({ update: { ...update, checkedAt: Date.now(), error: error.message } });
    }
    const result = await state();
    await chrome.action.setBadgeText({ text: newerVersion(result.update?.version || '', installed) ? 'NEW' : '' });
    await chrome.action.setBadgeBackgroundColor({ color: '#275ad6' });
    return result;
  })().finally(() => { checking = null; });
  return checking;
}

chrome.runtime.onInstalled.addListener(() => {
  void chrome.storage.local.remove('storeUpdate');
  chrome.alarms.create('check-update', { periodInMinutes: 360 });
  void checkUpdate(true);
});
chrome.runtime.onStartup.addListener(() => { void checkUpdate(); });
chrome.alarms.onAlarm.addListener(alarm => { if (alarm.name === 'check-update') void checkUpdate(); });
chrome.runtime.onUpdateAvailable.addListener(details => {
  void chrome.storage.local.set({ storeUpdate: details.version });
  void chrome.action.setBadgeText({ text: 'NEW' });
});
chrome.runtime.onMessage.addListener((message, sender, respond) => {
  // Settings writes are restricted to extension pages.
  const fromPopup = sender.url?.startsWith(chrome.runtime.getURL(''));
  const run = async () => {
    if (message.type === 'state') { void checkUpdate(); return state(); }
    if (message.type === 'check') return checkUpdate(true);
    if (message.type === 'settings' && fromPopup) {
      const settings = Object.fromEntries(Object.keys(DEFAULT_SETTINGS).map(key => [key, message.settings?.[key] !== false]));
      await chrome.storage.local.set({ settings });
      return state();
    }
    if (message.type === 'dismiss') {
      await chrome.storage.local.set({ dismissedVersion: message.version });
      return { ok: true };
    }
    if (message.type === 'store-check' && CHANNEL === 'edge') return chrome.runtime.requestUpdateCheck();
    throw new Error('不支持的操作');
  };
  run().then(respond, error => respond({ error: error.message }));
  return true;
});
