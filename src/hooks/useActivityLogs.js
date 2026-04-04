import { useState, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useActivityLogs — CRUD hook for daily activity entries
 * Activities have start_time / end_time just like sleep logs
 */
export function useActivityLogs() {
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

  return value;
}
