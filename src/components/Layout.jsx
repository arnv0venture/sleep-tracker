import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

/**
 * Layout — app shell with bottom navigation and header
 * Mobile-first design with safe area support
 */
export default function Layout({ user, onSignOut }) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await onSignOut();
      navigate('/login');
      toast.success('Signed out');
    } catch {
      toast.error('Failed to sign out');
    }
  };

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[var(--color-bg-primary)]/80 border-b border-[var(--color-border)]">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-indigo-600 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </div>
            <h1 className="text-base font-semibold text-[var(--color-text-primary)]">
              Sleep Tracker
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--color-text-muted)] hidden sm:block">
              {user?.email}
            </span>
            <button
              onClick={handleSignOut}
              className="btn-icon"
              title="Sign out"
              id="sign-out-btn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 pb-24">
        <Outlet />
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl bg-[var(--color-bg-primary)]/90 border-t border-[var(--color-border)] safe-bottom">
        <div className="max-w-2xl mx-auto flex justify-around py-2 px-4">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            id="nav-log"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>Log</span>
          </NavLink>

          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            id="nav-dashboard"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 20V10M12 20V4M6 20v-6" />
            </svg>
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/history"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            id="nav-history"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>History</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
