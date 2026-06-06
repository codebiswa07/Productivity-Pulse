import React, { useState } from 'react';
import { Shield, Plus, Trash2, ShieldCheck } from 'lucide-react';
import * as api from '../api/chrome-api';

export default function BlockedSites({ data }) {
  const { blockedSites, settings, refresh } = data;
  const [newSite, setNewSite]   = useState('');
  const [adding, setAdding]     = useState(false);
  const [removing, setRemoving] = useState(null);
  const [error, setError]       = useState('');

  const handleAdd = async () => {
    const clean = newSite.trim().toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    if (!clean) return;
    if (!/\.[a-z]{2,}/.test(clean)) {
      setError('Enter a valid domain (e.g. facebook.com)');
      return;
    }
    setAdding(true); setError('');
    try {
      await api.addBlockedSite(clean);
      setNewSite('');
      await refresh();
    } catch (e) { setError(e.message); }
    finally { setAdding(false); }
  };

  const handleRemove = async (domain) => {
    setRemoving(domain);
    try {
      await api.removeBlockedSite(domain);
      await refresh();
    } catch (e) { console.error(e); }
    finally { setRemoving(null); }
  };

  const toggleBlocking = async () => {
    await api.updateSettings({ blockingEnabled: !settings?.blockingEnabled });
    await refresh();
  };

  return (
    <div className="p-4 space-y-4">
      {/* Toggle */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${settings?.blockingEnabled ? 'bg-blue-50' : 'bg-slate-100'}`}>
              <Shield size={18} className={settings?.blockingEnabled ? 'text-blue-500' : 'text-slate-400'} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Site Blocking</p>
              <p className="text-xs text-slate-400">{settings?.blockingEnabled ? 'Active — blocking distractions' : 'Paused'}</p>
            </div>
          </div>
          <button
            onClick={toggleBlocking}
            className={`relative w-11 h-6 rounded-full transition-colors ${settings?.blockingEnabled ? 'bg-blue-500' : 'bg-slate-200'}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${settings?.blockingEnabled ? 'left-6' : 'left-1'}`} />
          </button>
        </div>
      </div>

      {/* Add site */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
        <p className="text-sm font-semibold text-slate-700 mb-3">Block a Website</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={newSite}
            onChange={(e) => { setNewSite(e.target.value); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="e.g. facebook.com"
            className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
          />
          <button
            onClick={handleAdd}
            disabled={adding || !newSite.trim()}
            className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center text-white hover:bg-blue-600 disabled:opacity-50 transition-colors flex-shrink-0"
          >
            <Plus size={16} />
          </button>
        </div>
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      </div>

      {/* Site list */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {blockedSites.length === 0 ? (
          <div className="p-6 text-center">
            <ShieldCheck size={28} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No sites blocked yet</p>
            <p className="text-xs text-slate-300 mt-1">Add distracting sites above</p>
          </div>
        ) : (
          <div>
            {blockedSites.map((site, i) => (
              <div
                key={site}
                className={`flex items-center justify-between px-4 py-3 ${i < blockedSites.length - 1 ? 'border-b border-slate-50' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${site}&sz=16`}
                    className="w-4 h-4 rounded"
                    alt=""
                    onError={(e) => { e.target.style.display='none'; }}
                  />
                  <span className="text-sm text-slate-700">{site}</span>
                </div>
                <button
                  onClick={() => handleRemove(site)}
                  disabled={removing === site}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  {removing === site
                    ? <span className="w-3 h-3 border border-slate-300 border-t-transparent rounded-full animate-spin" />
                    : <Trash2 size={13} />
                  }
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
