-- ─── Well-rounded Hypertrophy 6x per week ─────────────────────────────────────
-- 6-day Push / Legs / Pull split (PPL × 2)
-- Week 1: 2 sets per exercise (introduction / deload)
-- Weeks 2–6: Full prescribed sets as per program
-- Week 5: Peak volume — every exercise gets +1 set (3→4, 4→5)
-- Day mapping: 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat

DO $$
DECLARE
  v_program_id   UUID;
  v_week_id      UUID;
  v_session_id   UUID;
  v_week_num     INT;

  -- ── Push 1 exercise IDs ────────────────────────────────────────
  v_bench_press        UUID;
  v_incline_db_press   UUID;
  v_cable_flye         UUID;
  v_ohp                UUID;
  v_lateral_raise      UUID;
  v_tricep_pushdown    UUID;

  -- ── Legs 1 exercise IDs ────────────────────────────────────────
  v_back_squat          UUID;
  v_leg_press           UUID;
  v_leg_extension       UUID;
  v_rdl                 UUID;
  v_lying_leg_curl      UUID;
  v_standing_calf_raise UUID;

  -- ── Pull 1 exercise IDs ────────────────────────────────────────
  v_pullup              UUID;
  v_barbell_row         UUID;
  v_seated_cable_row    UUID;
  v_face_pull           UUID;
  v_barbell_curl        UUID;
  v_hammer_curl         UUID;

  -- ── Push 2 exercise IDs ────────────────────────────────────────
  v_incline_bb_press    UUID;
  v_lo_hi_cable_fly     UUID;
  v_rear_delt_flye      UUID;
  v_skull_crusher       UUID;

  -- ── Legs 2 exercise IDs ────────────────────────────────────────
  v_hip_thrust          UUID;
  v_bulgarian           UUID;
  v_seated_leg_curl     UUID;
  v_seated_calf_raise   UUID;

  -- ── Pull 2 exercise IDs ────────────────────────────────────────
  v_lat_pulldown        UUID;
  v_single_arm_row      UUID;
  v_neutral_pulldown    UUID;
  v_straight_arm_pd     UUID;
  v_incline_db_curl     UUID;
  v_cable_curl          UUID;

