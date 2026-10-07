import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts';
import { getStats } from '../services/api';

export default function DashboardAnalytics({ lang, t }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStats();
      setStats(data);
    } catch (err) {
      console.error("Stats error:", err);
      setError(t.errorBackendDown);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/[0.08] dark:border-white/[0.08]">
        <div>
          <span className="label-meta block mb-1">Metrics</span>
          <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-neutral-900 dark:text-neutral-100">
            {t.dashTitle}
          </h2>
        </div>

        <button
          onClick={fetchStats}
          className="p-1.5 rounded-md border border-black/[0.08] dark:border-white/[0.08] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
          title="Refresh Stats"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs font-mono text-neutral-400">
          Computing analytics...
        </div>
      ) : error ? (
        <div className="p-6 text-center text-xs text-red-500 border border-red-500/20 rounded-xl">
          {error}
        </div>
      ) : stats ? (
        <div className="space-y-8">
          {/* 4 Clean Metric Blocks */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-black/[0.08] dark:bg-white/[0.08] rounded-xl overflow-hidden border border-black/[0.08] dark:border-white/[0.08]">
            <div className="bg-white dark:bg-[#1c1b1a] p-4 text-center">
              <span className="label-meta block">{t.dashTotalScans}</span>
              <span className="font-mono text-2xl font-medium text-neutral-900 dark:text-neutral-100 block mt-1">
                {stats.total_scans}
              </span>
            </div>

            <div className="bg-white dark:bg-[#1c1b1a] p-4 text-center">
              <span className="label-meta block">{t.dashHealthyRatio}</span>
              <span className="font-mono text-2xl font-medium text-emerald-700 dark:text-emerald-400 block mt-1">
                {stats.healthy_scans}
              </span>
            </div>

            <div className="bg-white dark:bg-[#1c1b1a] p-4 text-center">
              <span className="label-meta block">{t.dashDiseasedRatio}</span>
              <span className="font-mono text-2xl font-medium text-amber-700 dark:text-amber-400 block mt-1">
                {stats.diseased_scans}
              </span>
            </div>

            <div className="bg-white dark:bg-[#1c1b1a] p-4 text-center">
              <span className="label-meta block">{t.dashCriticalAlerts}</span>
              <span className="font-mono text-2xl font-medium text-rose-700 dark:text-rose-400 block mt-1">
                {stats.critical_alerts}
              </span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Prevalent Diseases BarChart */}
            <div className="border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-5 bg-white dark:bg-[#1c1b1a]">
              <span className="label-meta block mb-4">{t.dashTopDiseasesTitle}</span>
              {stats.top_diseases && stats.top_diseases.length > 0 ? (
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.top_diseases} layout="vertical" margin={{ left: 10, right: 10, top: 0, bottom: 0 }}>
                      <XAxis type="number" stroke="#888" fontSize={10} />
                      <YAxis type="category" dataKey="disease" width={90} stroke="#888" fontSize={10} />
                      <Tooltip
                        contentStyle={{ background: '#1c1b1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '11px', color: '#fff' }}
                      />
                      <Bar dataKey="count" fill="#1a1a1a" radius={[0, 4, 4, 0]} className="dark:fill-neutral-200" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-56 flex items-center justify-center text-xs font-mono text-neutral-400">
                  No records yet.
                </div>
              )}
            </div>

            {/* Scan Trend AreaChart */}
            <div className="border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-5 bg-white dark:bg-[#1c1b1a]">
              <span className="label-meta block mb-4">{t.dashActivityTitle}</span>
              {stats.recent_activity && stats.recent_activity.length > 0 ? (
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.recent_activity} margin={{ left: -25, right: 10, top: 0, bottom: 0 }}>
                      <XAxis dataKey="date" stroke="#888" fontSize={10} />
                      <YAxis stroke="#888" fontSize={10} />
                      <Tooltip
                        contentStyle={{ background: '#1c1b1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '11px', color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="scans" stroke="#1a1a1a" strokeWidth={1.5} fillOpacity={0.08} fill="#1a1a1a" className="dark:stroke-neutral-200 dark:fill-neutral-200" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-56 flex items-center justify-center text-xs font-mono text-neutral-400">
                  No activity logged yet.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
