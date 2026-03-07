-- ─── Exercise Library Seed Data ───────────────────────────────────────────────
-- Covers all major muscle groups with ~60 common exercises.
-- Safe to re-run: skips any exercise whose name already exists.

INSERT INTO exercises (name, muscle_groups, equipment, description, youtube_url)
SELECT name, muscle_groups, equipment, description, youtube_url
FROM (VALUES

  -- ── Chest ──────────────────────────────────────────────────────────────────
  (
    'Barbell Bench Press',
    ARRAY['Chest', 'Triceps', 'Shoulders'],
    ARRAY['Barbell'],
    'The foundational horizontal push movement. Lie flat on a bench and press a barbell from chest height to full lockout. Keep feet flat on the floor, retract the shoulder blades, and maintain a slight natural arch.',
    NULL
  ),
  (
    'Incline Dumbbell Press',
    ARRAY['Chest', 'Triceps', 'Shoulders'],
    ARRAY['Dumbbell'],
    'Performed on a 30–45 degree incline bench to emphasise the upper chest. Press the dumbbells from shoulder level to full lockout, then lower with control.',
    NULL
  ),
  (
    'Cable Flye',
    ARRAY['Chest'],
    ARRAY['Cable'],
    'A chest isolation movement using a cable machine set to chest height. Bring the handles together in a wide arc, keeping a slight bend in the elbows throughout the range of motion.',
    NULL
  ),
  (
    'Push-Up',
    ARRAY['Chest', 'Triceps', 'Shoulders', 'Core'],
    ARRAY['Bodyweight'],
    'A classic bodyweight pressing exercise. Keep the body in a rigid plank position and lower the chest to just above the floor, then press back up. Hands placed slightly wider than shoulder-width.',
    NULL
  ),
  (
    'Dumbbell Fly',
    ARRAY['Chest'],
    ARRAY['Dumbbell'],
    'Lie flat on a bench and arc the dumbbells out and down with a slight bend in the elbows, stretching the chest, then squeeze them back together at the top. Focus on the pec stretch at the bottom.',
    NULL
  ),

  -- ── Back ───────────────────────────────────────────────────────────────────
  (
    'Pull-Up',
    ARRAY['Back', 'Biceps'],
    ARRAY['Bodyweight'],
    'Hang from a bar with an overhand grip wider than shoulder-width. Pull the chest to the bar by driving the elbows down and back. Full dead-hang at the bottom, chin over bar at the top.',
    NULL
  ),
  (
    'Barbell Row',
    ARRAY['Back', 'Biceps', 'Core'],
    ARRAY['Barbell'],
    'Hinge at the hips to roughly 45 degrees, then pull a barbell to the lower chest/upper abdomen. Keep the back flat and drive the elbows back, squeezing the lats and rhomboids at the top.',
    NULL
  ),
  (
    'Lat Pulldown',
    ARRAY['Back', 'Biceps'],
    ARRAY['Cable', 'Machine'],
    'Seated at a lat pulldown machine with a wide overhand grip, pull the bar to the upper chest by driving the elbows down. Control the eccentric return to full arm extension.',
    NULL
  ),
  (
    'Seated Cable Row',
    ARRAY['Back', 'Biceps'],
    ARRAY['Cable'],
    'Sit upright at a cable station with a close-grip handle. Pull the handle into the abdomen while keeping the torso vertical and squeezing the shoulder blades together at the finish.',
    NULL
  ),
  (
    'Single-Arm Dumbbell Row',
    ARRAY['Back', 'Biceps'],
    ARRAY['Dumbbell'],
    'Support one knee and hand on a bench while rowing a dumbbell with the opposite arm. Drive the elbow toward the ceiling, allowing the shoulder to fully retract at the top.',
    NULL
  ),
  (
    'Face Pull',
    ARRAY['Shoulders', 'Back'],
    ARRAY['Cable'],
    'Set a cable rope attachment at head height. Pull the rope toward the face while externally rotating the shoulders at the end of the movement. Excellent for rear deltoids and rotator cuff health.',
    NULL
  ),
  (
    'Deadlift',
    ARRAY['Back', 'Hamstrings', 'Glutes', 'Core'],
    ARRAY['Barbell'],
    'The king of posterior-chain movements. Hinge to grip the bar with flat back, then extend hips and knees simultaneously to lock out while keeping the bar close to the body throughout the pull.',
    NULL
  ),

  -- ── Shoulders ──────────────────────────────────────────────────────────────
  (
    'Overhead Press',
    ARRAY['Shoulders', 'Triceps'],
    ARRAY['Barbell'],
    'Press a barbell from the front rack position overhead to full lockout. Keep the core braced, elbows tracking slightly forward, and finish with the bar directly above the shoulder joint.',
    NULL
  ),
  (
    'Lateral Raise',
    ARRAY['Shoulders'],
    ARRAY['Dumbbell'],
    'Stand with dumbbells at the sides and raise them out to shoulder height in a wide arc, keeping a slight bend in the elbows and leading with the pinkies. Lower under control.',
    NULL
  ),
  (
    'Front Raise',
    ARRAY['Shoulders'],
    ARRAY['Dumbbell'],
    'Hold dumbbells in front of the thighs and raise them forward to shoulder height with arms straight or slightly bent. Lower slowly. Primarily targets the anterior deltoid.',
    NULL
  ),
  (
    'Arnold Press',
    ARRAY['Shoulders', 'Triceps'],
    ARRAY['Dumbbell'],
    'Start with dumbbells at chin height, palms facing you. As you press overhead, rotate the hands outward so palms face away at lockout. The rotation recruits all three deltoid heads.',
    NULL
  ),
  (
    'Cable Lateral Raise',
    ARRAY['Shoulders'],
    ARRAY['Cable'],
    'Using a low cable pulley, raise the handle out to the side to shoulder height. The cable provides constant tension at the bottom of the movement unlike dumbbells.',
    NULL
  ),
  (
    'Rear Delt Flye',
    ARRAY['Shoulders', 'Back'],
    ARRAY['Dumbbell'],
    'Hinge forward or lie prone on an incline bench. Raise the dumbbells out to the sides in a reverse fly motion, squeezing the rear deltoids and mid-back at the top.',
    NULL
  ),

  -- ── Biceps ─────────────────────────────────────────────────────────────────
  (
    'Barbell Curl',
    ARRAY['Biceps'],
    ARRAY['Barbell'],
    'Stand holding a barbell with a supinated (underhand) grip. Curl the bar up to shoulder height, keeping the upper arms stationary and squeezing at the top. Lower under control.',
    NULL
  ),
  (
    'Dumbbell Curl',
    ARRAY['Biceps'],
    ARRAY['Dumbbell'],
    'Alternating or simultaneous dumbbell curl from the hip to shoulder height. Supinate the wrist at the top to fully contract the bicep. Keep elbows at the sides throughout.',
    NULL
  ),
  (
    'Hammer Curl',
    ARRAY['Biceps'],
    ARRAY['Dumbbell'],
    'Performed with a neutral (hammer) grip throughout the movement. Targets the brachialis and brachioradialis in addition to the biceps, building overall arm thickness.',
    NULL
  ),
  (
    'Incline Dumbbell Curl',
    ARRAY['Biceps'],
    ARRAY['Dumbbell'],
    'Set a bench to 45–60 degrees and sit back. The incline position stretches the long head of the bicep at the start of each rep, increasing the range of motion and peak contraction.',
    NULL
  ),
  (
    'Cable Curl',
    ARRAY['Biceps'],
    ARRAY['Cable'],
    'Using a low pulley with a straight or EZ-bar attachment, curl the handle to shoulder height. Cables maintain tension at the top of the movement unlike free weights.',
    NULL
  ),
  (
    'Preacher Curl',
    ARRAY['Biceps'],
    ARRAY['Barbell'],
    'Performed on a preacher bench that fixes the upper arms against a pad. This eliminates cheating, isolates the bicep, and emphasises the bottom portion of the curl.',
    NULL
  ),

  -- ── Triceps ────────────────────────────────────────────────────────────────
  (
    'Tricep Pushdown',
    ARRAY['Triceps'],
    ARRAY['Cable'],
    'Using a rope or bar attachment at a high pulley, push the handle down until the elbows are fully extended. Keep the upper arms vertical and control the eccentric return.',
    NULL
  ),
  (
    'Close-Grip Bench Press',
    ARRAY['Triceps', 'Chest'],
    ARRAY['Barbell'],
    'Performed like the standard bench press but with hands shoulder-width apart. The narrower grip shifts emphasis onto the triceps while still engaging the chest and front delts.',
    NULL
  ),
  (
    'Skull Crusher',
    ARRAY['Triceps'],
    ARRAY['Barbell'],
    'Lie on a bench and hold a barbell (or EZ-bar) with a close grip at arms length over the chest. Hinge only at the elbows to lower the bar toward the forehead, then extend back up.',
    NULL
  ),
  (
    'Overhead Tricep Extension',
    ARRAY['Triceps'],
    ARRAY['Dumbbell'],
    'Hold a single dumbbell overhead with both hands and lower it behind the head by bending the elbows. Extend back to lockout. The overhead position stretches the long head of the tricep.',
    NULL
  ),
  (
    'Dip',
    ARRAY['Triceps', 'Chest', 'Shoulders'],
    ARRAY['Bodyweight'],
    'Support the body between parallel bars at arm''s length. Lower until the elbows reach 90 degrees (or slightly past), then press back up. A forward lean emphasises chest; upright torso emphasises triceps.',
    NULL
  ),
  (
    'Diamond Push-Up',
    ARRAY['Triceps', 'Chest'],
    ARRAY['Bodyweight'],
    'A push-up variation where the hands are placed close together beneath the chest forming a diamond shape with thumbs and index fingers. The close hand position heavily loads the triceps.',
    NULL
  ),

  -- ── Quads ──────────────────────────────────────────────────────────────────
  (
    'Barbell Back Squat',
    ARRAY['Quads', 'Hamstrings', 'Glutes', 'Core'],
    ARRAY['Barbell'],
    'The fundamental compound lower body movement. Bar sits on the upper traps, feet shoulder-width apart, toes slightly out. Descend until thighs are parallel or below, then drive through the heels back to standing.',
    NULL
  ),
  (
    'Front Squat',
    ARRAY['Quads', 'Core'],
    ARRAY['Barbell'],
    'The barbell rests in the front rack position across the front delts. Requires greater ankle mobility and an upright torso, placing more emphasis on the quads and core compared to the back squat.',
    NULL
  ),
  (
    'Leg Press',
    ARRAY['Quads', 'Hamstrings', 'Glutes'],
    ARRAY['Machine'],
    'Seated in a leg press machine, push a weighted platform away using the legs. Foot placement changes muscle emphasis: higher and wider targets glutes and hamstrings; lower and narrower hits quads.',
    NULL
  ),
  (
    'Hack Squat',
    ARRAY['Quads', 'Glutes'],
    ARRAY['Machine'],
    'Performed in a 45-degree machine that allows a squat pattern with less lower-back demand. The fixed trajectory and pad support enable heavy quad loading with good form.',
    NULL
  ),
  (
    'Leg Extension',
    ARRAY['Quads'],
    ARRAY['Machine'],
    'A strict quad isolation exercise performed in a seated machine. Extend the legs from a bent position to full lockout, controlling the eccentric lowering phase to maximise stimulus.',
    NULL
  ),
  (
    'Bulgarian Split Squat',
    ARRAY['Quads', 'Glutes', 'Hamstrings'],
    ARRAY['Dumbbell'],
    'A rear-foot-elevated single-leg squat. The back foot rests on a bench while the front leg does the work. One of the most demanding single-leg exercises for quad and glute development.',
    NULL
  ),

  -- ── Hamstrings ─────────────────────────────────────────────────────────────
  (
    'Romanian Deadlift',
    ARRAY['Hamstrings', 'Glutes'],
    ARRAY['Barbell'],
    'Start standing with the barbell at hip height. Hinge at the hips while maintaining a flat back, lowering the bar down the shins until a strong hamstring stretch is felt, then drive the hips forward to return.',
    NULL
  ),
  (
    'Leg Curl (Lying)',
    ARRAY['Hamstrings'],
    ARRAY['Machine'],
    'Lie face-down on a lying leg curl machine. Curl the padded lever from a straight position up toward the glutes, squeezing the hamstrings at the top. Control the return to full extension.',
    NULL
  ),
  (
    'Leg Curl (Seated)',
    ARRAY['Hamstrings'],
    ARRAY['Machine'],
    'Performed in a seated leg curl machine which keeps the hip flexed, increasing the stretch on the hamstrings. Pull the lower pad down toward the seat and squeeze at peak contraction.',
    NULL
  ),
  (
    'Nordic Curl',
    ARRAY['Hamstrings'],
    ARRAY['Bodyweight'],
    'Kneel with ankles secured. Lower the torso toward the floor using only hamstring eccentric strength, falling as slowly as possible. Push up from the floor and repeat. An advanced hamstring strengthening exercise.',
    NULL
  ),
  (
    'Good Morning',
    ARRAY['Hamstrings', 'Glutes', 'Back'],
    ARRAY['Barbell'],
    'With a barbell on the upper back, hinge at the hips with a slight knee bend, lowering the torso until it is roughly parallel to the floor. Drive the hips forward to return to upright. Trains the hip hinge pattern.',
    NULL
  ),

  -- ── Glutes ─────────────────────────────────────────────────────────────────
  (
    'Hip Thrust',
    ARRAY['Glutes', 'Hamstrings'],
    ARRAY['Barbell'],
    'Sit with upper back against a bench and a barbell across the hips. Drive through the heels to lift the hips until the torso is parallel to the floor, squeezing the glutes hard at the top.',
    NULL
  ),
  (
    'Glute Bridge',
    ARRAY['Glutes', 'Hamstrings'],
    ARRAY['Bodyweight'],
    'Lie on your back with knees bent and feet flat on the floor. Drive the hips toward the ceiling by squeezing the glutes, hold briefly at the top, then lower. Can be loaded with a dumbbell or plate.',
    NULL
  ),
  (
    'Cable Kickback',
    ARRAY['Glutes'],
    ARRAY['Cable'],
    'Attach an ankle cuff to a low cable pulley. Hinge slightly forward at the hip and kick the working leg straight back, squeezing the glute at full extension. Keep the movement controlled and avoid lumbar rotation.',
    NULL
  ),
  (
    'Sumo Deadlift',
    ARRAY['Glutes', 'Hamstrings', 'Back', 'Quads'],
    ARRAY['Barbell'],
    'A deadlift variation with a wide stance and toes pointed out. Grip the bar inside the legs. The wide stance increases glute and inner-thigh involvement compared to the conventional deadlift.',
    NULL
  ),
  (
    'Abductor Machine',
    ARRAY['Glutes'],
    ARRAY['Machine'],
    'Seated in an abductor machine, push the pads outward against resistance, working the gluteus medius and minimus. Control the return to the starting position. Important for hip stability.',
    NULL
  ),

  -- ── Core ───────────────────────────────────────────────────────────────────
  (
    'Plank',
    ARRAY['Core'],
    ARRAY['Bodyweight'],
    'Hold a rigid, straight-body position supported on forearms and toes. Brace the abs, glutes, and quads simultaneously. Focus on preventing the hips from rising or sagging.',
    NULL
  ),
  (
    'Cable Crunch',
    ARRAY['Core'],
    ARRAY['Cable'],
    'Kneel facing a high cable pulley with a rope attachment held behind or beside the head. Curl the spine downward, bringing the elbows toward the knees, and squeeze the abs at the bottom.',
    NULL
  ),
  (
    'Hanging Leg Raise',
    ARRAY['Core'],
    ARRAY['Bodyweight'],
    'Hang from a pull-up bar and raise the legs to hip height (bent-knee) or above (straight-leg). Control the lowering phase without swinging. Heavily loads the lower abs and hip flexors.',
    NULL
  ),
  (
    'Ab Wheel Rollout',
    ARRAY['Core'],
    ARRAY['Bodyweight'],
    'Kneel and hold an ab wheel with both hands. Roll forward until the body is nearly horizontal, keeping the core braced to prevent spinal extension, then pull back to the start position.',
    NULL
  ),
  (
    'Russian Twist',
    ARRAY['Core'],
    ARRAY['Bodyweight'],
    'Sit with knees bent and feet slightly elevated. Rotate the torso side to side, touching the floor or a weight plate on each side. The rotation targets the obliques.',
    NULL
  ),
  (
    'Decline Sit-Up',
    ARRAY['Core'],
    ARRAY['Bodyweight'],
    'Secured at the ankles on a decline bench, perform a full sit-up from the declined position. The increased range of motion versus a flat sit-up intensifies the load on the rectus abdominis.',
    NULL
  ),

  -- ── Calves ─────────────────────────────────────────────────────────────────
  (
    'Standing Calf Raise',
    ARRAY['Calves'],
    ARRAY['Machine'],
    'Stand with the balls of the feet on the edge of a platform and raise the heels as high as possible. Lower the heels below platform level to achieve a full stretch. Can be performed with a barbell or machine.',
    NULL
  ),
  (
    'Seated Calf Raise',
    ARRAY['Calves'],
    ARRAY['Machine'],
    'Sit in a seated calf raise machine with knees at 90 degrees. The bent-knee position de-emphasises the gastrocnemius and isolates the soleus more effectively than standing variations.',
    NULL
  ),
  (
    'Donkey Calf Raise',
    ARRAY['Calves'],
    ARRAY['Machine'],
    'Performed bent over at the hip with forearms on a pad and a weight belt or machine pad across the lower back. The hip-flexed position pre-stretches the gastrocnemius for a greater range of motion.',
    NULL
  ),

  -- ── Full Body ──────────────────────────────────────────────────────────────
  (
    'Power Clean',
    ARRAY['Back', 'Shoulders', 'Quads', 'Hamstrings', 'Glutes', 'Core'],
    ARRAY['Barbell'],
    'An Olympic weightlifting pull performed by explosively extending the hips and knees to pull the barbell from the floor to a front rack position in a single movement. Develops total-body power and coordination.',
    NULL
  ),
  (
    'Kettlebell Swing',
    ARRAY['Hamstrings', 'Glutes', 'Back', 'Core'],
    ARRAY['Kettlebell'],
    'Hinge at the hips and swing a kettlebell between the legs, then drive the hips forward explosively to swing it to shoulder height. The ballistic hip extension develops posterior-chain power and conditioning.',
    NULL
  ),
  (
    'Turkish Get-Up',
    ARRAY['Core', 'Shoulders', 'Glutes', 'Quads'],
    ARRAY['Kettlebell'],
    'A multi-step movement that takes the body from lying on the floor to fully standing while keeping a kettlebell pressed overhead throughout. Trains shoulder stability, hip mobility, and full-body coordination.',
    NULL
  )

) AS t(name, muscle_groups, equipment, description, youtube_url)
WHERE NOT EXISTS (
  SELECT 1 FROM exercises e WHERE e.name = t.name
);
