import React, { useEffect, useState } from 'react';
import { Settings, Clock, Globe, User, Save, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import * as api from '../../api';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    authToken: localStorage.getItem('pp_token') || '',
  });

  useEffect(() => {
    api.getSettings().then((r) => { setSettings(r.data.settings); setLoading(false); });
  }, []);

  const update = (key, val) => setSettings((s) => ({ ...s, [key]: val }));

  const save = async () => {
    setSaving(true);
    try {
      await api.updateSettings(settings);
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } finally { setSaving(false); }
  };
  useEffect(() => {
    const token = localStorage.getItem("pp_token");

    if (token) {
      setForm((prev) => ({
        ...prev,
        authToken: token,
      }));
    }
  }, []);
  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">Configure your productivity preferences</p>
      </div>

      {/* Profile */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <User size={15} className="text-blue-500" />
          <p className="text-sm font-semibold text-slate-700">Account</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{user?.name}</p>
            <p className="text-sm text-slate-400">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Tracking settings */}
      {settings && (
        <div className="card p-6 space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={15} className="text-blue-500" />
            <p className="text-sm font-semibold text-slate-700">Tracking Preferences</p>
          </div>

          {[
            { key: 'trackingEnabled', label: 'Enable Time Tracking', desc: 'Record time spent on each website' },
            { key: 'blockingEnabled', label: 'Enable Site Blocking', desc: 'Block sites on your blocklist' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm text-slate-700 font-medium">{label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
              </div>
              <button
                onClick={() => update(key, !settings[key])}
                className={`relative w-11 h-6 rounded-full transition-colors ${settings[key] ? 'bg-blue-500' : 'bg-slate-200'}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${settings[key] ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          ))}

          <div className="space-y-1 pt-2">
            <label className="text-xs font-semibold text-slate-500">Daily Goal (hours)</label>
            <div className="flex items-center gap-3">
              <input
                type="range" min="1" max="16" step="0.5"
                value={(settings.dailyGoalMinutes || 480) / 60}
                onChange={(e) => update('dailyGoalMinutes', parseFloat(e.target.value) * 60)}
                className="flex-1 accent-blue-500"
              />
              <span className="text-sm font-semibold text-slate-700 w-12 text-right">
                {((settings.dailyGoalMinutes || 480) / 60).toFixed(1)}h
              </span>
            </div>
          </div>
        </div>
      )}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
        <p className="text-sm font-semibold text-slate-700">
          JWT Token
        </p>

        <textarea
          readOnly
          value={form.authToken || ''}
          className="w-full h-24 text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono"
        />

        <button
          onClick={() => {
            navigator.clipboard.writeText(form.authToken || '');
            alert('Token copied!');
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm"
        >
          Copy Token
        </button>
      </div>
      {/* Save */}
      <button
        onClick={save} disabled={saving}
        className={`flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-semibold transition-all ${saved ? 'bg-green-500 text-white' : 'btn-primary'
          }`}
      >
        {saved ? <><CheckCircle size={15} /> Saved!</> : saving ? 'Saving…' : <><Save size={15} /> Save Changes</>}
      </button>

      <button onClick={signOut} className="w-full text-center text-sm text-red-400 hover:text-red-600 transition-colors py-2">
        Sign out
      </button>
    </div>
  );
}
