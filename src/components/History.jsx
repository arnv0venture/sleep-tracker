import { useEffect } from 'react';
import SleepTable from './SleepTable';

/**
 * History — full historical view of all sleep logs
 * Uses the SleepTable component with all-time fetch
 */
export default function History({ logs, loading, onFetchLogs, onUpdate, onDelete }) {
  // Fetch all logs on mount
  useEffect(() => {
    onFetchLogs(0); // 0 means all time
  }, [onFetchLogs]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
          History
        </h2>
        <p className="text-[var(--color-text-secondary)] text-sm mt-1">
          All your sleep records{logs.length > 0 ? ` (${logs.length} entries)` : ''}
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-20" />
          ))}
        </div>
      ) : (
        <SleepTable logs={logs} onUpdate={onUpdate} onDelete={onDelete} />
      )}
    </div>
  );
}
