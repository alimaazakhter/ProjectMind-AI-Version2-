-- ==============================================================================
-- ProjectMind AI — PostgreSQL / Supabase Initial Schema Migration (001)
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Synchronized with Clerk User Identity)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  university TEXT,
  semester TEXT,
  academic_level TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on clerk_user_id for ultra-fast lookup
CREATE INDEX IF NOT EXISTS idx_profiles_clerk_id ON profiles(clerk_user_id);

-- 2. Blueprints Table (Complete Generated Technical Specifications)
CREATE TABLE IF NOT EXISTS blueprints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL, -- Authenticated Clerk User ID
  title TEXT NOT NULL,
  tagline TEXT,
  domain TEXT NOT NULL,
  complexity TEXT NOT NULL,
  agent_mode TEXT NOT NULL DEFAULT 'multi' CHECK (agent_mode IN ('single', 'multi')),
  problem_statement TEXT NOT NULL,
  objectives JSONB NOT NULL DEFAULT '[]'::jsonb,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  architecture JSONB NOT NULL DEFAULT '{}'::jsonb,
  tech_stack JSONB NOT NULL DEFAULT '[]'::jsonb,
  datasets JSONB NOT NULL DEFAULT '[]'::jsonb,
  research_references JSONB NOT NULL DEFAULT '[]'::jsonb,
  roadmap JSONB NOT NULL DEFAULT '[]'::jsonb,
  viva_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  starter_code JSONB NOT NULL DEFAULT '[]'::jsonb,
  uniquifier_suggestions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on user_id to enforce fast user data ownership queries
CREATE INDEX IF NOT EXISTS idx_blueprints_user_id ON blueprints(user_id);
CREATE INDEX IF NOT EXISTS idx_blueprints_domain ON blueprints(domain);

-- 3. Chat Logs Table (AI Assistant Conversations & Intent Telemetry)
CREATE TABLE IF NOT EXISTS chat_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  project_id UUID REFERENCES blueprints(id) ON DELETE SET NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  intent TEXT,
  confidence NUMERIC(4, 3),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_logs_user_id ON chat_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_logs_project_id ON chat_logs(project_id);

-- 4. Exports Table (Download History for PDF, DOCX, PPT, MD)
CREATE TABLE IF NOT EXISTS exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  blueprint_id UUID REFERENCES blueprints(id) ON DELETE CASCADE,
  format TEXT NOT NULL CHECK (format IN ('pdf', 'docx', 'ppt', 'md')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exports_user_id ON exports(user_id);
CREATE INDEX IF NOT EXISTS idx_exports_blueprint_id ON exports(blueprint_id);

-- Trigger function to automatically update `updated_at` column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS set_blueprints_updated_at ON blueprints;
CREATE TRIGGER set_blueprints_updated_at
BEFORE UPDATE ON blueprints
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
