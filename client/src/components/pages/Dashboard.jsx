import React, { useEffect, useState } from 'react';
import { Clock, TrendingUp, Target, Zap, Flame, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import * as api from '../../api';

function formatTime(min) {
  if (!min && min !== 0) return '—';
  const h = Math.floor(min / 60), m = min % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function ScoreGauge({ score }) {
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444';
  const label = score >= 70 ? 'Excellent' : score >= 40 ? 'Good' : 'Needs Work';
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="10" />
          <circle
            cx="50" cy="50" r="40" fill="none"
            stroke={color} strokeWidth="10"
            strokeDasharray={`${(score / 100) * 251.2} 251.2`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-900">{score}%</span>
          <span className="text-xs text-slate-400 font-medium">{label}</span>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [daily,   setDaily]   = useState(null);
  const [weekly,  setWeekly]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const [d, w] = await Promise.all([api.getDailyReport(), api.getWeeklyReport()]);
      setDaily(d.data);
      setWeekly(w.data);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Loading your dashboard…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm">
      Error: {error}. <button onClick={fetchData} className="underline">Retry</button>
    </div>
  );

  const topColors = ['#3b82f6','#6366f1','#8b5cf6','#a78bfa','#c4b5fd'];
  const pieData   = daily?.topSites?.slice(0, 5).map(({ domain, minutes }) => ({
    name: domain, value: minutes,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 btn-secondary text-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Screen Time',  value: formatTime(daily?.totalMinutes),  icon: Clock,     color: 'blue'   },
          { label: 'Goal Progress',value: `${Math.min(100, Math.round((daily?.totalMinutes || 0)/(daily?.goalMinutes || 480)*100))}%`, icon: Target, color: 'green' },
          { label: 'Sites Visited', value: daily?.topSites?.length || 0,   icon: Zap,       color: 'violet' },
          { label: 'Top Site',     value: daily?.topSites?.[0]?.domain || '—', icon: TrendingUp, color: 'amber' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
              color === 'blue'   ? 'bg-blue-50'   :
              color === 'green'  ? 'bg-green-50'  :
              color === 'violet' ? 'bg-violet-50' : 'bg-amber-50'
            }`}>
              <Icon size={16} className={
                color === 'blue'   ? 'text-blue-500'   :
                color === 'green'  ? 'text-green-500'  :
                color === 'violet' ? 'text-violet-500' : 'text-amber-500'
              } />
            </div>
            <p className="text-xs text-slate-400 font-medium">{label}</p>
            <p className="text-lg font-bold text-slate-900 mt-0.5 truncate">{value}</p>
          </div>
        ))}
      </div>

      {/* Score + Top Sites */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card p-6 flex flex-col items-center justify-center">
          <p className="text-sm font-semibold text-slate-700 mb-4">Productivity Score</p>
          <ScoreGauge score={daily?.productivityScore || 0} />
          <p className="text-xs text-slate-400 mt-4 text-center">
            Based on time spent on productive vs. distracting sites
          </p>
        </div>

        <div className="card p-6 lg:col-span-2">
          <p className="text-sm font-semibold text-slate-700 mb-4">Top Sites Today</p>
          {daily?.topSites?.length > 0 ? (
            <div className="space-y-3">
              {daily.topSites.slice(0, 6).map(({ domain, minutes, seconds }, i) => {
                const maxSec = daily.topSites[0].seconds || 1;
                const pct    = Math.round((seconds / maxSec) * 100);
                return (
                  <div key={domain} className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 w-4 flex-shrink-0">{i + 1}</span>
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
                      className="w-4 h-4 rounded flex-shrink-0" alt=""
                      onError={(e) => { e.target.style.display='none'; }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-slate-700 truncate">{domain}</span>
                        <span className="text-xs text-slate-400 ml-2 flex-shrink-0">{formatTime(minutes)}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: topColors[i] || '#cbd5e1' }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <p className="text-3xl mb-2">📊</p>
              <p className="text-sm">No browsing data for today yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Weekly Chart */}
      {weekly?.week && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm font-semibold text-slate-700">Weekly Overview</p>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <div className="w-2 h-2 bg-blue-500 rounded-full" /> Minutes
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weekly.week} barSize={32}>
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                tickFormatter={(v) => v >= 60 ? `${Math.floor(v/60)}h` : `${v}m`}
              />
              <Tooltip
                formatter={(v) => [formatTime(v), 'Time']}
                contentStyle={{ fontSize: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,.08)' }}
                cursor={{ fill: '#f1f5f9', radius: 8 }}
              />
              <Bar dataKey="totalMinutes" radius={[6, 6, 0, 0]}>
                {weekly.week.map((_, i) => (
                  <Cell key={i} fill={i === weekly.week.length - 1 ? '#3b82f6' : '#dbeafe'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
