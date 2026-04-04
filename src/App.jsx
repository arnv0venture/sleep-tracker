import { useState, useEffect, useCallback, createContext, useContext, useMemo } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import SleepForm from './components/SleepForm';
import Dashboard from './components/Dashboard';
import History from './components/History';

// ============================================================
// Auth Context — shared across all components via context
// ============================================================
const AuthContext = createContext(null);

export function useAppAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  }, []);

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const value = useMemo(() => ({
    session, user, loading, signUp, signIn, signOut,
  }), [session, user, loading, signUp, signIn, signOut]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================
// Sleep Logs Context — shared across all components via context
// ============================================================
const SleepLogsContext = createContext(null);

export function useAppSleepLogs() {
  return useContext(SleepLogsContext);
}

function SleepLogsProvider({ children }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async (days = 30) => {
    setLoading(true);
    try {
      let query = supabase
        .from('sleep_logs')
        .select('*')
        .order('sleep_time', { ascending: false });

      if (days > 0) {
        const since = new Date();
        since.setDate(since.getDate() - days);
        query = query.gte('sleep_time', since.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addLog = useCallback(async (sleepTime, wakeTime, notes = '') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('sleep_logs')
      .insert({
        user_id: user.id,
        sleep_time: sleepTime,
        wake_time: wakeTime,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) throw error;
    setLogs((prev) => [data, ...prev]);
    return data;
  }, []);

  const updateLog = useCallback(async (id, updates) => {
    const { data, error } = await supabase
      .from('sleep_logs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    setLogs((prev) => prev.map((log) => (log.id === id ? data : log)));
    return data;
  }, []);

  const deleteLog = useCallback(async (id) => {
    const { error } = await supabase
      .from('sleep_logs')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setLogs((prev) => prev.filter((log) => log.id !== id));
  }, []);

  const value = useMemo(() => ({
    logs, loading, fetchLogs, addLog, updateLog, deleteLog,
  }), [logs, loading, fetchLogs, addLog, updateLog, deleteLog]);

  return (
    <SleepLogsContext.Provider value={value}>
      {children}
    </SleepLogsContext.Provider>
  );
}

// ============================================================
// Route wrapper components — consume context inside router
// ============================================================

function LoginPage() {
  const { session, signIn, signUp } = useAppAuth();

  const handleAuth = async (email, password, isLogin) => {
    if (isLogin) {
      await signIn(email, password);
    } else {
      await signUp(email, password);
    }
  };

  if (session) return <Navigate to="/" replace />;
  return <Auth onAuth={handleAuth} />;
}

function AppLayout() {
  const { session, user, loading, signOut } = useAppAuth();

  return (
    <ProtectedRoute session={session} loading={loading}>
      <Layout user={user} onSignOut={signOut} />
    </ProtectedRoute>
  );
}

function LogPage() {
  const { addLog } = useAppSleepLogs();
  return <SleepForm onAdd={addLog} />;
}

function DashboardPage() {
  const { logs, loading, fetchLogs } = useAppSleepLogs();
  return <Dashboard logs={logs} loading={loading} onFetchLogs={fetchLogs} />;
}

function HistoryPage() {
  const { logs, loading, fetchLogs, updateLog, deleteLog } = useAppSleepLogs();
  return (
    <History
      logs={logs}
      loading={loading}
      onFetchLogs={fetchLogs}
      onUpdate={updateLog}
      onDelete={deleteLog}
    />
  );
}

// ============================================================
// Router — created once at module level
// ============================================================

const router = createBrowserRouter(
  [
    {
      path: '/login',
      element: <LoginPage />,
    },
    {
      path: '/',
      element: <AppLayout />,
      children: [
        { index: true, element: <LogPage /> },
        { path: 'dashboard', element: <DashboardPage /> },
        { path: 'history', element: <HistoryPage /> },
      ],
    },
    {
      path: '*',
      element: <Navigate to="/" replace />,
    },
  ],
  {
    basename: '/sleep-tracker',
  }
);

// ============================================================
// App — root component
// ============================================================

export default function App() {
  return (
    <AuthProvider>
      <SleepLogsProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1a1a2e',
              color: '#f1f5f9',
              border: '1px solid rgba(124, 58, 237, 0.2)',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
              backdropFilter: 'blur(12px)',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#1a1a2e' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#1a1a2e' },
            },
          }}
        />
        <RouterProvider router={router} />
      </SleepLogsProvider>
    </AuthProvider>
  );
}
