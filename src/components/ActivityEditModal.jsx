import { useState } from 'react';
import toast from 'react-hot-toast';
import DateTimePicker from './DateTimePicker';

/**
 * ActivityEditModal — modal to edit an existing activity log
 * Same pattern as EditModal.jsx for sleep logs
 */
export default function ActivityEditModal({ activity, categories, onSave, onClose }) {
  const toLocalInput = (isoString) => {
    const d = new Date(isoString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${mins}`;
  };

  const [title, setTitle] = useState(activity.title);
  const [description, setDescription] = useState(activity.description || '');
  const [categoryId, setCategoryId] = useState(activity.category_id || '');
  const [startTime, setStartTime] = useState(toLocalInput(activity.start_time));
  const [endTime, setEndTime] = useState(toLocalInput(activity.end_time));
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (end <= start) {
      toast.error('End time must be after start time');
      return;
    }

    setLoading(true);
    try {
      const date = start.toISOString().split('T')[0];
      await onSave(activity.id, {
        title: title.trim(),
        description: description || null,
        category_id: categoryId || null,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        date,
      });
      toast.success('Activity updated ✓');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories?.find((c) => c.id === categoryId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-card p-6 w-full max-w-md animate-fade-in-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        id="activity-edit-modal"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Edit Activity
          </h3>
          <button onClick={onClose} className="btn-icon" id="activity-edit-close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="edit-activity-title" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              Title
            </label>
            <input
              id="edit-activity-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              required
              maxLength={100}
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="edit-activity-category" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              Category
            </label>
            <select
              id="edit-activity-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="input-field appearance-none"
              style={{
                borderLeft: selectedCategory
                  ? `3px solid ${selectedCategory.color}`
                  : undefined,
              }}
            >
              <option value="">No category</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Start time */}
          <DateTimePicker
            id="edit-activity-start"
            value={startTime}
            onChange={setStartTime}
            label="Started at"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            }
          />

          {/* End time */}
          <DateTimePicker
            id="edit-activity-end"
            value={endTime}
            onChange={setEndTime}
            label="Ended at"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="4" width="12" height="16" rx="2" />
              </svg>
            }
          />

          {/* Description */}
          <div>
            <label htmlFor="edit-activity-desc" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              Notes
            </label>
            <textarea
              id="edit-activity-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="input-field resize-none"
              placeholder="Optional notes..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1" id="activity-edit-save">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
