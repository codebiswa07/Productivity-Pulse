// Wrapper around chrome.runtime.sendMessage with graceful fallback
export async function sendMessage(type, payload = {}) {
  return new Promise((resolve, reject) => {
    if (typeof chrome === 'undefined' || !chrome.runtime) {
      reject(new Error('Chrome API not available'));
      return;
    }
    chrome.runtime.sendMessage({ type, ...payload }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}

export async function getTodayStats()    { return sendMessage('GET_TODAY_STATS'); }
export async function getWeeklyStats()   { return sendMessage('GET_WEEKLY_STATS'); }
export async function getBlockedSites()  { return sendMessage('GET_BLOCKED_SITES'); }
export async function getSettings()      { return sendMessage('GET_SETTINGS'); }
export async function getStreak()        { return sendMessage('GET_STREAK'); }

export async function addBlockedSite(domain) {
  return sendMessage('ADD_BLOCKED_SITE', { domain });
}
export async function removeBlockedSite(domain) {
  return sendMessage('REMOVE_BLOCKED_SITE', { domain });
}
export async function updateSettings(settings) {
  return sendMessage('UPDATE_SETTINGS', { settings });
}
export async function forceSync() {
  return sendMessage('FORCE_SYNC');
}
