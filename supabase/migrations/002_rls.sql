-- ─── Enable RLS on all tables ────────────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_set_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_nutrition_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_log_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_metrics ENABLE ROW LEVEL SECURITY;

-- ─── Helper: check if current user is admin ───────────────────────────────────
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ─── USERS ────────────────────────────────────────────────────────────────────
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (id = auth.uid() OR is_admin());

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "users_insert_self" ON users
  FOR INSERT WITH CHECK (id = auth.uid());

-- ─── PROGRAMS (public for published, admin for all) ───────────────────────────
CREATE POLICY "programs_select" ON programs
  FOR SELECT USING (is_published = TRUE OR is_admin());

CREATE POLICY "programs_insert_admin" ON programs
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "programs_update_admin" ON programs
  FOR UPDATE USING (is_admin());

CREATE POLICY "programs_delete_admin" ON programs
  FOR DELETE USING (is_admin());

-- ─── PROGRAM WEEKS ────────────────────────────────────────────────────────────
CREATE POLICY "program_weeks_select" ON program_weeks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM programs p WHERE p.id = program_id AND (p.is_published OR is_admin()))
  );

CREATE POLICY "program_weeks_write_admin" ON program_weeks
  FOR ALL USING (is_admin());

-- ─── PROGRAM SESSIONS ─────────────────────────────────────────────────────────
CREATE POLICY "program_sessions_select" ON program_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM program_weeks pw
      JOIN programs p ON p.id = pw.program_id
      WHERE pw.id = program_week_id AND (p.is_published OR is_admin())
    )
  );

CREATE POLICY "program_sessions_write_admin" ON program_sessions
  FOR ALL USING (is_admin());

-- ─── EXERCISES (all authenticated users can read) ──────────────────────────────
CREATE POLICY "exercises_select" ON exercises
  FOR SELECT USING (auth.uid() IS NOT NULL AND NOT is_archived);

CREATE POLICY "exercises_write_admin" ON exercises
  FOR ALL USING (is_admin());

-- ─── SESSION EXERCISES ────────────────────────────────────────────────────────
CREATE POLICY "session_exercises_select" ON session_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM program_sessions ps
      JOIN program_weeks pw ON pw.id = ps.program_week_id
      JOIN programs p ON p.id = pw.program_id
      WHERE ps.id = session_id AND (p.is_published OR is_admin())
    )
  );

CREATE POLICY "session_exercises_write_admin" ON session_exercises
  FOR ALL USING (is_admin());

-- ─── USER PROGRAMS ────────────────────────────────────────────────────────────
CREATE POLICY "user_programs_select" ON user_programs
  FOR SELECT USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "user_programs_insert" ON user_programs
  FOR INSERT WITH CHECK (user_id = auth.uid() OR is_admin());

-- ─── USER SESSIONS ────────────────────────────────────────────────────────────
CREATE POLICY "user_sessions_select" ON user_sessions
  FOR SELECT USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "user_sessions_insert" ON user_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE POLICY "user_sessions_update" ON user_sessions
  FOR UPDATE USING (user_id = auth.uid() OR is_admin());

-- ─── USER EXERCISE LOGS ───────────────────────────────────────────────────────
CREATE POLICY "user_exercise_logs_select" ON user_exercise_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_sessions us WHERE us.id = user_session_id AND (us.user_id = auth.uid() OR is_admin()))
  );

CREATE POLICY "user_exercise_logs_insert" ON user_exercise_logs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_sessions us WHERE us.id = user_session_id AND us.user_id = auth.uid())
  );

CREATE POLICY "user_exercise_logs_update" ON user_exercise_logs
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_sessions us WHERE us.id = user_session_id AND (us.user_id = auth.uid() OR is_admin()))
  );

-- ─── USER SET LOGS ────────────────────────────────────────────────────────────
CREATE POLICY "user_set_logs_select" ON user_set_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_exercise_logs uel
      JOIN user_sessions us ON us.id = uel.user_session_id
      WHERE uel.id = user_exercise_log_id AND (us.user_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "user_set_logs_write" ON user_set_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_exercise_logs uel
      JOIN user_sessions us ON us.id = uel.user_session_id
      WHERE uel.id = user_exercise_log_id AND us.user_id = auth.uid()
    )
  );

-- ─── CHAT ROOMS ───────────────────────────────────────────────────────────────
CREATE POLICY "chat_rooms_select" ON chat_rooms
  FOR SELECT USING (
    is_admin() OR
    EXISTS (SELECT 1 FROM chat_room_members WHERE chat_room_id = id AND user_id = auth.uid())
  );

CREATE POLICY "chat_rooms_insert_admin" ON chat_rooms
  FOR INSERT WITH CHECK (is_admin());

-- ─── CHAT ROOM MEMBERS ────────────────────────────────────────────────────────
CREATE POLICY "chat_room_members_select" ON chat_room_members
  FOR SELECT USING (
    is_admin() OR
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM chat_room_members m2 WHERE m2.chat_room_id = chat_room_id AND m2.user_id = auth.uid())
  );

CREATE POLICY "chat_room_members_insert_admin" ON chat_room_members
  FOR INSERT WITH CHECK (is_admin() OR user_id = auth.uid());

-- ─── CHAT MESSAGES ────────────────────────────────────────────────────────────
CREATE POLICY "chat_messages_select" ON chat_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM chat_room_members WHERE chat_room_id = chat_messages.chat_room_id AND user_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY "chat_messages_insert" ON chat_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND (
      EXISTS (SELECT 1 FROM chat_room_members WHERE chat_room_id = chat_messages.chat_room_id AND user_id = auth.uid())
      OR is_admin()
    )
  );

-- ─── NUTRITION GOALS ──────────────────────────────────────────────────────────
CREATE POLICY "nutrition_goals_select" ON user_nutrition_goals
  FOR SELECT USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "nutrition_goals_insert" ON user_nutrition_goals
  FOR INSERT WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE POLICY "nutrition_goals_update" ON user_nutrition_goals
  FOR UPDATE USING (user_id = auth.uid() OR is_admin());

-- ─── FOOD LOG ENTRIES ─────────────────────────────────────────────────────────
CREATE POLICY "food_log_select" ON food_log_entries
  FOR SELECT USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "food_log_insert" ON food_log_entries
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "food_log_delete" ON food_log_entries
  FOR DELETE USING (user_id = auth.uid());

-- ─── USER METRICS ─────────────────────────────────────────────────────────────
CREATE POLICY "user_metrics_select" ON user_metrics
  FOR SELECT USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "user_metrics_write" ON user_metrics
  FOR ALL USING (user_id = auth.uid());
