import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const hours = payload[0].value;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);

  return (
    <div className="glass-card p-3 !rounded-lg text-sm">
      <p className="text-[var(--color-text-secondary)] mb-1">{label}</p>
      <p className="font-semibold text-[var(--color-text-primary)]">
        {h}h {m}m
      </p>
    </div>
  );
}

/**
 * SleepChart — bar chart showing daily sleep hours
 * Uses Recharts with gradient fills and an 8-hour reference line
 */
export default function SleepChart({ logs }) {
  // Aggregate logs by date (a single day can have multiple naps)
  const chartData = useMemo(() => {
    if (!logs || logs.length === 0) return [];

    const byDate = {};

    logs.forEach((log) => {
      // Use the wake_time's date as the "sleep day"
      const date = new Date(log.wake_time).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      const dateKey = new Date(log.wake_time).toISOString().split('T')[0];

      if (!byDate[dateKey]) {
        byDate[dateKey] = { date, dateKey, hours: 0 };
      }
      byDate[dateKey].hours += (log.duration_minutes || 0) / 60;
    });

    // Sort by date ascending and round hours
    return Object.values(byDate)
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
      .map((d) => ({
        ...d,
        hours: Math.round(d.hours * 10) / 10,
      }));
  }, [logs]);

  if (chartData.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-[var(--color-text-muted)]">
          No sleep data yet. Start logging to see your chart!
        </p>
      </div>
    );
  }

  // Color each bar based on sleep quality
  const getBarColor = (hours) => {
    if (hours >= 7 && hours <= 9) return '#10b981'; // Good — green
    if (hours >= 6) return '#f59e0b';               // OK — amber
    return '#ef4444';                                 // Poor — red
  };

  return (
    <div className="glass-card p-4 sm:p-6" id="sleep-chart">
      <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-4">
        Daily Sleep Duration
      </h3>
      <div className="h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.9} />
                <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0.4} />
              </linearGradient>
            </defs>
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
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124, 58, 237, 0.05)' }} />
            <ReferenceLine
              y={8}
              stroke="var(--color-accent-light)"
              strokeDasharray="4 4"
              strokeOpacity={0.5}
              label={{
                value: '8h goal',
                position: 'right',
                fill: 'var(--color-text-muted)',
                fontSize: 10,
              }}
            />
            <Bar dataKey="hours" radius={[6, 6, 0, 0]} maxBarSize={40}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={getBarColor(entry.hours)} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3 text-xs text-[var(--color-text-muted)]">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
          <span>7-9h (Good)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
          <span>6-7h (OK)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
          <span>&lt;6h (Low)</span>
        </div>
      </div>
    </div>
  );
}
