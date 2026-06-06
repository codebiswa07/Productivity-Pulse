// ─── SyncManager: Syncs local data to MERN backend ───────────────────────────
export class SyncManager {
  constructor(storage) {
    this.storage = storage;
  }

  async syncToBackend() {
    const settings = await this.storage.getSettings();
    if (!settings.syncEnabled || !settings.authToken || !settings.apiBase) return;

    const queue = await this.storage.getSyncQueue();
    if (queue.length === 0) return;

    const timeLogs = queue.filter((e) => e.type === 'time-log');
    if (timeLogs.length === 0) return;

    try {
      const res = await fetch(`${settings.apiBase}/tracking/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${settings.authToken}`,
        },
        body: JSON.stringify({ logs: timeLogs }),
      });

      if (res.ok) {
        await this.storage.clearSyncQueue(timeLogs.map((e) => e.id));
        console.log(`[PP Sync] Pushed ${timeLogs.length} entries`);
      }
    } catch (e) {
      console.warn('[PP Sync] Failed:', e.message);
    }
  }
}
