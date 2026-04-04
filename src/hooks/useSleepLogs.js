import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useSleepLogs — CRUD operations for sleep log entries
 * All operations are scoped to the authenticated user via Supabase RLS
 */
export function useSleepLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch sleep logs for a given number of past days
   * @param {number} days — number of days to look back (0 = all time)
   */
  const fetchLogs = useCallback(async (days = 30) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('sleep_logs')
        .select('*')
        .order('sleep_time', { ascending: false });

      // Apply date filter if not fetching all
      if (days > 0) {
        const since = new Date();
        since.setDate(since.getDate() - days);
        query = query.gte('sleep_time', since.toISOString());
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setLogs(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Add a new sleep log entry
   * @param {string} sleepTime — ISO datetime string
   * @param {string} wakeTime — ISO datetime string
   * @param {string} notes — optional notes
   */
  const addLog = useCallback(async (sleepTime, wakeTime, notes = '') => {
    setError(null);

    // Get current user ID for the insert
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error: insertError } = await supabase
      .from('sleep_logs')
      .insert({
        user_id: user.id,
        sleep_time: sleepTime,
        wake_time: wakeTime,
        notes: notes || null,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Prepend new log to state (most recent first)
    setLogs((prev) => [data, ...prev]);
    return data;
  }, []);

  /**
   * Update an existing sleep log
   * @param {string} id — log UUID
   * @param {object} updates — fields to update
   */
  const updateLog = useCallback(async (id, updates) => {
    setError(null);

    const { data, error: updateError } = await supabase
      .from('sleep_logs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Update in local state
    setLogs((prev) =>
      prev.map((log) => (log.id === id ? data : log))
    );
    return data;
  }, []);

  /**
   * Delete a sleep log
   * @param {string} id — log UUID
   */
  const deleteLog = useCallback(async (id) => {
    setError(null);

    const { error: deleteError } = await supabase
      .from('sleep_logs')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // Remove from local state
    setLogs((prev) => prev.filter((log) => log.id !== id));
  }, []);

  return { logs, loading, error, fetchLogs, addLog, updateLog, deleteLog };
}
