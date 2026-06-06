import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Calendar, TrendingUp } from 'lucide-react';
import * as api from '../../api';

function formatTime(min) {
  if (!min) return '0m';
  const h = Math.floor(min / 60), m = min % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function Reports() {
  const [weekly, setWeekly] = useState(null);
  const [date,   setDate]   = useState(new Date().toISOString().split('T')[0]);
  const [daily,  setDaily]  = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getWeeklyReport(), api.getDailyReport(date)])
      .then(([w, d]) => { setWeekly(w.data); setDaily(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api.getDailyReport(date).then((r) => setDaily(r.data)).catch(console.error);
  }, [date]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="text-slate-500 text-sm mt-0.5">Analyze your productivity trends</p>
      </div>

      {/* Date picker for daily report */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-blue-500" />
            <p className="text-sm font-semibold text-slate-700">Daily Report</p>
          </div>
          <input
            type="date" value={date} max={new Date().toISOString().split('T')[0]}
            onChange={(e) => setDate(e.target.value)}
            className="input sm:w-48"
          />
        </div>

        {daily && (
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-xs text-blue-600 font-medium">Total Time</p>
              <p className="text-xl font-bold text-blue-900 mt-1">{formatTime(daily.totalMinutes)}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-xs text-green-600 font-medium">Productivity Score</p>
              <p className="text-xl font-bold text-green-900 mt-1">{daily.productivityScore}%</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500 font-medium">Sites Visited</p>
              <p className="text-xl font-bold text-slate-900 mt-1">{daily.topSites?.length || 0}</p>
            </div>
          </div>
        )}

        {daily?.topSites?.length > 0 ? (
          <div className="space-y-2">
            {daily.topSites.map(({ domain, minutes }, i) => (
              <div key={domain} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-slate-400 w-4">{i + 1}</span>
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
                    className="w-4 h-4 rounded" alt=""
                    onError={(e) => { e.target.style.display='none'; }}
                  />
                  <span className="text-sm text-slate-700">{domain}</span>
                </div>
                <span className="text-sm font-semibold text-slate-600">{formatTime(minutes)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-4">No data for this date.</p>
        )}
      </div>

      {/* Weekly trend */}
      {weekly?.week && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={15} className="text-blue-500" />
            <p className="text-sm font-semibold text-slate-700">Weekly Productivity Score</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weekly.week}>
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                formatter={(v) => [`${v}%`, 'Score']}
                contentStyle={{ fontSize: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}
              />
              <Line type="monotone" dataKey="productivityScore" stroke="#3b82f6" strokeWidth={2.5}
                dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
