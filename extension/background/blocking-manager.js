// ─── BlockingManager: Handles site blocking ───────────────────────────────────
export class BlockingManager {
  constructor(storage) {
    this.storage = storage;
  }

  async checkAndBlock(tabId, url) {
    const settings = await this.storage.getSettings();
    if (!settings.blockingEnabled) return;

    const domain = this._extractDomain(url);
    if (!domain) return;

    const blocked = await this.storage.getBlockedSites();
    const isBlocked = blocked.some((b) =>
      domain === b || domain.endsWith('.' + b)
    );

    if (isBlocked) {
      const blockedUrl = chrome.runtime.getURL('blocked-page/blocked.html') +
        '?site=' + encodeURIComponent(domain) +
        '&original=' + encodeURIComponent(url);
      chrome.tabs.update(tabId, { url: blockedUrl });
    }
  }

  async addSite(domain) {
    const clean = domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].toLowerCase();
    const sites  = await this.storage.getBlockedSites();
    if (!sites.includes(clean)) {
      sites.push(clean);
      await this.storage.setBlockedSites(sites);
    }
    return { success: true, blockedSites: sites };
  }

  async removeSite(domain) {
    const sites   = await this.storage.getBlockedSites();
    const updated = sites.filter((s) => s !== domain);
    await this.storage.setBlockedSites(updated);
    return { success: true, blockedSites: updated };
  }

  _extractDomain(url) {
    try {
      if (!url || url.startsWith('chrome://') || url.startsWith('chrome-extension://')) return null;
      return new URL(url).hostname.replace(/^www\./, '');
    } catch { return null; }
  }
}
