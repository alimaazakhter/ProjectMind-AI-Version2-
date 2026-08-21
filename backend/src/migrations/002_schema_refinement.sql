-- ==============================================================================
-- ProjectMind AI — PostgreSQL / Supabase Schema Refinement Migration (002)
-- Aligned with ProjectMind AI UML Class Diagram
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. PROFILES TABLE (User, Student, Admin)
-- ==============================================================================
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

CREATE INDEX IF NOT EXISTS idx_profiles_clerk_id ON profiles(clerk_user_id);

-- ==============================================================================
-- 2. PROJECTS TABLE (Main Workspace Entity)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL, -- References clerk_user_id
  title TEXT NOT NULL,
  domain TEXT NOT NULL,
  complexity TEXT NOT NULL DEFAULT 'Production Grade Architecture',
  agent_mode TEXT NOT NULL DEFAULT 'multi' CHECK (agent_mode IN ('single', 'multi')),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('draft', 'generating', 'completed', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_domain ON projects(domain);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- ==============================================================================
-- 3. PROJECT REQUIREMENTS TABLE (Input Criteria & Preferences)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS project_requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  raw_input TEXT,
  skill_level TEXT NOT NULL DEFAULT 'intermediate',
  preferred_tech JSONB NOT NULL DEFAULT '[]'::jsonb,
  complexity_level TEXT NOT NULL,
  agent_mode TEXT NOT NULL DEFAULT 'multi',
  custom_requirements TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_requirements_project_id ON project_requirements(project_id);

-- ==============================================================================
-- 4. BLUEPRINTS TABLE (Generated Technical Specifications)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS blueprints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  tagline TEXT,
  problem_statement TEXT NOT NULL,
  objectives JSONB NOT NULL DEFAULT '[]'::jsonb,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  architecture JSONB NOT NULL DEFAULT '{}'::jsonb,
  viva_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  starter_code JSONB NOT NULL DEFAULT '[]'::jsonb,
  uniquifier_suggestions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blueprints_project_id ON blueprints(project_id);

-- ==============================================================================
-- 5. PROJECT TECH STACK TABLE (Relational Technology Stack Items)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS project_tech_stack (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  technology_name TEXT NOT NULL,
  justification TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_tech_stack_project_id ON project_tech_stack(project_id);

-- ==============================================================================
-- 6. PROJECT ROADMAPS TABLE (Phased Milestone Schedules)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS project_roadmaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase_number INT NOT NULL,
  phase_title TEXT NOT NULL,
  duration TEXT NOT NULL,
  tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_roadmaps_project_id ON project_roadmaps(project_id);

-- ==============================================================================
-- 7. PROJECT REFERENCES TABLE (Curated Research Papers & Datasets)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS project_references (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('research_paper', 'dataset', 'documentation')),
  title TEXT NOT NULL,
  source_url TEXT,
  authors TEXT,
  year TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_references_project_id ON project_references(project_id);

-- ==============================================================================
-- 8. PROJECT HISTORY TABLE (Lifecycle Audit & Version History)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS project_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL, -- e.g. 'PROJECT_CREATED', 'BLUEPRINT_GENERATED', 'EXPORT_GENERATED'
  version_tag TEXT NOT NULL DEFAULT 'v1.0',
  changes_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_history_project_id ON project_history(project_id);
CREATE INDEX IF NOT EXISTS idx_project_history_user_id ON project_history(user_id);

-- ==============================================================================
-- 9. CHAT SESSIONS TABLE (AI Assistant Threads)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Project Consultation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_project_id ON chat_sessions(project_id);

-- ==============================================================================
-- 10. CHAT MESSAGES TABLE (Dialogue & Intent Telemetry)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  intent TEXT,
  confidence NUMERIC(4, 3),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);

-- ==============================================================================
-- 11. EXPORTS TABLE (Document Generation Tracking)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('pdf', 'docx', 'ppt', 'md')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exports_project_id ON exports(project_id);
CREATE INDEX IF NOT EXISTS idx_exports_user_id ON exports(user_id);

-- ==============================================================================
-- TRIGGERS: Automatic `updated_at` timestamps
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

DROP TRIGGER IF EXISTS trg_projects_updated_at ON projects;
CREATE TRIGGER trg_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

DROP TRIGGER IF EXISTS trg_blueprints_updated_at ON blueprints;
CREATE TRIGGER trg_blueprints_updated_at
BEFORE UPDATE ON blueprints
FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

DROP TRIGGER IF EXISTS trg_chat_sessions_updated_at ON chat_sessions;
CREATE TRIGGER trg_chat_sessions_updated_at
BEFORE UPDATE ON chat_sessions
FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
