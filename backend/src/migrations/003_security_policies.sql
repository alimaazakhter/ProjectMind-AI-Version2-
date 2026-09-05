-- Enforce ownership at the database boundary for direct Supabase clients.
-- The Express service-role client still performs explicit authorization checks.
BEGIN;

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tech_stack ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY projects_owner_select ON projects FOR SELECT
  USING (user_id = auth.jwt() ->> 'sub');
CREATE POLICY projects_owner_insert ON projects FOR INSERT
  WITH CHECK (user_id = auth.jwt() ->> 'sub');
CREATE POLICY projects_owner_update ON projects FOR UPDATE
  USING (user_id = auth.jwt() ->> 'sub')
  WITH CHECK (user_id = auth.jwt() ->> 'sub');
CREATE POLICY projects_owner_delete ON projects FOR DELETE
  USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY project_children_owner_access ON project_requirements FOR ALL
  USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND p.user_id = auth.jwt() ->> 'sub'))
  WITH CHECK (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND p.user_id = auth.jwt() ->> 'sub'));
CREATE POLICY blueprint_owner_access ON blueprints FOR ALL
  USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND p.user_id = auth.jwt() ->> 'sub'))
  WITH CHECK (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND p.user_id = auth.jwt() ->> 'sub'));
CREATE POLICY tech_stack_owner_access ON project_tech_stack FOR ALL
  USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND p.user_id = auth.jwt() ->> 'sub'))
  WITH CHECK (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND p.user_id = auth.jwt() ->> 'sub'));
CREATE POLICY roadmap_owner_access ON project_roadmaps FOR ALL
  USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND p.user_id = auth.jwt() ->> 'sub'))
  WITH CHECK (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND p.user_id = auth.jwt() ->> 'sub'));
CREATE POLICY references_owner_access ON project_references FOR ALL
  USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND p.user_id = auth.jwt() ->> 'sub'))
  WITH CHECK (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND p.user_id = auth.jwt() ->> 'sub'));
CREATE POLICY history_owner_access ON project_history FOR ALL
  USING (user_id = auth.jwt() ->> 'sub')
  WITH CHECK (user_id = auth.jwt() ->> 'sub');
CREATE POLICY sessions_owner_access ON chat_sessions FOR ALL
  USING (user_id = auth.jwt() ->> 'sub')
  WITH CHECK (user_id = auth.jwt() ->> 'sub');
CREATE POLICY messages_owner_access ON chat_messages FOR ALL
  USING (EXISTS (SELECT 1 FROM chat_sessions s WHERE s.id = session_id AND s.user_id = auth.jwt() ->> 'sub'))
  WITH CHECK (EXISTS (SELECT 1 FROM chat_sessions s WHERE s.id = session_id AND s.user_id = auth.jwt() ->> 'sub'));
CREATE POLICY exports_owner_access ON exports FOR ALL
  USING (user_id = auth.jwt() ->> 'sub')
  WITH CHECK (user_id = auth.jwt() ->> 'sub');

COMMIT;