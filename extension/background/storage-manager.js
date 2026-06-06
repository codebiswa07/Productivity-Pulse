// ─── StorageManager: All chrome.storage interactions ─────────────────────────
export class StorageManager {
  async initialize() {
    const existing = await this.getSettings();
    if (!existing.initialized) {
      await chrome.storage.local.set({
        settings: {
          initialized: true,
          trackingEnabled: true,
          blockingEnabled: true,
          syncEnabled: true,
          apiBase: 'https://productivity-pulse-server.onrender.com/api',
          authToken: null,
          productiveCategories: ['work', 'education', 'development'],
          dailyGoalMinutes: 480,
        },
        blockedSites: [],
        timeLogs: {},        // { 'YYYY-MM-DD': { domain: seconds } }
        syncQueue: [],
        streak: { count: 0, lastDate: null },
      });
    }
  }

  async getSettings() {
    const { settings = {} } = await chrome.storage.local.get('settings');
    return settings;
  }

  async updateSettings(patch) {
    const current = await this.getSettings();
    const updated = { ...current, ...patch };
    await chrome.storage.local.set({ settings: updated });
    return updated;
  }

  async getBlockedSites() {
    const { blockedSites = [] } = await chrome.storage.local.get('blockedSites');
    return blockedSites;
  }

  async setBlockedSites(sites) {
    await chrome.storage.local.set({ blockedSites: sites });
  }

  getTodayKey() {
    return new Date().toISOString().split('T')[0];
  }

  async getAllLogs() {
    const { timeLogs = {} } = await chrome.storage.local.get('timeLogs');
    return timeLogs;
  }

  async getTodayLogs() {
    const logs = await this.getAllLogs();
    return logs[this.getTodayKey()] || {};
  }

  async addTime(domain, seconds) {
    const logs = await this.getAllLogs();
    const today = this.getTodayKey();
    if (!logs[today]) logs[today] = {};
    logs[today][domain] = (logs[today][domain] || 0) + seconds;
    await chrome.storage.local.set({ timeLogs: logs });
  }

  async getTodayStats() {
    const todayLogs = await this.getTodayLogs();
    const settings  = await this.getSettings();
    const totalSeconds = Object.values(todayLogs).reduce((a, b) => a + b, 0);

    // Sort domains by time
    const sorted = Object.entries(todayLogs)
      .sort(([, a], [, b]) => b - a)
      .map(([domain, seconds]) => ({ domain, seconds, minutes: Math.round(seconds / 60) }));

    const productiveSeconds = sorted
      .filter(({ domain }) => isProductive(domain, settings.productiveCategories))
      .reduce((a, b) => a + b.seconds, 0);

    const score = totalSeconds > 0
      ? Math.round((productiveSeconds / totalSeconds) * 100)
      : 0;

    return {
      date: this.getTodayKey(),
      totalMinutes: Math.round(totalSeconds / 60),
      productivityScore: score,
      topSites: sorted.slice(0, 10),
      goalMinutes: settings.dailyGoalMinutes,
    };
  }

  async getWeeklyStats() {
    const logs = await this.getAllLogs();
    const today = new Date();
    const result = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const dayLogs = logs[key] || {};
      const totalSeconds = Object.values(dayLogs).reduce((a, b) => a + b, 0);
      result.push({
        date: key,
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        totalMinutes: Math.round(totalSeconds / 60),
      });
    }
    return result;
  }

  async getSyncQueue() {
    const { syncQueue = [] } = await chrome.storage.local.get('syncQueue');
    return syncQueue;
  }

  async addToSyncQueue(entry) {
    const queue = await this.getSyncQueue();
    queue.push({ ...entry, id: Date.now() + Math.random() });
    await chrome.storage.local.set({ syncQueue: queue });
  }

  async clearSyncQueue(ids) {
    const queue = await this.getSyncQueue();
    const remaining = queue.filter((e) => !ids.includes(e.id));
    await chrome.storage.local.set({ syncQueue: remaining });
  }

  async getStreak() {
    const { streak = { count: 0, lastDate: null } } = await chrome.storage.local.get('streak');
    return streak;
  }

  async updateStreak() {
    const streak = await this.getStreak();
    const today  = this.getTodayKey();
    const stats  = await this.getTodayStats();

    if (stats.productivityScore >= 50) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yKey = yesterday.toISOString().split('T')[0];

      if (streak.lastDate === yKey) {
        streak.count++;
      } else if (streak.lastDate !== today) {
        streak.count = 1;
      }
      streak.lastDate = today;
      await chrome.storage.local.set({ streak });
    }
    return streak;
  }

  async cleanupOldData() {
    const logs = await this.getAllLogs();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const cutoffKey = cutoff.toISOString().split('T')[0];
    const cleaned = Object.fromEntries(
      Object.entries(logs).filter(([date]) => date >= cutoffKey)
    );
    await chrome.storage.local.set({ timeLogs: cleaned });
  }

  async clearToday() {
    const logs = await this.getAllLogs();
    delete logs[this.getTodayKey()];
    await chrome.storage.local.set({ timeLogs: logs });
  }
}

function isProductive(domain, categories) {
  const productiveDomains = [
    'github.com', 'stackoverflow.com', 'docs.', 'learn.', 'coursera.com',
    'udemy.com', 'notion.so', 'linear.app', 'figma.com', 'gitlab.com',
    'jira.atlassian.com', 'confluence.', 'developer.mozilla.org',
  ];
  return productiveDomains.some((p) => domain.includes(p));
}
