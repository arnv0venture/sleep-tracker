import { useState } from 'react';
import toast from 'react-hot-toast';
import EditModal from './EditModal';

/**
 * SleepTable — historical list of sleep log entries
 * With edit/delete actions and confirmation dialog
 */
export default function SleepTable({ logs, onUpdate, onDelete }) {
  const [editingLog, setEditingLog] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('en-US', {
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
      toast.success('Log deleted');
      setDeletingId(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  if (!logs || logs.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <svg className="mx-auto mb-3 opacity-30" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <p className="text-[var(--color-text-muted)]">
          No sleep logs yet. Start tracking your sleep!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3" id="sleep-history-list">
        {logs.map((log, index) => (
          <div
            key={log.id}
            className="glass-card p-4 animate-fade-in-up"
            style={{ animationDelay: `${index * 0.03}s` }}
          >
            <div className="flex items-start justify-between gap-3">
              {/* Left: date & times */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {formatDate(log.sleep_time)}
                </p>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-[var(--color-text-secondary)]">
                  <span className="flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                    {formatTime(log.sleep_time)}
                  </span>
                  <span className="text-[var(--color-text-muted)]">→</span>
                  <span className="flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" />
                    </svg>
                    {formatTime(log.wake_time)}
                  </span>
                </div>
                {log.notes && (
                  <p className="text-xs text-[var(--color-text-muted)] mt-1.5 truncate">
                    {log.notes}
                  </p>
                )}
              </div>

              {/* Right: duration + actions */}
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-sm font-semibold ${
                  (log.duration_minutes || 0) >= 420
                    ? 'text-[var(--color-success)]'
                    : (log.duration_minutes || 0) >= 360
                    ? 'text-[var(--color-warning)]'
                    : 'text-[var(--color-danger)]'
                }`}>
                  {formatDuration(log.duration_minutes)}
                </span>

                {/* Edit button */}
                <button
                  onClick={() => setEditingLog(log)}
                  className="btn-icon"
                  title="Edit"
                  id={`edit-btn-${log.id}`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>

                {/* Delete button */}
                {deletingId === log.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(log.id)}
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
                    onClick={() => setDeletingId(log.id)}
                    className="btn-icon !text-[var(--color-danger)] !border-[rgba(239,68,68,0.2)]"
                    title="Delete"
                    id={`delete-btn-${log.id}`}
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

      {/* Edit modal */}
      {editingLog && (
        <EditModal
          log={editingLog}
          onSave={onUpdate}
          onClose={() => setEditingLog(null)}
        />
      )}
    </>
  );
}
