import React from 'react';
import { Clock, TrendingUp, Target, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function formatTime(minutes) {
  if (!minutes) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function ScoreRing({ score }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={r} fill="none" stroke="#f1f5f9" strokeWidth="6" />
      <circle
        cx="36" cy="36" r={r} fill="none"
        stroke={color} strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 36 36)"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text x="36" y="40" textAnchor="middle" fontSize="14" fontWeight="700" fill="#0f172a">
        {score}%
      </text>
    </svg>
  );
}

export default function Dashboard({ data }) {
  const { todayStats, weeklyStats } = data;
  if (!todayStats) return null;

  const goalPct = Math.min(100, Math.round((todayStats.totalMinutes / (todayStats.goalMinutes || 480)) * 100));

  return (
    <div className="p-4 space-y-4">
      {/* Score Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium mb-1">Score</p>
              <p className="text-xs text-slate-500">Today's focus</p>
            </div>
            <ScoreRing score={todayStats.productivityScore} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-slate-400 font-medium mb-1">Screen Time</p>
              <p className="text-xl font-bold text-slate-800">{formatTime(todayStats.totalMinutes)}</p>
            </div>
            <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
              <Clock size={14} className="text-blue-500" />
            </div>
          </div>
          {/* Goal progress */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Goal</span>
              <span>{goalPct}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-700"
                style={{ width: `${goalPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Chart */}
      {weeklyStats.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-blue-500" />
            <p className="text-sm font-semibold text-slate-700">This Week</p>
          </div>
          <ResponsiveContainer width="100%" height={80}>
            <BarChart data={weeklyStats} barSize={16}>
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v) => [formatTime(v), 'Time']}
                contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
              <Bar dataKey="totalMinutes" radius={[4, 4, 0, 0]}>
                {weeklyStats.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={index === weeklyStats.length - 1 ? '#3b82f6' : '#dbeafe'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Sites */}
      {todayStats.topSites?.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} className="text-amber-500" />
            <p className="text-sm font-semibold text-slate-700">Top Sites</p>
          </div>
          <div className="space-y-2">
            {todayStats.topSites.slice(0, 5).map(({ domain, minutes, seconds }) => {
              const maxSec = todayStats.topSites[0].seconds || 1;
              const pct = Math.round((seconds / maxSec) * 100);
              return (
                <div key={domain} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
                        className="w-4 h-4 rounded flex-shrink-0"
                        alt=""
                        onError={(e) => { e.target.style.display='none'; }}
                      />
                      <span className="text-xs text-slate-700 truncate">{domain}</span>
                    </div>
                    <span className="text-xs text-slate-400 flex-shrink-0 ml-2">{formatTime(minutes)}</span>
                  </div>
                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-200 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {todayStats.topSites?.length === 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 text-center">
          <p className="text-3xl mb-2">📊</p>
          <p className="text-sm text-slate-500">No browsing data yet today.</p>
          <p className="text-xs text-slate-400 mt-1">Start browsing to see your stats!</p>
        </div>
      )}
    </div>
  );
}
