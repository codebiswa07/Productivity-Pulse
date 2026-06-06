import { useState, useEffect, useCallback } from 'react';
import * as api from '../api/chrome-api';

export function useExtensionData() {
  const [todayStats, setTodayStats]   = useState(null);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [blockedSites, setBlockedSites] = useState([]);
  const [settings, setSettings]       = useState(null);
  const [streak, setStreak]           = useState({ count: 0 });
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [today, weekly, blocked, sett, str] = await Promise.all([
        api.getTodayStats(),
        api.getWeeklyStats(),
        api.getBlockedSites(),
        api.getSettings(),
        api.getStreak(),
      ]);
      setTodayStats(today);
      setWeeklyStats(weekly || []);
      setBlockedSites(blocked || []);
      setSettings(sett || {});
      setStreak(str || { count: 0 });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [refresh]);

  return { todayStats, weeklyStats, blockedSites, settings, streak, loading, error, refresh };
}
