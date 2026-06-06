// ─── ProductivityPulse Service Worker ───────────────────────────────────────
import { StorageManager } from './storage-manager.js';
import { TimeTracker } from './time-tracker.js';
import { BlockingManager } from './blocking-manager.js';
import { SyncManager } from './sync-manager.js';

const storage = new StorageManager();
const tracker = new TimeTracker(storage);
const blocker = new BlockingManager(storage);
const syncer  = new SyncManager(storage);

// ── Bootstrap ────────────────────────────────────────────────────────────────
self.addEventListener('install',  () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

// ── Alarm Setup ──────────────────────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(async () => {
  await storage.initialize();
  chrome.alarms.create('sync',    { periodInMinutes: 3 });
  chrome.alarms.create('cleanup', { periodInMinutes: 60 });
  chrome.alarms.create('streak',  { periodInMinutes: 1440 }); // daily
  console.log('[PP] Service Worker installed and alarms set');
});

// ── Alarm Handler ─────────────────────────────────────────────────────────────
chrome.alarms.onAlarm.addListener(async ({ name }) => {
  if (name === 'sync')    await syncer.syncToBackend();
  if (name === 'cleanup') await storage.cleanupOldData();
  if (name === 'streak')  await storage.updateStreak();
});

// ── Tab Tracking ─────────────────────────────────────────────────────────────
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await chrome.tabs.get(tabId).catch(() => null);
  if (tab?.url) await tracker.switchTab(tab.url);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active && tab.url) {
    await tracker.switchTab(tab.url);
    await blocker.checkAndBlock(tabId, tab.url);
  }
});

chrome.tabs.onRemoved.addListener(async () => {
  await tracker.pauseTracking();
});

// ── Idle Detection ────────────────────────────────────────────────────────────
chrome.idle.setDetectionInterval(60);
chrome.idle.onStateChanged.addListener(async (state) => {
  if (state === 'idle' || state === 'locked') {
    await tracker.pauseTracking();
  } else {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) await tracker.resumeTracking(tab.url);
  }
});

// ── Window Focus ──────────────────────────────────────────────────────────────
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    await tracker.pauseTracking();
  } else {
    const [tab] = await chrome.tabs.query({ active: true, windowId });
    if (tab?.url) await tracker.resumeTracking(tab.url);
  }
});

// ── Message Handler ────────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  handleMessage(msg).then(sendResponse).catch((e) => sendResponse({ error: e.message }));
  return true; // async
});

async function handleMessage(msg) {
  switch (msg.type) {
    case 'GET_TODAY_STATS':     return await storage.getTodayStats();
    case 'GET_WEEKLY_STATS':    return await storage.getWeeklyStats();
    case 'GET_BLOCKED_SITES':   return await storage.getBlockedSites();
    case 'ADD_BLOCKED_SITE':    return await blocker.addSite(msg.domain);
    case 'REMOVE_BLOCKED_SITE': return await blocker.removeSite(msg.domain);
    case 'GET_SETTINGS':        return await storage.getSettings();
    case 'UPDATE_SETTINGS':     return await storage.updateSettings(msg.settings);
    case 'FORCE_SYNC':          return await syncer.syncToBackend();
    case 'GET_STREAK':          return await storage.getStreak();
    case 'CLEAR_TODAY':         return await storage.clearToday();
    default: return { error: 'Unknown message type' };
  }
}
