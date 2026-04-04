/**
 * CategoryPill — small colored badge displaying a category name
 * Used in ActivityList and Analytics
 */
export default function CategoryPill({ category, size = 'sm' }) {
  if (!category) {
    return (
      <span
        className="category-pill"
        style={{
          '--pill-color': 'var(--color-text-muted)',
          fontSize: size === 'sm' ? '0.6875rem' : '0.75rem',
        }}
      >
        Uncategorized
      </span>
    );
  }

  return (
    <span
      className="category-pill"
      style={{
        '--pill-color': category.color || 'var(--color-accent)',
        fontSize: size === 'sm' ? '0.6875rem' : '0.75rem',
      }}
    >
      <span
        className="category-pill-dot"
        style={{ background: category.color || 'var(--color-accent)' }}
      />
      {category.name}
    </span>
  );
}
