import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

/**
 * Layout — app shell with bottom navigation and header
 * Prym - ARNV branded, 5-tab navigation
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
    <div className="relative z-10 min-h-dvh flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[rgba(7,9,16,0.58)] backdrop-blur-2xl">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-indigo-500 flex items-center justify-center shadow-lg shadow-[var(--color-accent-glow)]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold text-[var(--color-text-primary)] leading-none">
                Prym
              </h1>
              <span className="text-[0.625rem] font-medium text-[var(--color-accent-light)] uppercase tracking-widest">
                ARNV
              </span>
            </div>
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

      {/* Bottom navigation — 5 tabs */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[rgba(7,9,16,0.72)] backdrop-blur-2xl safe-bottom">
        <div className="max-w-2xl mx-auto flex justify-around py-2 px-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            id="nav-sleep"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
            <span>Sleep</span>
          </NavLink>

          <NavLink
            to="/activities"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            id="nav-activities"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <span>Activities</span>
          </NavLink>

          <NavLink
            to="/analytics"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            id="nav-analytics"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 20V10M12 20V4M6 20v-6" />
            </svg>
            <span>Analytics</span>
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

          <NavLink
            to="/categories"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            id="nav-categories"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            <span>Tags</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
