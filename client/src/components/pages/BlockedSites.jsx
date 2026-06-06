import React, { useEffect, useState } from 'react';
import { Shield, Plus, Trash2, ShieldCheck, ShieldOff } from 'lucide-react';
import * as api from '../../api';

export default function BlockedSites() {
  const [sites,   setSites]   = useState([]);
  const [newSite, setNewSite] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding,  setAdding]  = useState(false);
  const [error,   setError]   = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.getBlockedSites();
      setSites(data.blockedSites || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    const clean = newSite.trim().toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    if (!clean || !/\.[a-z]{2,}/.test(clean)) { setError('Enter a valid domain'); return; }
    setAdding(true); setError('');
    try {
      await api.addBlockedSite(clean);
      setNewSite('');
      await load();
    } catch (e) { setError(e.response?.data?.error || e.message); }
    finally { setAdding(false); }
  };

  const handleRemove = async (site) => {
    try {
      await api.removeBlockedSite(site);
      setSites((s) => s.filter((x) => x !== site));
    } catch (e) { console.error(e); }
  };

  const PRESETS = ['facebook.com', 'instagram.com', 'twitter.com', 'reddit.com', 'youtube.com', 'tiktok.com'];
  const unblocked = PRESETS.filter((p) => !sites.includes(p));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Blocked Sites</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage your distraction blocklist</p>
      </div>

      {/* Add form */}
      <div className="card p-6">
        <p className="text-sm font-semibold text-slate-700 mb-4">Block a Website</p>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Shield size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text" value={newSite}
              onChange={(e) => { setNewSite(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="e.g. facebook.com"
              className="input pl-9"
            />
          </div>
          <button onClick={handleAdd} disabled={adding || !newSite.trim()} className="btn-primary flex items-center gap-2">
            <Plus size={15} /> {adding ? 'Adding…' : 'Block'}
          </button>
        </div>
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

        {/* Quick-add presets */}
        {unblocked.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-slate-400 mb-2">Quick add common distractions:</p>
            <div className="flex flex-wrap gap-2">
              {unblocked.map((p) => (
                <button
                  key={p}
                  onClick={() => { setNewSite(p); }}
                  className="text-xs bg-slate-50 border border-slate-200 text-slate-600 rounded-full px-3 py-1 hover:border-blue-300 hover:text-blue-600 transition-colors"
                >
                  + {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Blocked list */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-slate-50">
          <div className="flex items-center gap-2">
            {sites.length > 0 ? <Shield size={15} className="text-blue-500" /> : <ShieldOff size={15} className="text-slate-400" />}
            <p className="text-sm font-semibold text-slate-700">
              {sites.length > 0 ? `${sites.length} site${sites.length !== 1 ? 's' : ''} blocked` : 'No sites blocked'}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : sites.length === 0 ? (
          <div className="p-12 text-center">
            <ShieldCheck size={36} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Your blocklist is empty.</p>
            <p className="text-slate-300 text-xs mt-1">Add distracting sites above to block them.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {sites.map((site) => (
              <div key={site} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${site}&sz=16`}
                    className="w-5 h-5 rounded" alt=""
                    onError={(e) => { e.target.style.display='none'; }}
                  />
                  <span className="text-sm font-medium text-slate-700">{site}</span>
                </div>
                <button
                  onClick={() => handleRemove(site)}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  <Trash2 size={12} /> Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
