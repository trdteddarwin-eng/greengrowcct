-- ============================================================
-- GreenGrow CCT — Supabase Migration
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Call sessions table
CREATE TABLE call_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario_id TEXT NOT NULL,
  scenario_name TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ NOT NULL,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  transcript JSONB NOT NULL DEFAULT '[]',
  scorecard JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_call_sessions_user ON call_sessions(user_id, created_at DESC);

ALTER TABLE call_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their call sessions"
  ON call_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. Playbooks table
CREATE TABLE playbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE playbooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their playbook"
  ON playbooks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Alter custom_scenarios to add user_id
ALTER TABLE custom_scenarios
  ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX idx_custom_scenarios_user ON custom_scenarios(user_id, created_at DESC);

ALTER TABLE custom_scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their scenarios"
  ON custom_scenarios FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
