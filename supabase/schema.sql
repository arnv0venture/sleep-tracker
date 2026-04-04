-- ============================================================
-- Sleep Tracker — Supabase Database Schema
-- ============================================================
-- Run this SQL in your Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Create the sleep_logs table
CREATE TABLE sleep_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sleep_time TIMESTAMPTZ NOT NULL,
  wake_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (wake_time - sleep_time))::integer / 60
  ) STORED,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies — users can only access their own data

-- Allow users to view their own sleep logs
CREATE POLICY "Users can view own logs"
  ON sleep_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to insert their own sleep logs
CREATE POLICY "Users can insert own logs"
  ON sleep_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own sleep logs
CREATE POLICY "Users can update own logs"
  ON sleep_logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own sleep logs
CREATE POLICY "Users can delete own logs"
  ON sleep_logs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. Performance indexes
CREATE INDEX idx_sleep_logs_user_id ON sleep_logs(user_id);
CREATE INDEX idx_sleep_logs_sleep_time ON sleep_logs(sleep_time DESC);