BEGIN

  -- ── 1. Resolve exercise IDs from the library ──────────────────────────────

  -- Push 1
  SELECT id INTO v_bench_press        FROM exercises WHERE name = 'Barbell Bench Press'           AND is_archived = false LIMIT 1;
  SELECT id INTO v_incline_db_press   FROM exercises WHERE name = 'Incline Dumbbell Press'         AND is_archived = false LIMIT 1;
  SELECT id INTO v_cable_flye         FROM exercises WHERE name = 'Cable Flye'                     AND is_archived = false LIMIT 1;
  SELECT id INTO v_ohp                FROM exercises WHERE name = 'Overhead Press'                 AND is_archived = false LIMIT 1;
  SELECT id INTO v_lateral_raise      FROM exercises WHERE name = 'Lateral Raise'                  AND is_archived = false LIMIT 1;
  SELECT id INTO v_tricep_pushdown    FROM exercises WHERE name = 'Tricep Pushdown'                AND is_archived = false LIMIT 1;

  -- Legs 1
  SELECT id INTO v_back_squat          FROM exercises WHERE name = 'Barbell Back Squat'            AND is_archived = false LIMIT 1;
  SELECT id INTO v_leg_press           FROM exercises WHERE name = 'Leg Press'                     AND is_archived = false LIMIT 1;
  SELECT id INTO v_leg_extension       FROM exercises WHERE name = 'Leg Extension'                 AND is_archived = false LIMIT 1;
  SELECT id INTO v_rdl                 FROM exercises WHERE name = 'Romanian Deadlift'             AND is_archived = false LIMIT 1;
  SELECT id INTO v_lying_leg_curl      FROM exercises WHERE name = 'Leg Curl (Lying)'              AND is_archived = false LIMIT 1;
  SELECT id INTO v_standing_calf_raise FROM exercises WHERE name = 'Standing Calf Raise'           AND is_archived = false LIMIT 1;

  -- Pull 1
  SELECT id INTO v_pullup              FROM exercises WHERE name = 'Pull-Up'                       AND is_archived = false LIMIT 1;
  SELECT id INTO v_barbell_row         FROM exercises WHERE name = 'Barbell Row'                   AND is_archived = false LIMIT 1;
  SELECT id INTO v_seated_cable_row    FROM exercises WHERE name = 'Seated Cable Row'              AND is_archived = false LIMIT 1;
  SELECT id INTO v_face_pull           FROM exercises WHERE name = 'Face Pull'                     AND is_archived = false LIMIT 1;
  SELECT id INTO v_barbell_curl        FROM exercises WHERE name = 'Barbell Curl'                  AND is_archived = false LIMIT 1;
  SELECT id INTO v_hammer_curl         FROM exercises WHERE name = 'Hammer Curl'                   AND is_archived = false LIMIT 1;

  -- Push 2
  SELECT id INTO v_incline_bb_press    FROM exercises WHERE name = 'Incline Barbell Bench Press'   AND is_archived = false LIMIT 1;
  SELECT id INTO v_lo_hi_cable_fly     FROM exercises WHERE name = 'Low-to-High Cable Fly'         AND is_archived = false LIMIT 1;
  SELECT id INTO v_rear_delt_flye      FROM exercises WHERE name = 'Rear Delt Flye'                AND is_archived = false LIMIT 1;
  SELECT id INTO v_skull_crusher       FROM exercises WHERE name = 'Skull Crusher'                 AND is_archived = false LIMIT 1;

  -- Legs 2
  SELECT id INTO v_hip_thrust          FROM exercises WHERE name = 'Hip Thrust'                    AND is_archived = false LIMIT 1;
  SELECT id INTO v_bulgarian           FROM exercises WHERE name = 'Bulgarian Split Squat'         AND is_archived = false LIMIT 1;
  SELECT id INTO v_seated_leg_curl     FROM exercises WHERE name = 'Leg Curl (Seated)'             AND is_archived = false LIMIT 1;
  SELECT id INTO v_seated_calf_raise   FROM exercises WHERE name = 'Seated Calf Raise'             AND is_archived = false LIMIT 1;

  -- Pull 2
  SELECT id INTO v_lat_pulldown        FROM exercises WHERE name = 'Lat Pulldown'                  AND is_archived = false LIMIT 1;
  SELECT id INTO v_single_arm_row      FROM exercises WHERE name = 'Single-Arm Dumbbell Row'       AND is_archived = false LIMIT 1;
  SELECT id INTO v_neutral_pulldown    FROM exercises WHERE name = 'Lat Pulldown (Close/Neutral Grip)' AND is_archived = false LIMIT 1;
  SELECT id INTO v_straight_arm_pd     FROM exercises WHERE name = 'Straight-Arm Pulldown'         AND is_archived = false LIMIT 1;
  SELECT id INTO v_incline_db_curl     FROM exercises WHERE name = 'Incline Dumbbell Curl'         AND is_archived = false LIMIT 1;
  SELECT id INTO v_cable_curl          FROM exercises WHERE name = 'Cable Curl'                    AND is_archived = false LIMIT 1;

  -- ── 2. Create the program ─────────────────────────────────────────────────

  INSERT INTO programs (title, description, duration_weeks, is_published, cover_image_url)
  VALUES (
    'Well-rounded Hypertrophy 6x per week',
    'A 6-day Push / Legs / Pull split (PPL × 2) that trains each muscle group twice per week. ' ||
    'Balanced volume across chest, back, shoulders, arms, quads, hamstrings and glutes ensures ' ||
    'well-rounded development with no lagging body parts. ' ||
    'Week 1 uses 2 sets per exercise to introduce movement patterns and establish starting weights. ' ||
    'Weeks 2–4 and 6 run at full prescribed volume. Week 5 is the peak volume week — ' ||
    'every exercise gets +1 set for maximum stimulus. Train Mon–Sat with Sunday as complete rest.',
    6,
    true,
    NULL
  )
  RETURNING id INTO v_program_id;

  -- ── 3. Loop through all 6 weeks, creating sessions for each ──────────────

  FOR v_week_num IN 1..6 LOOP

    INSERT INTO program_weeks (program_id, week_number, title, description)
    VALUES (
      v_program_id,
      v_week_num,
      CASE v_week_num
        WHEN 1 THEN 'Week 1 — Introduction (2 sets)'
        WHEN 2 THEN 'Week 2 — Full Volume Begins'
        WHEN 3 THEN 'Week 3 — Build'
        WHEN 4 THEN 'Week 4 — Build'
        WHEN 5 THEN 'Week 5 — Peak Volume (4–5 sets)'
        WHEN 6 THEN 'Week 6 — Final Push'
      END,
      CASE v_week_num
        WHEN 1 THEN 'Introductory week. All exercises capped at 2 sets. Focus on technique and finding working weights — leave 3+ reps in reserve on every set.'
        WHEN 5 THEN 'Peak volume week. Every exercise gets +1 set (4–5 sets total) — the highest stimulus in the entire program. Keep form sharp and aim for 1–2 reps in reserve.'
        ELSE        'Full volume week. Aim for 1–2 reps in reserve. Log weights and beat last week''s numbers wherever possible.'
      END
    )
    RETURNING id INTO v_week_id;

    -- ════════════════════════════════════════════════════════════════
    -- DAY 1 (Monday) — PUSH 1: Chest · Shoulders · Triceps
    -- Horizontal push emphasis
    -- ════════════════════════════════════════════════════════════════

    INSERT INTO program_sessions (program_week_id, day_of_week, title, description, session_order)
    VALUES (
      v_week_id, 1,
      'Push 1 — Chest, Shoulders & Triceps',
      'Horizontal push focus. Barbell bench press leads, followed by incline dumbbell work, cable flyes, overhead press for shoulder mass, lateral raises for width, and tricep pushdowns to finish.',
      1
    )
    RETURNING id INTO v_session_id;

    INSERT INTO session_exercises
      (session_id, exercise_id, exercise_order, prescribed_sets, rep_range_min, rep_range_max, rest_seconds, notes)
    VALUES
      (v_session_id, v_bench_press,      1, CASE WHEN v_week_num = 1 THEN 2 WHEN v_week_num = 5 THEN 5 ELSE 4 END,  6, 10, 180,
       'Primary horizontal push. Retract scapula, slight arch, feet flat. Bar touches low chest. Press explosively.'),
      (v_session_id, v_incline_db_press, 2, CASE WHEN v_week_num = 1 THEN 2 WHEN v_week_num = 5 THEN 4 ELSE 3 END,  8, 12,  90,
       'Upper chest emphasis. 30–45° incline. Press dumbbells inward at the top for a full contraction.'),
      (v_session_id, v_cable_flye,       3, CASE WHEN v_week_num = 1 THEN 2 WHEN v_week_num = 5 THEN 4 ELSE 3 END, 12, 15,  60,
       'Chest isolation — constant tension. Slight elbow bend throughout. Prioritise the stretch at the bottom.'),
      (v_session_id, v_ohp,              4, CASE WHEN v_week_num = 1 THEN 2 WHEN v_week_num = 5 THEN 4 ELSE 3 END,  8, 12,  90,
       'Shoulder mass builder. Brace core, press bar from front rack to full lockout overhead.'),
      (v_session_id, v_lateral_raise,    5, CASE WHEN v_week_num = 1 THEN 2 WHEN v_week_num = 5 THEN 5 ELSE 4 END, 15, 20,  60,
       'Lateral delt width. Lead with pinkies, slight forward lean. Control the eccentric fully.'),
      (v_session_id, v_tricep_pushdown,  6, CASE WHEN v_week_num = 1 THEN 2 WHEN v_week_num = 5 THEN 4 ELSE 3 END, 12, 15,  60,
       'Rope attachment. Elbows pinned at sides, split the rope at the bottom. Full lockout every rep.');

    -- ════════════════════════════════════════════════════════════════
    -- DAY 2 (Tuesday) — LEGS 1: Quad Dominant
    -- ════════════════════════════════════════════════════════════════

    INSERT INTO program_sessions (program_week_id, day_of_week, title, description, session_order)
    VALUES (
      v_week_id, 2,
      'Legs 1 — Quad Focus',
      'Squat-centred lower body day. Heavy barbell squat builds quad and glute strength. Leg press, extension and RDL round out the session with hamstring balance via lying curl and calf work.',
      2
    )
    RETURNING id INTO v_session_id;

    INSERT INTO session_exercises
      (session_id, exercise_id, exercise_order, prescribed_sets, rep_range_min, rep_range_max, rest_seconds, notes)
    VALUES
      (v_session_id, v_back_squat,          1, CASE WHEN v_week_num = 1 THEN 2 WHEN v_week_num = 5 THEN 5 ELSE 4 END,  6, 10, 180,
       'King of quad movements. Hit depth, knees out, chest up. Drive through heels out of the hole.'),
      (v_session_id, v_leg_press,           2, CASE WHEN v_week_num = 1 THEN 2 WHEN v_week_num = 5 THEN 4 ELSE 3 END, 10, 15,  90,
       'Feet shoulder-width, middle of platform. Do not lock knees at the top. Full range of motion.'),
      (v_session_id, v_leg_extension,       3, CASE WHEN v_week_num = 1 THEN 2 WHEN v_week_num = 5 THEN 4 ELSE 3 END, 12, 15,  60,
       'Quad isolation. Pause at full extension, 2-second eccentric on the way down.'),
      (v_session_id, v_rdl,                 4, CASE WHEN v_week_num = 1 THEN 2 WHEN v_week_num = 5 THEN 4 ELSE 3 END, 10, 12,  90,
       'Hamstring hinge — flat back, push hips back, feel the stretch before reversing.'),
      (v_session_id, v_lying_leg_curl,      5, CASE WHEN v_week_num = 1 THEN 2 WHEN v_week_num = 5 THEN 4 ELSE 3 END, 12, 15,  60,
       'Hamstring isolation. Full extension at the bottom, brief pause at the top.'),
      (v_session_id, v_standing_calf_raise, 6, CASE WHEN v_week_num = 1 THEN 2 WHEN v_week_num = 5 THEN 5 ELSE 4 END, 15, 20,  60,
       'Deep stretch every rep. Hold the top 1 second. Slow 3-count eccentric.');

    -- ════════════════════════════════════════════════════════════════
    -- DAY 3 (Wednesday) — PULL 1: Back & Biceps (Vertical Pull Focus)
    -- ════════════════════════════════════════════════════════════════

    INSERT INTO program_sessions (program_week_id, day_of_week, title, description, session_order)
    VALUES (
      v_week_id, 3,
      'Pull 1 — Back & Biceps',
      'Vertical pull emphasis. Pull-up and barbell row are the main strength movements. Cable row, face pulls and bicep work fill out the session.',
      3
    )
    RETURNING id INTO v_session_id;

    INSERT INTO session_exercises
      (session_id, exercise_id, exercise_order, prescribed_sets, rep_range_min, rep_range_max, rest_seconds, notes)
    VALUES
      (v_session_id, v_pullup,           1, CASE WHEN v_week_num = 1 THEN 2 WHEN v_week_num = 5 THEN 5 ELSE 4 END,  6, 10, 180,
       'Dead-hang each rep. Drive elbows toward hips. Chest touches bar at the top. Add weight if sets feel easy.'),
      (v_session_id, v_barbell_row,      2, CASE WHEN v_week_num = 1 THEN 2 WHEN v_week_num = 5 THEN 5 ELSE 4 END,  8, 12,  90,
       'Hinge to 45°, overhand grip. Pull bar to lower chest. Pause and squeeze at the top.'),
      (v_session_id, v_seated_cable_row, 3, CASE WHEN v_week_num = 1 THEN 2 WHEN v_week_num = 5 THEN 4 ELSE 3 END, 10, 12,  90,
       'Stay upright throughout — no rocking. Full retraction at the end, full stretch at the front.'),
      (v_session_id, v_face_pull,        4, CASE WHEN v_week_num = 1 THEN 2 WHEN v_week_num = 5 THEN 4 ELSE 3 END, 15, 20,  60,
       'Cable at head height, rope attachment. Pull to face with external rotation. Essential for shoulder health.'),
      (v_session_id, v_barbell_curl,     5, CASE WHEN v_week_num = 1 THEN 2 WHEN v_week_num = 5 THEN 4 ELSE 3 END, 10, 12,  60,
       'Elbows stay at sides. Full supination at the top. Lower slowly — 2-second negative.'),
      (v_session_id, v_hammer_curl,      6, CASE WHEN v_week_num = 1 THEN 2 WHEN v_week_num = 5 THEN 4 ELSE 3 END, 12, 15,  60,
       'Neutral grip throughout. Builds brachialis for overall arm thickness.');

    -- ════════════════════════════════════════════════════════════════
    -- DAY 4 (Thursday) — PUSH 2: Shoulders · Triceps · Chest
    -- Vertical push emphasis
    -- ════════════════════════════════════════════════════════════════

    INSERT INTO program_sessions (program_week_id, day_of_week, title, description, session_order)
    VALUES (
      v_week_id, 4,
      'Push 2 — Shoulders, Triceps & Chest',
      'Vertical push focus. Overhead press leads for shoulder strength. Incline bench and cable fly hit the chest from the upper angle. Laterals and rear delts maintain shoulder balance; skull crushers finish the triceps.',
      4
    )
    RETURNING id INTO v_session_id;

    INSERT INTO session_exercises
      (session_id, exercise_id, exercise_order, prescribed_sets, rep_range_min, rep_range_max, rest_seconds, notes)
    VALUES
      (v_session_id, v_ohp,              1, CASE WHEN v_week_num = 1 THEN 2 WHEN v_week_num = 5 THEN 5 ELSE 4 END,  6, 10, 180,
       'Primary vertical push. Heavier than Push 1. Full lockout, bar slightly behind ears at the top.'),
      (v_session_id, v_incline_bb_press, 2, CASE WHEN v_week_num = 1 THEN 2 WHEN v_week_num = 5 THEN 4 ELSE 3 END,  8, 12,  90,
       'Upper chest from a different angle to Flat Bench on Push 1. Controlled tempo.'),
      (v_session_id, v_lo_hi_cable_fly,  3, CASE WHEN v_week_num = 1 THEN 2 WHEN v_week_num = 5 THEN 4 ELSE 3 END, 12, 15,  60,
       'Low cable to high — targets the upper/clavicular pec. Constant tension throughout the arc.'),
      (v_session_id, v_lateral_raise,    4, CASE WHEN v_week_num = 1 THEN 2 WHEN v_week_num = 5 THEN 5 ELSE 4 END, 15, 20,  60,
       'Second lateral delt session of the week. Keep reps clean — no momentum, no swinging.'),
      (v_session_id, v_rear_delt_flye,   5, CASE WHEN v_week_num = 1 THEN 2 WHEN v_week_num = 5 THEN 4 ELSE 3 END, 15, 20,  60,
       'Bent over or incline bench. Slight elbow bend. Squeeze rear delts at the top. Light weight.'),
      (v_session_id, v_skull_crusher,    6, CASE WHEN v_week_num = 1 THEN 2 WHEN v_week_num = 5 THEN 4 ELSE 3 END, 10, 12,  60,
       'Long head tricep stretch. Lower bar behind/to the forehead. EZ-bar is easiest on the wrists.');

    -- ════════════════════════════════════════════════════════════════
    -- DAY 5 (Friday) — LEGS 2: Hip & Hamstring Dominant
    -- ════════════════════════════════════════════════════════════════

    INSERT INTO program_sessions (program_week_id, day_of_week, title, description, session_order)
    VALUES (
      v_week_id, 5,
      'Legs 2 — Hip & Hamstring Focus',
      'Posterior chain day. Romanian deadlift and hip thrust are the primary drivers. Bulgarian split squat adds unilateral work. Hamstring curl, quad extension, and seated calf round out the session.',
      5
    )
    RETURNING id INTO v_session_id;

    INSERT INTO session_exercises
      (session_id, exercise_id, exercise_order, prescribed_sets, rep_range_min, rep_range_max, rest_seconds, notes)
    VALUES
      (v_session_id, v_rdl,          1, CASE WHEN v_week_num = 1 THEN 2 WHEN v_week_num = 5 THEN 5 ELSE 4 END,  8, 12, 180,
       'Heavier than Legs 1 version. Push hips back, feel deep hamstring stretch, squeeze glutes to return.'),
      (v_session_id, v_hip_thrust,   2, CASE WHEN v_week_num = 1 THEN 2 WHEN v_week_num = 5 THEN 5 ELSE 4 END, 10, 15,  90,
       'Primary glute builder. Bar on hips with pad. Drive through heels, full hip extension, hold 1 second.'),
      (v_session_id, v_bulgarian,    3, CASE WHEN v_week_num = 1 THEN 2 WHEN v_week_num = 5 THEN 4 ELSE 3 END, 10, 12,  90,
       'Back foot elevated on bench. Upright torso, front knee tracks over toes. Complete all reps one leg then switch.'),
      (v_session_id, v_seated_leg_curl, 4, CASE WHEN v_week_num = 1 THEN 2 WHEN v_week_num = 5 THEN 4 ELSE 3 END, 12, 15,  60,
       'Seated curl creates more hamstring stretch than lying. Slow eccentric, squeeze at the end.'),
      (v_session_id, v_leg_extension,  5, CASE WHEN v_week_num = 1 THEN 2 WHEN v_week_num = 5 THEN 4 ELSE 3 END, 12, 15,  60,
       'VMO and quad finisher. Squeeze at the top of every rep. 2-second eccentric.'),
      (v_session_id, v_seated_calf_raise, 6, CASE WHEN v_week_num = 1 THEN 2 WHEN v_week_num = 5 THEN 5 ELSE 4 END, 15, 20,  60,
       'Isolates the soleus (bent-knee). Long pause at the bottom stretch. 3-second eccentric.');

    -- ════════════════════════════════════════════════════════════════
    -- DAY 6 (Saturday) — PULL 2: Lats · Back Width · Biceps
    -- Horizontal pull / lat emphasis
    -- ════════════════════════════════════════════════════════════════

    INSERT INTO program_sessions (program_week_id, day_of_week, title, description, session_order)
    VALUES (
      v_week_id, 6,
      'Pull 2 — Lats, Back & Biceps',
      'Lat-width focus. Lat pulldown and single-arm row are the anchors. Neutral-grip pulldown adds volume from a different angle. Straight-arm pulldown isolates the lats directly. Incline and cable curls finish the biceps.',
      6
    )
    RETURNING id INTO v_session_id;

    INSERT INTO session_exercises
      (session_id, exercise_id, exercise_order, prescribed_sets, rep_range_min, rep_range_max, rest_seconds, notes)
    VALUES
      (v_session_id, v_lat_pulldown,     1, CASE WHEN v_week_num = 1 THEN 2 WHEN v_week_num = 5 THEN 5 ELSE 4 END,  8, 12,  90,
       'Wide overhand grip. Pull bar to upper chest by driving elbows to hips. Full stretch at the top.'),
      (v_session_id, v_single_arm_row,   2, CASE WHEN v_week_num = 1 THEN 2 WHEN v_week_num = 5 THEN 5 ELSE 4 END, 10, 12,  90,
       'Allow full shoulder protraction at the bottom — this maximises lat stretch. Drive elbow toward ceiling.'),
      (v_session_id, v_neutral_pulldown, 3, CASE WHEN v_week_num = 1 THEN 2 WHEN v_week_num = 5 THEN 4 ELSE 3 END, 10, 12,  90,
       'Close neutral grip — slightly different lat angle and often stronger contraction for some lifters.'),
      (v_session_id, v_straight_arm_pd,  4, CASE WHEN v_week_num = 1 THEN 2 WHEN v_week_num = 5 THEN 4 ELSE 3 END, 12, 15,  60,
       'Arms stay nearly straight. Pure lat isolation — no bicep involvement. Squeeze at hip level.'),
      (v_session_id, v_incline_db_curl,  5, CASE WHEN v_week_num = 1 THEN 2 WHEN v_week_num = 5 THEN 4 ELSE 3 END, 10, 12,  60,
       'Incline pre-stretches the long head. Let arms hang fully at the bottom before each curl.'),
      (v_session_id, v_cable_curl,       6, CASE WHEN v_week_num = 1 THEN 2 WHEN v_week_num = 5 THEN 4 ELSE 3 END, 12, 15,  60,
       'Cable maintains tension at the top — unlike free weights. Squeeze hard at shoulder height.');

  END LOOP; -- end week loop

  RAISE NOTICE 'Program "Well-rounded Hypertrophy 6x per week" created. ID: %', v_program_id;

END $$;
