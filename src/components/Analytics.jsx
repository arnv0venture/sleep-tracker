import { useState, useEffect, useMemo } from 'react';
import SleepChart from './SleepChart';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie,
} from 'recharts';

/**
 * Analytics — unified dashboard combining sleep + activity analytics
 * Two tab views: Sleep and Activities
 */
export default function Analytics({
  sleepLogs, sleepLoading, onFetchSleepLogs,
  activities, activityLoading, onFetchActivities,
  categories,
}) {
  const [period, setPeriod] = useState(7);
  const [tab, setTab] = useState('sleep');

  useEffect(() => {
    onFetchSleepLogs(period);
    onFetchActivities(period);
  }, [period, onFetchSleepLogs, onFetchActivities]);

  // ====== SLEEP STATS ======
  const sleepStats = useMemo(() => {
    if (!sleepLogs || sleepLogs.length === 0) {
      return { average: null, best: null, worst: null, totalEntries: 0 };
    }

    const durations = sleepLogs
      .map((l) => l.duration_minutes)
      .filter((d) => d != null && d > 0);

    if (durations.length === 0) {
      return { average: null, best: null, worst: null, totalEntries: 0 };
    }

    const total = durations.reduce((sum, d) => sum + d, 0);
    const avg = total / durations.length;
    const best = Math.max(...durations);
    const worst = Math.min(...durations);

    const formatDur = (m) => {
      const h = Math.floor(m / 60);
      const mins = Math.round(m % 60);
      return `${h}h ${mins}m`;
    };

    return {
      average: formatDur(avg),
      averageMinutes: avg,
      best: formatDur(best),
      worst: formatDur(worst),
      totalEntries: durations.length,
    };
  }, [sleepLogs]);

  const getSleepQuality = (avgMinutes) => {
    if (!avgMinutes) return { text: 'No data', color: 'var(--color-text-muted)' };
    if (avgMinutes >= 420) return { text: 'Great', color: 'var(--color-success)' };
    if (avgMinutes >= 360) return { text: 'Fair', color: 'var(--color-warning)' };
    return { text: 'Needs improvement', color: 'var(--color-danger)' };
  };

  // ====== ACTIVITY STATS ======
  const activityStats = useMemo(() => {
    if (!activities || activities.length === 0) {
      return {
        totalActivities: 0,
        totalMinutes: 0,
        totalFormatted: '0h 0m',
        avgPerDay: '0h 0m',
        categoryBreakdown: [],
        dailyData: [],
      };
    }

    const totalMinutes = activities.reduce((sum, a) => sum + (a.duration_minutes || 0), 0);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;

    // Category breakdown for pie chart
    const catMap = {};
    activities.forEach((a) => {
      const catName = a.categories?.name || 'Uncategorized';
      const catColor = a.categories?.color || '#64748b';
      if (!catMap[catName]) {
        catMap[catName] = { name: catName, color: catColor, minutes: 0, count: 0 };
      }
      catMap[catName].minutes += a.duration_minutes || 0;
      catMap[catName].count += 1;
    });

    const categoryBreakdown = Object.values(catMap).sort((a, b) => b.minutes - a.minutes);

    // Daily data for bar chart
    const byDate = {};
    activities.forEach((a) => {
      const date = a.date;
      const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      if (!byDate[date]) {
        byDate[date] = { date: displayDate, dateKey: date, hours: 0, count: 0 };
      }
      byDate[date].hours += (a.duration_minutes || 0) / 60;
      byDate[date].count += 1;
    });

    const dailyData = Object.values(byDate)
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
      .map((d) => ({ ...d, hours: Math.round(d.hours * 10) / 10 }));

    // Avg per day
    const uniqueDays = new Set(activities.map((a) => a.date)).size;
    const avgMinPerDay = uniqueDays > 0 ? totalMinutes / uniqueDays : 0;
    const avgH = Math.floor(avgMinPerDay / 60);
    const avgM = Math.round(avgMinPerDay % 60);

    return {
      totalActivities: activities.length,
      totalMinutes,
      totalFormatted: `${h}h ${m}m`,
      avgPerDay: `${avgH}h ${avgM}m`,
      categoryBreakdown,
      dailyData,
    };
  }, [activities]);

  const loading = tab === 'sleep' ? sleepLoading : activityLoading;
  const sleepQuality = getSleepQuality(sleepStats.averageMinutes);

  // Custom tooltip for activity chart
  const ActivityTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const hours = payload[0].value;
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return (
      <div className="glass-card p-3 !rounded-lg text-sm">
        <p className="text-[var(--color-text-secondary)] mb-1">{label}</p>
        <p className="font-semibold text-[var(--color-text-primary)]">{h}h {m}m</p>
      </div>
    );
  };

  // Custom tooltip for pie chart
  const PieTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;
    const h = Math.floor(data.minutes / 60);
    const m = data.minutes % 60;
    return (
      <div className="glass-card p-3 !rounded-lg text-sm">
        <p className="font-semibold text-[var(--color-text-primary)]">{data.name}</p>
        <p className="text-[var(--color-text-secondary)]">{h}h {m}m • {data.count} activities</p>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Analytics
          </h2>
          <p className="text-[var(--color-text-secondary)] text-sm mt-1">
            Your life dashboard
          </p>
        </div>

        {/* Period toggle */}
        <div className="period-toggle" id="analytics-period-toggle">
          <button
            className={`period-btn ${period === 7 ? 'active' : ''}`}
            onClick={() => setPeriod(7)}
          >
            7 days
          </button>
          <button
            className={`period-btn ${period === 30 ? 'active' : ''}`}
            onClick={() => setPeriod(30)}
          >
            30 days
          </button>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="tab-bar" id="analytics-tabs">
        <button
          className={`tab-btn ${tab === 'sleep' ? 'active' : ''}`}
          onClick={() => setTab('sleep')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
          Sleep
        </button>
        <button
          className={`tab-btn ${tab === 'activities' ? 'active' : ''}`}
          onClick={() => setTab('activities')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          Activities
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-24" />
            ))}
          </div>
          <div className="skeleton h-72" />
        </div>
      ) : tab === 'sleep' ? (
        /* ====== SLEEP TAB ====== */
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-3" id="sleep-stats-grid">
            <div className="stat-card stagger-1 animate-fade-in-up">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-[var(--color-accent-glow)] flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 20V10M12 20V4M6 20v-6" />
                  </svg>
                </div>
                <span className="text-xs text-[var(--color-text-muted)]">Average</span>
              </div>
              <p className="text-xl font-bold text-[var(--color-text-primary)]">
                {sleepStats.average || '—'}
              </p>
              <p className="text-xs mt-1" style={{ color: sleepQuality.color }}>
                {sleepQuality.text}
              </p>
            </div>

            <div className="stat-card stagger-2 animate-fade-in-up">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-[var(--color-success-soft)] flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  </svg>
                </div>
                <span className="text-xs text-[var(--color-text-muted)]">Best Night</span>
              </div>
              <p className="text-xl font-bold text-[var(--color-success)]">
                {sleepStats.best || '—'}
              </p>
            </div>

            <div className="stat-card stagger-3 animate-fade-in-up">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-[var(--color-danger-soft)] flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                  </svg>
                </div>
                <span className="text-xs text-[var(--color-text-muted)]">Worst Night</span>
              </div>
              <p className="text-xl font-bold text-[var(--color-danger)]">
                {sleepStats.worst || '—'}
              </p>
            </div>

            <div className="stat-card stagger-4 animate-fade-in-up">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-[rgba(99,102,241,0.15)] flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <span className="text-xs text-[var(--color-text-muted)]">Entries</span>
              </div>
              <p className="text-xl font-bold text-[var(--color-text-primary)]">
                {sleepStats.totalEntries}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">last {period} days</p>
            </div>
          </div>

          <SleepChart logs={sleepLogs} />
        </>
      ) : (
        /* ====== ACTIVITIES TAB ====== */
        <>
          {/* Activity stats cards */}
          <div className="grid grid-cols-2 gap-3" id="activity-stats-grid">
            <div className="stat-card stagger-1 animate-fade-in-up">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-[var(--color-accent-glow)] flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
                <span className="text-xs text-[var(--color-text-muted)]">Activities</span>
              </div>
              <p className="text-xl font-bold text-[var(--color-text-primary)]">
                {activityStats.totalActivities}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">last {period} days</p>
            </div>

            <div className="stat-card stagger-2 animate-fade-in-up">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-[var(--color-success-soft)] flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <span className="text-xs text-[var(--color-text-muted)]">Total Time</span>
              </div>
              <p className="text-xl font-bold text-[var(--color-success)]">
                {activityStats.totalFormatted}
              </p>
            </div>

            <div className="stat-card stagger-3 animate-fade-in-up">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-[rgba(99,102,241,0.15)] flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 20V10M12 20V4M6 20v-6" />
                  </svg>
                </div>
                <span className="text-xs text-[var(--color-text-muted)]">Avg / Day</span>
              </div>
              <p className="text-xl font-bold text-[#818cf8]">
                {activityStats.avgPerDay}
              </p>
            </div>

            <div className="stat-card stagger-4 animate-fade-in-up">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-[rgba(236,72,153,0.15)] flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                </div>
                <span className="text-xs text-[var(--color-text-muted)]">Categories</span>
              </div>
              <p className="text-xl font-bold text-[#ec4899]">
                {activityStats.categoryBreakdown.length}
              </p>
            </div>
          </div>

          {/* Category breakdown pie chart */}
          {activityStats.categoryBreakdown.length > 0 && (
            <div className="glass-card p-4 sm:p-6" id="category-chart">
              <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-4">
                Time by Category
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={activityStats.categoryBreakdown}
                      dataKey="minutes"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {activityStats.categoryBreakdown.map((entry, index) => (
                        <Cell key={index} fill={entry.color} fillOpacity={0.85} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
                {activityStats.categoryBreakdown.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color }} />
                    <span>{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Daily activity chart */}
          {activityStats.dailyData.length > 0 && (
            <div className="glass-card p-4 sm:p-6" id="activity-daily-chart">
              <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-4">
                Daily Activity Time
              </h3>
              <div className="h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityStats.dailyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 'auto']}
                      unit="h"
                    />
                    <Tooltip content={<ActivityTooltip />} cursor={{ fill: 'rgba(124, 58, 237, 0.05)' }} />
                    <Bar dataKey="hours" radius={[6, 6, 0, 0]} maxBarSize={40}>
                      {activityStats.dailyData.map((_, index) => (
                        <Cell key={index} fill="var(--color-accent)" fillOpacity={0.75} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activityStats.totalActivities === 0 && (
            <div className="glass-card p-8 text-center">
              <p className="text-[var(--color-text-muted)]">
                No activity data yet. Start logging to see analytics!
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
