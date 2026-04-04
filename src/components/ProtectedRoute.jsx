import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute — wraps routes that require authentication
 * Shows a loading spinner during auth check, redirects to /login if not authenticated
 */
export default function ProtectedRoute({ session, loading, children }) {
  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--color-text-muted)] text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
