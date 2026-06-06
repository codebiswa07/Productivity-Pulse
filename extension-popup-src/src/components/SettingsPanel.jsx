import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, User, Globe, Clock } from 'lucide-react';
import * as api from '../api/chrome-api';

export default function SettingsPanel({ data }) {
  const { settings, refresh } = data;
  const [form, setForm]         = useState({});
  const [saving, setSaving]     = useState(false);
  const [syncing, setSyncing]   = useState(false);
  const [saved, setSaved]       = useState(false);

  useEffect(() => {
    if (settings) setForm({ ...settings });
  }, [settings]);

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const save = async () => {
    setSaving(true);
    try {
      await api.updateSettings(form);
      await refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally { setSaving(false); }
  };

  const forceSync = async () => {
    setSyncing(true);
    try { await api.forceSync(); }
    finally { setSyncing(false); }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Tracking */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-4">
        <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Clock size={14} className="text-blue-500" /> Tracking
        </p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-700">Enable Tracking</p>
            <p className="text-xs text-slate-400">Record time on each website</p>
          </div>
          <button
            onClick={() => update('trackingEnabled', !form.trackingEnabled)}
            className={`relative w-11 h-6 rounded-full transition-colors ${form.trackingEnabled ? 'bg-blue-500' : 'bg-slate-200'}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.trackingEnabled ? 'left-6' : 'left-1'}`} />
          </button>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-500 font-medium">Daily Goal (hours)</label>
          <input
            type="number" min="1" max="24"
            value={Math.round((form.dailyGoalMinutes || 480) / 60)}
            onChange={(e) => update('dailyGoalMinutes', Number(e.target.value) * 60)}
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-400"
          />
        </div>
      </div>

      {/* Sync */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-4">
        <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Globe size={14} className="text-green-500" /> Backend Sync
        </p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-700">Cloud Sync</p>
            <p className="text-xs text-slate-400">Sync across devices</p>
          </div>
          <button
            onClick={() => update('syncEnabled', !form.syncEnabled)}
            className={`relative w-11 h-6 rounded-full transition-colors ${form.syncEnabled ? 'bg-green-500' : 'bg-slate-200'}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.syncEnabled ? 'left-6' : 'left-1'}`} />
          </button>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-500 font-medium">API Base URL</label>
          <input
            type="text"
            value={form.apiBase || ''}
            onChange={(e) => update('apiBase', e.target.value)}
            placeholder="http://localhost:5000/api"
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-400"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-500 font-medium">Auth Token (JWT)</label>
          <input
            type="password"
            value={form.authToken || ''}
            onChange={(e) => update('authToken', e.target.value)}
            placeholder="Paste your JWT here"
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-400"
          />
        </div>

        <button
          onClick={forceSync}
          disabled={syncing}
          className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Syncing…' : 'Force Sync Now'}
        </button>
      </div>

      {/* Save */}
      <button
        onClick={save}
        disabled={saving}
        className={`w-full py-3 rounded-2xl text-sm font-semibold transition-all ${
          saved ? 'bg-green-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Settings'}
      </button>
    </div>
  );
}
