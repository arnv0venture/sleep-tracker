import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import DateTimePicker from './DateTimePicker';

/**
 * ActivityForm — log a new activity with start/end time
 * Same time-picking UX as SleepForm
 */
export default function ActivityForm({ categories, onAdd, onFetchCategories }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    onFetchCategories();
  }, [onFetchCategories]);

  // Calculate duration in real-time
  const duration = useMemo(() => {
    if (!startTime || !endTime) return null;
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;

    if (isNaN(diffMs) || diffMs <= 0) return { valid: false, text: 'End time must be after start time' };

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
  }, [startTime, endTime]);

  // Pre-fill common timeblocks
  const prefillMorning = () => {
    const today = new Date();
    const fmt = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${mins}`;
    };
    const morning = new Date(today);
    morning.setHours(9, 0, 0, 0);
    const noon = new Date(today);
    noon.setHours(12, 0, 0, 0);
    setStartTime(fmt(morning));
    setEndTime(fmt(noon));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter an activity title');
      return;
    }

    if (!duration?.valid) {
      toast.error('Please enter valid start and end times');
      return;
    }

    setLoading(true);
    try {
      const date = new Date(startTime).toISOString().split('T')[0];
      await onAdd(
        title.trim(),
        description,
        categoryId || null,
        new Date(startTime).toISOString(),
        new Date(endTime).toISOString(),
        date,
      );
      toast.success(`Logged "${title.trim()}" — ${duration.text} ⚡`);
      setTitle('');
      setDescription('');
      setCategoryId('');
      setStartTime('');
      setEndTime('');
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find((c) => c.id === categoryId);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page title */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Log Activity
        </h2>
        <p className="text-[var(--color-text-secondary)] text-sm mt-1">
          Record what you worked on and for how long
        </p>
      </div>

      <div className="glass-card p-6" id="activity-form-card">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Quick fill */}
          <button
            type="button"
            onClick={prefillMorning}
            className="btn-secondary text-xs"
            id="prefill-activity-btn"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            Quick fill: Morning block (9 AM → 12 PM)
          </button>

          {/* Title */}
          <div>
            <label
              htmlFor="activity-title"
              className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
            >
              Activity Title
            </label>
            <input
              id="activity-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What did you work on?"
              className="input-field"
              required
              maxLength={100}
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="activity-category"
              className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
            >
              Category
            </label>
            <div className="relative">
              <select
                id="activity-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="input-field appearance-none pr-10"
                style={{
                  borderLeft: selectedCategory
                    ? `3px solid ${selectedCategory.color}`
                    : undefined,
                }}
              >
                <option value="">No category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-muted)]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
            {categories.length === 0 && (
              <p className="text-xs text-[var(--color-text-muted)] mt-1.5">
                No categories yet — create them in the Categories tab
              </p>
            )}
          </div>

          {/* Start Time */}
          <DateTimePicker
            id="activity-start"
            value={startTime}
            onChange={setStartTime}
            label="Started at"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            }
          />

          {/* End Time */}
          <DateTimePicker
            id="activity-end"
            value={endTime}
            onChange={setEndTime}
            label="Ended at"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="4" width="12" height="16" rx="2" />
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
              id="activity-duration-preview"
            >
              {duration.valid ? (
                <div>
                  <p className="text-xs text-[var(--color-text-secondary)] mb-1">Duration</p>
                  <p className="text-3xl font-bold text-[var(--color-success)]">
                    {duration.text}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-[var(--color-danger)]">{duration.text}</p>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <label
              htmlFor="activity-description"
              className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
            >
              Notes <span className="text-[var(--color-text-muted)]">(optional)</span>
            </label>
            <textarea
              id="activity-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Any details about this activity?"
              rows={3}
              className="input-field resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !duration?.valid || !title.trim()}
            className="btn-primary w-full"
            id="log-activity-btn"
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
                Log Activity
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
