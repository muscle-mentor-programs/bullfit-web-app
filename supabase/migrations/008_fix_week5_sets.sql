-- ─── Fix Week 5 set counts for Well-rounded Hypertrophy 6x per week ──────────
-- Run this if you already applied 007 and Week 5 still shows the base set counts.
-- Updates Week 5 session_exercises: 3-set exercises → 4 sets, 4-set → 5 sets.
-- Also corrects the Week 5 title and description.

DO $$
DECLARE
  v_program_id UUID;
  v_week_id    UUID;
BEGIN
  -- Find the program
  SELECT id INTO v_program_id
  FROM programs
  WHERE title = 'Well-rounded Hypertrophy 6x per week'
  LIMIT 1;

  IF v_program_id IS NULL THEN
    RAISE NOTICE 'Program not found — nothing to fix.';
    RETURN;
  END IF;

  -- Find Week 5
  SELECT id INTO v_week_id
  FROM program_weeks
  WHERE program_id = v_program_id AND week_number = 5
  LIMIT 1;

  IF v_week_id IS NULL THEN
    RAISE NOTICE 'Week 5 not found — nothing to fix.';
    RETURN;
  END IF;

  -- Update Week 5 title + description
  UPDATE program_weeks
  SET
    title       = 'Week 5 — Peak Volume (4–5 sets)',
    description = 'Peak volume week. Every exercise gets +1 set (4–5 sets total) — the highest stimulus in the entire program. Keep form sharp and aim for 1–2 reps in reserve.'
  WHERE id = v_week_id;

  -- Update all session_exercises in Week 5 sessions:
  --   3-set exercises → 4 sets
  --   4-set exercises → 5 sets
  UPDATE session_exercises se
  SET prescribed_sets = CASE
    WHEN se.prescribed_sets = 4 THEN 5
    WHEN se.prescribed_sets = 3 THEN 4
    ELSE se.prescribed_sets
  END
  WHERE se.session_id IN (
    SELECT id FROM program_sessions WHERE program_week_id = v_week_id
  );

  RAISE NOTICE 'Week 5 set counts updated for program ID: %', v_program_id;
END $$;
