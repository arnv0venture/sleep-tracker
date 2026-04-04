import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const PRESET_COLORS = [
  '#7c3aed', '#6366f1', '#3b82f6', '#06b6d4', '#10b981',
  '#f59e0b', '#ef4444', '#ec4899', '#f97316', '#8b5cf6',
  '#14b8a6', '#64748b',
];

/**
 * CategoriesManager — create, edit, delete custom categories
 */
export default function CategoriesManager({ categories, loading, onFetch, onAdd, onUpdate, onDelete }) {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#7c3aed');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    onFetch();
  }, [onFetch]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setAdding(true);
    try {
      await onAdd(newName.trim(), newColor);
      toast.success(`Category "${newName.trim()}" created`);
      setNewName('');
      setNewColor('#7c3aed');
    } catch (err) {
      toast.error(err.message || 'Failed to create category');
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color);
  };

  const handleUpdate = async () => {
    if (!editName.trim()) return;
    try {
      await onUpdate(editingId, { name: editName.trim(), color: editColor });
      toast.success('Category updated');
      setEditingId(null);
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    }
  };

  const handleDelete = async (id) => {
    try {
      await onDelete(id);
      toast.success('Category deleted');
      setDeletingId(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Categories
        </h2>
        <p className="text-[var(--color-text-secondary)] text-sm mt-1">
          Create custom categories to organize your activities
        </p>
      </div>

      {/* Add new category */}
      <div className="glass-card p-5" id="add-category-card">
        <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-3">
          New Category
        </h3>
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Category name..."
              className="input-field"
              id="new-category-name"
              maxLength={30}
              required
            />
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-xs text-[var(--color-text-muted)] mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewColor(color)}
                  className="color-swatch"
                  style={{
                    background: color,
                    boxShadow: newColor === color
                      ? `0 0 0 2px var(--color-bg-primary), 0 0 0 4px ${color}`
                      : 'none',
                  }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={adding || !newName.trim()}
            className="btn-primary w-full"
            id="add-category-btn"
          >
            {adding ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add Category
              </>
            )}
          </button>
        </form>
      </div>

      {/* Category list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-16" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <svg className="mx-auto mb-3 opacity-30" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
          <p className="text-[var(--color-text-muted)]">
            No categories yet. Create one above!
          </p>
        </div>
      ) : (
        <div className="space-y-2" id="categories-list">
          {categories.map((cat, index) => (
            <div
              key={cat.id}
              className="glass-card p-4 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              {editingId === cat.id ? (
                /* Edit mode */
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="input-field"
                    maxLength={30}
                    autoFocus
                  />
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setEditColor(color)}
                        className="color-swatch"
                        style={{
                          background: color,
                          boxShadow: editColor === color
                            ? `0 0 0 2px var(--color-bg-primary), 0 0 0 4px ${color}`
                            : 'none',
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingId(null)} className="btn-secondary flex-1">
                      Cancel
                    </button>
                    <button onClick={handleUpdate} className="btn-primary flex-1">
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                /* View mode */
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ background: cat.color }}
                    />
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">
                      {cat.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(cat)}
                      className="btn-icon"
                      title="Edit"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    {deletingId === cat.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(cat.id)}
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
                        onClick={() => setDeletingId(cat.id)}
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
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
