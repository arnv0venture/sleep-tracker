import { useState } from 'react';
import toast from 'react-hot-toast';
import DateTimePicker from './DateTimePicker';

/**
 * EditModal — modal dialog to edit an existing sleep log entry
 * Pre-filled with the existing log data, uses 12-hour time picker
 */
export default function EditModal({ log, onSave, onClose }) {
  // Format ISO date to datetime-local value
  const toLocalInput = (isoString) => {
    const d = new Date(isoString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${mins}`;
  };

  const [sleepTime, setSleepTime] = useState(toLocalInput(log.sleep_time));
  const [wakeTime, setWakeTime] = useState(toLocalInput(log.wake_time));
  const [notes, setNotes] = useState(log.notes || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();

    const start = new Date(sleepTime);
    const end = new Date(wakeTime);
    if (end <= start) {
      toast.error('Wake time must be after sleep time');
      return;
    }

    setLoading(true);
    try {
      await onSave(log.id, {
        sleep_time: start.toISOString(),
        wake_time: end.toISOString(),
        notes: notes || null,
      });
      toast.success('Log updated ✓');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-card p-6 w-full max-w-md animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
        id="edit-modal"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Edit Sleep Log
          </h3>
          <button onClick={onClose} className="btn-icon" id="edit-modal-close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <DateTimePicker
            id="edit-sleep"
            value={sleepTime}
            onChange={setSleepTime}
            label="Went to sleep"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            }
          />

          <DateTimePicker
            id="edit-wake"
            value={wakeTime}
            onChange={setWakeTime}
            label="Woke up"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
              </svg>
            }
          />

          <div>
            <label htmlFor="edit-notes" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              Notes
            </label>
            <textarea
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="input-field resize-none"
              placeholder="Optional notes..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1" id="edit-save-btn">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
