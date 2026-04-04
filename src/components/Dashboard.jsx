import { useState, useEffect, useMemo } from 'react';
import SleepChart from './SleepChart';

/**
 * Dashboard — analytics view with stats cards and chart
 * Shows average sleep, best/worst nights, and a bar chart
 */
export default function Dashboard({ logs, loading, onFetchLogs }) {
  const [period, setPeriod] = useState(7);

  // Fetch logs when period changes
  useEffect(() => {
    onFetchLogs(period);
  }, [period, onFetchLogs]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!logs || logs.length === 0) {
      return {
        average: null,
        best: null,
        worst: null,
        totalEntries: 0,
      };
    }

    const durations = logs
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
      bestMinutes: best,
      worst: formatDur(worst),
      worstMinutes: worst,
      totalEntries: durations.length,
    };
  }, [logs]);

  // Get quality label for average
  const getQualityLabel = (avgMinutes) => {
    if (!avgMinutes) return { text: 'No data', color: 'var(--color-text-muted)' };
    if (avgMinutes >= 420) return { text: 'Great', color: 'var(--color-success)' };
    if (avgMinutes >= 360) return { text: 'Fair', color: 'var(--color-warning)' };
    return { text: 'Needs improvement', color: 'var(--color-danger)' };
  };

  const quality = getQualityLabel(stats.averageMinutes);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Dashboard
          </h2>
          <p className="text-[var(--color-text-secondary)] text-sm mt-1">
            Your sleep analytics
          </p>
        </div>

        {/* Period toggle */}
        <div className="period-toggle" id="period-toggle">
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

      {/* Loading state */}
      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-24" />
            ))}
          </div>
          <div className="skeleton h-72" />
        </div>
      ) : (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-3" id="stats-grid">
            {/* Average sleep */}
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
                {stats.average || '—'}
              </p>
              <p className="text-xs mt-1" style={{ color: quality.color }}>
                {quality.text}
              </p>
            </div>

            {/* Best night */}
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
                {stats.best || '—'}
              </p>
            </div>

            {/* Worst night */}
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
                {stats.worst || '—'}
              </p>
            </div>

            {/* Total entries */}
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
                {stats.totalEntries}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                last {period} days
              </p>
            </div>
          </div>

          {/* Chart */}
          <SleepChart logs={logs} />
        </>
      )}
    </div>
  );
}
