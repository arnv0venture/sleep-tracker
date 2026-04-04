import { useState, useEffect, useCallback, createContext, useContext, useMemo } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import SleepForm from './components/SleepForm';
import History from './components/History';
import ActivityForm from './components/ActivityForm';
import ActivityList from './components/ActivityList';
import ActivitiesPage from './components/ActivitiesPage';
import Analytics from './components/Analytics';
import CategoriesManager from './components/CategoriesManager';

// ============================================================
// Auth Context
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
// Sleep Logs Context
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
// Categories Context
// ============================================================
const CategoriesContext = createContext(null);

export function useAppCategories() {
  return useContext(CategoriesContext);
}

function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addCategory = useCallback(async (name, color, icon = 'tag') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('categories')
      .insert({ user_id: user.id, name, color, icon })
      .select()
      .single();

    if (error) throw error;
    setCategories((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
    return data;
  }, []);

  const updateCategory = useCallback(async (id, updates) => {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? data : cat)).sort((a, b) => a.name.localeCompare(b.name))
    );
    return data;
  }, []);

  const deleteCategory = useCallback(async (id) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
  }, []);

  const value = useMemo(() => ({
    categories, loading, fetchCategories, addCategory, updateCategory, deleteCategory,
  }), [categories, loading, fetchCategories, addCategory, updateCategory, deleteCategory]);

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
}

// ============================================================
// Activity Logs Context
// ============================================================
const ActivityLogsContext = createContext(null);

export function useAppActivityLogs() {
  return useContext(ActivityLogsContext);
}

function ActivityLogsProvider({ children }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchActivities = useCallback(async (days = 30) => {
    setLoading(true);
    try {
      let query = supabase
        .from('activity_logs')
        .select('*, categories(id, name, color, icon)')
        .order('start_time', { ascending: false });

      if (days > 0) {
        const since = new Date();
        since.setDate(since.getDate() - days);
        query = query.gte('date', since.toISOString().split('T')[0]);
      }

      const { data, error } = await query;
      if (error) throw error;
      setActivities(data || []);
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addActivity = useCallback(async (title, description, categoryId, startTime, endTime, date) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: user.id,
        title,
        description: description || null,
        category_id: categoryId || null,
        start_time: startTime,
        end_time: endTime,
        date,
      })
      .select('*, categories(id, name, color, icon)')
      .single();

    if (error) throw error;
    setActivities((prev) => [data, ...prev]);
    return data;
  }, []);

  const updateActivity = useCallback(async (id, updates) => {
    const { data, error } = await supabase
      .from('activity_logs')
      .update(updates)
      .eq('id', id)
      .select('*, categories(id, name, color, icon)')
      .single();

    if (error) throw error;
    setActivities((prev) => prev.map((a) => (a.id === id ? data : a)));
    return data;
  }, []);

  const deleteActivity = useCallback(async (id) => {
    const { error } = await supabase
      .from('activity_logs')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setActivities((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const value = useMemo(() => ({
    activities, loading, fetchActivities, addActivity, updateActivity, deleteActivity,
  }), [activities, loading, fetchActivities, addActivity, updateActivity, deleteActivity]);

  return (
    <ActivityLogsContext.Provider value={value}>
      {children}
    </ActivityLogsContext.Provider>
  );
}

// ============================================================
// Route wrapper components
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

function LogSleepPage() {
  const { addLog } = useAppSleepLogs();
  return <SleepForm onAdd={addLog} />;
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

function ActivityPage() {
  const { categories, fetchCategories } = useAppCategories();
  const { activities, loading, fetchActivities, addActivity, updateActivity, deleteActivity } = useAppActivityLogs();
  return (
    <ActivitiesPage
      categories={categories}
      activities={activities}
      activityLoading={loading}
      onFetchCategories={fetchCategories}
      onAddActivity={addActivity}
      onFetchActivities={fetchActivities}
      onUpdateActivity={updateActivity}
      onDeleteActivity={deleteActivity}
    />
  );
}

function AnalyticsPage() {
  const { logs: sleepLogs, loading: sleepLoading, fetchLogs: fetchSleepLogs } = useAppSleepLogs();
  const { activities, loading: activityLoading, fetchActivities } = useAppActivityLogs();
  const { categories } = useAppCategories();

  return (
    <Analytics
      sleepLogs={sleepLogs}
      sleepLoading={sleepLoading}
      onFetchSleepLogs={fetchSleepLogs}
      activities={activities}
      activityLoading={activityLoading}
      onFetchActivities={fetchActivities}
      categories={categories}
    />
  );
}

function CategoriesPage() {
  const { categories, loading, fetchCategories, addCategory, updateCategory, deleteCategory } = useAppCategories();
  return (
    <CategoriesManager
      categories={categories}
      loading={loading}
      onFetch={fetchCategories}
      onAdd={addCategory}
      onUpdate={updateCategory}
      onDelete={deleteCategory}
    />
  );
}

// ============================================================
// Router
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
        { index: true, element: <LogSleepPage /> },
        { path: 'activities', element: <ActivityPage /> },
        { path: 'analytics', element: <AnalyticsPage /> },
        { path: 'history', element: <HistoryPage /> },
        { path: 'categories', element: <CategoriesPage /> },
        // Old dashboard redirects to analytics
        { path: 'dashboard', element: <Navigate to="/analytics" replace /> },
      ],
    },
    {
      path: '*',
      element: <Navigate to="/" replace />,
    },
  ],
  {
    basename: '/',
  }
);

// ============================================================
// App — root component
// ============================================================

export default function App() {
  return (
    <AuthProvider>
      <SleepLogsProvider>
        <CategoriesProvider>
          <ActivityLogsProvider>
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
          </ActivityLogsProvider>
        </CategoriesProvider>
      </SleepLogsProvider>
    </AuthProvider>
  );
}
