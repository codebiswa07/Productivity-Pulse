// ─── TimeTracker: Measures time per domain ────────────────────────────────────
export class TimeTracker {
  constructor(storage) {
    this.storage   = storage;
    this.currentDomain = null;
    this.startTime     = null;
    this.isPaused      = false;
  }

  extractDomain(url) {
    try {
      if (!url || url.startsWith('chrome://') || url.startsWith('chrome-extension://')) return null;
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return null;
    }
  }

  async switchTab(url) {
    const settings = await this.storage.getSettings();
    if (!settings.trackingEnabled) return;

    await this._saveElapsed();

    const domain = this.extractDomain(url);
    if (domain) {
      this.currentDomain = domain;
      this.startTime     = Date.now();
      this.isPaused      = false;
    }
  }

  async pauseTracking() {
    await this._saveElapsed();
    this.isPaused = true;
    this.startTime = null;
  }

  async resumeTracking(url) {
    const settings = await this.storage.getSettings();
    if (!settings.trackingEnabled) return;

    const domain = this.extractDomain(url);
    if (domain) {
      this.currentDomain = domain;
      this.startTime     = Date.now();
      this.isPaused      = false;
    }
  }

  async _saveElapsed() {
    if (!this.currentDomain || !this.startTime || this.isPaused) return;
    const elapsed = Math.round((Date.now() - this.startTime) / 1000);
    if (elapsed > 1 && elapsed < 3600) { // 1s–1hr sanity check
      await this.storage.addTime(this.currentDomain, elapsed);
      await this.storage.addToSyncQueue({
        type: 'time-log',
        domain: this.currentDomain,
        timeSpent: elapsed,
        timestamp: new Date().toISOString(),
      });
    }
    this.startTime = Date.now(); // reset for next interval
  }
}
