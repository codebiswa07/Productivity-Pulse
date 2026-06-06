import React, { useState } from 'react';
import { Activity, Shield, Settings, BarChart2, Clock, Flame } from 'lucide-react';
import Dashboard from './components/Dashboard';
import BlockedSites from './components/BlockedSites';
import SettingsPanel from './components/SettingsPanel';
import { useExtensionData } from './hooks/useExtensionData';

const TABS = [
  { id: 'dashboard', label: 'Today',    icon: Activity },
  { id: 'blocked',   label: 'Blocked',  icon: Shield },
  { id: 'settings',  label: 'Settings', icon: Settings },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const data = useExtensionData();

  return (
    <div className="flex flex-col h-full min-h-[500px] bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
            <img src="./logo/logo.png" alt="logo" />
          </div>
          <span className="font-semibold text-slate-800 text-sm">ProductivityPulse</span>
        </div>
        {data.streak?.count > 0 && (
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
            <Flame size={12} className="text-amber-500" />
            <span className="text-xs font-semibold text-amber-700">{data.streak.count}d streak</span>
          </div>
        )}
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {data.loading && !data.todayStats ? (
          <div className="flex items-center justify-center h-full py-16">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-400">Loading your data…</p>
            </div>
          </div>
        ) : data.error ? (
          <div className="p-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
              <strong>Extension not connected.</strong><br />
              Make sure the extension is loaded and the service worker is running.
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && <Dashboard data={data} />}
            {activeTab === 'blocked'   && <BlockedSites data={data} />}
            {activeTab === 'settings'  && <SettingsPanel data={data} />}
          </>
        )}
      </div>

      {/* Bottom Nav */}
      <nav className="bg-white border-t border-slate-100 flex">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
              activeTab === id
                ? 'text-blue-600'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
