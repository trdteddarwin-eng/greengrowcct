-- ============================================================
-- GreenGrow CCT — Migration V2: Profiles, User Events, Triggers
-- Run this AFTER supabase-migration.sql
-- ============================================================

-- 1. Profiles table (extends auth.users with app-specific data)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  total_calls INTEGER NOT NULL DEFAULT 0,
  avg_score NUMERIC(4,1) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (but not role)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 2. User events table (activity tracking)
CREATE TABLE IF NOT EXISTS user_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  page_path TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;

-- Users can insert their own events
CREATE POLICY "Users can insert own events"
  ON user_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own events
CREATE POLICY "Users can read own events"
  ON user_events FOR SELECT
  USING (auth.uid() = user_id);

-- Index for fast queries by user and time
CREATE INDEX IF NOT EXISTS idx_user_events_user_created
  ON user_events(user_id, created_at DESC);

-- Index for event type filtering
CREATE INDEX IF NOT EXISTS idx_user_events_type
  ON user_events(event_type, created_at DESC);

-- 3. Trigger: auto-create profile on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role, created_at)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data ->> 'display_name',
      SPLIT_PART(NEW.email, '@', 1)
    ),
    'user',
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Trigger: recompute total_calls and avg_score when a call_session is inserted
CREATE OR REPLACE FUNCTION public.handle_call_session_saved()
RETURNS TRIGGER AS $$
DECLARE
  v_total INTEGER;
  v_avg NUMERIC(4,1);
BEGIN
  SELECT
    COUNT(*),
    COALESCE(ROUND(AVG((scorecard->>'overallScore')::NUMERIC), 1), 0)
  INTO v_total, v_avg
  FROM call_sessions
  WHERE user_id = NEW.user_id
    AND scorecard IS NOT NULL
    AND scorecard->>'overallScore' IS NOT NULL;

  UPDATE profiles
  SET total_calls = v_total, avg_score = v_avg
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_call_session_saved ON call_sessions;
CREATE TRIGGER on_call_session_saved
  AFTER INSERT ON call_sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_call_session_saved();

-- 5. Trigger: update last_active_at on new user_event
CREATE OR REPLACE FUNCTION public.handle_user_event_created()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET last_active_at = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_event_created ON user_events;
CREATE TRIGGER on_user_event_created
  AFTER INSERT ON user_events
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_event_created();
