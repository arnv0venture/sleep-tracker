import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import CategoryPill from './CategoryPill';
import ActivityEditModal from './ActivityEditModal';

/**
 * ActivityList — view and manage activity logs
 * Grouped by date with edit/delete actions
 */
export default function ActivityList({ activities, loading, onFetch, onUpdate, onDelete, categories }) {
  const [editingActivity, setEditingActivity] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [period, setPeriod] = useState(7);

  useEffect(() => {
    onFetch(period);
  }, [period, onFetch]);

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '—';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const handleDelete = async (id) => {
    try {
      await onDelete(id);
      toast.success('Activity deleted');
      setDeletingId(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  // Group activities by date
  const groupedByDate = {};
  activities.forEach((act) => {
    const key = act.date;
    if (!groupedByDate[key]) groupedByDate[key] = [];
    groupedByDate[key].push(act);
  });

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Activities
          </h2>
          <p className="text-[var(--color-text-secondary)] text-sm mt-1">
            Your logged activities{activities.length > 0 ? ` (${activities.length})` : ''}
          </p>
        </div>

        {/* Period toggle */}
        <div className="period-toggle" id="activity-period-toggle">
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
          <button
            className={`period-btn ${period === 0 ? 'active' : ''}`}
            onClick={() => setPeriod(0)}
          >
            All
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-20" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <svg className="mx-auto mb-3 opacity-30" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          <p className="text-[var(--color-text-muted)]">
            No activities logged yet. Start tracking!
          </p>
        </div>
      ) : (
        <div className="space-y-5" id="activity-list">
          {sortedDates.map((date) => (
            <div key={date}>
              {/* Date header */}
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                  {formatDate(date)}
                </h3>
                <div className="flex-1 h-px bg-[var(--color-border)]" />
                <span className="text-xs text-[var(--color-text-muted)]">
                  {formatDuration(
                    groupedByDate[date].reduce((sum, a) => sum + (a.duration_minutes || 0), 0)
                  )}
                </span>
              </div>

              {/* Activity cards */}
              <div className="space-y-2">
                {groupedByDate[date].map((act, index) => (
                  <div
                    key={act.id}
                    className="glass-card p-4 animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Left: title, category, times */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                            {act.title}
                          </p>
                          <CategoryPill category={act.categories} />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                          <span className="flex items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                            {formatTime(act.start_time)}
                          </span>
                          <span className="text-[var(--color-text-muted)]">→</span>
                          <span className="flex items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="6" y="4" width="12" height="16" rx="2" />
                            </svg>
                            {formatTime(act.end_time)}
                          </span>
                        </div>
                        {act.description && (
                          <p className="text-xs text-[var(--color-text-muted)] mt-1.5 truncate">
                            {act.description}
                          </p>
                        )}
                      </div>

                      {/* Right: duration + actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-semibold text-[var(--color-accent-light)]">
                          {formatDuration(act.duration_minutes)}
                        </span>

                        {/* Edit */}
                        <button
                          onClick={() => setEditingActivity(act)}
                          className="btn-icon"
                          title="Edit"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>

                        {/* Delete */}
                        {deletingId === act.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(act.id)}
                              className="btn-danger text-xs !px-2 !py-1"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeletingId(null)}
                              className="btn-secondary text-xs !px-2 !py-1"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeletingId(act.id)}
                            className="btn-icon !text-[var(--color-danger)] !border-[rgba(239,68,68,0.2)]"
                            title="Delete"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editingActivity && (
        <ActivityEditModal
          activity={editingActivity}
          categories={categories}
          onSave={onUpdate}
          onClose={() => setEditingActivity(null)}
        />
      )}
    </div>
  );
}
