import { useState, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useCategories — CRUD hook for user-defined categories
 */
export function useCategories() {
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

  return value;
}
