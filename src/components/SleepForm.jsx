import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import DateTimePicker from './DateTimePicker';

/**
 * SleepForm — log a new sleep entry
 * 12-hour time pickers with real-time duration calculation
 */
export default function SleepForm({ onAdd }) {
  const [sleepTime, setSleepTime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Calculate duration in real-time as user selects times
  const duration = useMemo(() => {
    if (!sleepTime || !wakeTime) return null;
    const start = new Date(sleepTime);
    const end = new Date(wakeTime);
    const diffMs = end - start;

    if (isNaN(diffMs) || diffMs <= 0) return { valid: false, text: 'Wake time must be after sleep time' };

    const totalMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return {
      valid: true,
      hours,
      minutes,
      totalMinutes,
      text: `${hours}h ${minutes}m`,
    };
  }, [sleepTime, wakeTime]);

  // Pre-fill with sensible defaults (last night 11PM → this morning 7AM)
  const prefillLastNight = () => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(23, 0, 0, 0);

    const today = new Date(now);
    today.setHours(7, 0, 0, 0);

    const fmt = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${mins}`;
    };

    setSleepTime(fmt(yesterday));
    setWakeTime(fmt(today));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!duration?.valid) {
      toast.error('Please enter valid sleep and wake times');
      return;
    }

    setLoading(true);
    try {
      await onAdd(
        new Date(sleepTime).toISOString(),
        new Date(wakeTime).toISOString(),
        notes
      );
      toast.success(`Logged ${duration.text} of sleep 🌙`);
      setSleepTime('');
      setWakeTime('');
      setNotes('');
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page title */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Log Sleep
        </h2>
        <p className="text-[var(--color-text-secondary)] text-sm mt-1">
          Record when you went to bed and woke up
        </p>
      </div>

      <div className="glass-card p-6" id="sleep-form-card">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Quick fill button */}
          <button
            type="button"
            onClick={prefillLastNight}
            className="btn-secondary text-xs"
            id="prefill-btn"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
            Quick fill: Last night (11 PM → 7 AM)
          </button>

          {/* Sleep time — 12-hour picker */}
          <DateTimePicker
            id="sleep-time"
            value={sleepTime}
            onChange={setSleepTime}
            label="Went to sleep"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            }
          />

          {/* Wake time — 12-hour picker */}
          <DateTimePicker
            id="wake-time"
            value={wakeTime}
            onChange={setWakeTime}
            label="Woke up"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            }
          />

          {/* Duration preview */}
          {duration && (
            <div
              className={`rounded-xl p-4 text-center transition-all ${
                duration.valid
                  ? 'bg-[var(--color-success-soft)] border border-[rgba(16,185,129,0.2)]'
                  : 'bg-[var(--color-danger-soft)] border border-[rgba(239,68,68,0.2)]'
              }`}
              id="duration-preview"
            >
              {duration.valid ? (
                <div>
                  <p className="text-xs text-[var(--color-text-secondary)] mb-1">Total sleep</p>
                  <p className="text-3xl font-bold text-[var(--color-success)]">
                    {duration.text}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-[var(--color-danger)]">{duration.text}</p>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
            >
              Notes <span className="text-[var(--color-text-muted)]">(optional)</span>
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did you sleep? Any dreams?"
              rows={3}
              className="input-field resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !duration?.valid}
            className="btn-primary w-full"
            id="log-sleep-btn"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Log Sleep
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
