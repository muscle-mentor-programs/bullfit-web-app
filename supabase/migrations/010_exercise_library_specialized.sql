-- ─── Specialized / Coach-Curated Exercise Library ──────────────────────────────
-- 49 exercises covering specialized movements, machine variants, and coach-named
-- exercises not yet in the library.
-- Safe to re-run: skips any exercise whose name already exists.

INSERT INTO exercises (name, muscle_groups, equipment, description, youtube_url)
SELECT name, muscle_groups, equipment, description, youtube_url
FROM (VALUES

  -- ════════════════════════════════════════════════════════════════
  -- GLUTES & HIPS
  -- ════════════════════════════════════════════════════════════════

  ('45 Degree Hip Extension',
   ARRAY['Glutes','Hamstrings'],
   ARRAY['Machine'],
   'Performed on a 45-degree hyperextension bench. Drive the hips up against gravity by squeezing the glutes, pausing at the top, then lower with control. Keep the spine neutral throughout. Excellent for isolating the glutes and upper hamstrings.',
   NULL),

  ('45 Degree Kickback',
   ARRAY['Glutes'],
   ARRAY['Machine','Cable'],
   'Position at a 45-degree angle on a hyperextension bench or cable attachment. Drive one leg back and up, squeezing the glute hard at full extension. Control the return. Targets the gluteus maximus through hip hyperextension.',
   NULL),

  ('Glute Focused Leg Press',
   ARRAY['Glutes','Hamstrings'],
   ARRAY['Machine'],
   'Use a high and wide foot placement on the leg press platform. Drive through the heels rather than the toes, and allow a deep range of motion to maximise glute stretch at the bottom. The high foot position transfers emphasis away from the quads and into the glutes and hamstrings.',
   NULL),

  ('Glute-Biased Split Squat',
   ARRAY['Glutes','Quads','Hamstrings'],
   ARRAY['Bodyweight','Dumbbell'],
   'A split squat variation with the front foot stepped further forward than a standard lunge stance. This increased forward lean and extended stride places greater stretch and load on the glutes. Lower the back knee toward the floor while keeping the torso slightly inclined forward.',
   NULL),

  ('Machine Hip Thrust',
   ARRAY['Glutes'],
   ARRAY['Machine'],
   'Performed in a dedicated hip thrust machine that removes the need to set up with a barbell. Sit with the upper back against the pad and drive the hips to full extension, squeezing the glutes hard at the top. The machine provides consistent resistance throughout the range of motion.',
   NULL),

  -- ════════════════════════════════════════════════════════════════
  -- HAMSTRINGS
  -- ════════════════════════════════════════════════════════════════

  ('Knee-Blocked DB RDL',
   ARRAY['Hamstrings','Glutes'],
   ARRAY['Dumbbell'],
   'A Romanian deadlift variation where the knees are lightly pressed against a pad or bench to prevent forward travel. This blocks the quads from assisting and forces the hamstrings to do all the work. Hinge deeply, feeling the stretch, then drive the hips forward to return.',
   NULL),

  ('Machine Nordic Curl',
   ARRAY['Hamstrings'],
   ARRAY['Machine'],
   'A machine-assisted version of the Nordic curl. The machine controls the descent, allowing the athlete to lower slowly using hamstring eccentric strength before the machine assists on the return. Ideal for building the eccentric hamstring strength that reduces injury risk.',
   NULL),

  ('Single Leg Seated Leg Curl (Ext Rot)',
   ARRAY['Hamstrings'],
   ARRAY['Machine'],
   'Performed unilaterally on a seated leg curl machine with the working foot externally rotated (toes out). External rotation shifts emphasis onto the biceps femoris short head and outer hamstrings. Curl one leg at a time for better isolation and to identify imbalances.',
   NULL),

  -- ════════════════════════════════════════════════════════════════
  -- QUADS
  -- ════════════════════════════════════════════════════════════════

  ('Bodyweight Squat (Heel Elevated)',
   ARRAY['Quads','Glutes'],
   ARRAY['Bodyweight'],
   'A bodyweight squat with heels raised on a plate or wedge. Elevating the heels increases ankle dorsiflexion, allowing the torso to stay more upright and the knees to travel further forward, dramatically increasing quad activation. Great for quad development and squat mobility work.',
   NULL),

  ('Pendulum Squats',
   ARRAY['Quads','Glutes'],
   ARRAY['Machine'],
   'Performed in a pendulum squat machine where the load swings in an arc rather than moving vertically. The arc keeps constant tension on the quads and allows a very deep squat with a natural, joint-friendly movement path. One of the best machine exercises for quad hypertrophy.',
   NULL),

  ('Quad-Focus Leg Press',
   ARRAY['Quads'],
   ARRAY['Machine'],
   'Use a low and narrow foot placement on the leg press platform. Keep the feet close together in the centre of the platform and drive through the toes. This positioning removes the glutes and hamstrings from the movement, targeting the quads — particularly the vastus lateralis and rectus femoris.',
   NULL),

  -- ════════════════════════════════════════════════════════════════
  -- CALVES
  -- ════════════════════════════════════════════════════════════════

  ('Single Leg Donkey Calf Raise',
   ARRAY['Calves'],
   ARRAY['Machine','Bodyweight'],
   'A unilateral version of the donkey calf raise performed with the hip flexed and one leg working at a time. The hip-flexed position pre-stretches the gastrocnemius for maximum range of motion. Single-leg loading allows greater intensity per side and helps correct calf imbalances.',
   NULL),

  ('Standing Single Leg Calf Raise',
   ARRAY['Calves'],
   ARRAY['Bodyweight','Dumbbell'],
   'Stand on one foot with the ball of the foot on the edge of a step. Lower the heel below step level for a full stretch, then raise as high as possible. Single-leg loading significantly increases the stimulus compared to bilateral calf raises and forces each calf to work independently.',
   NULL),

  ('Toes-Inward Calf Raise',
   ARRAY['Calves'],
   ARRAY['Machine','Barbell'],
   'A calf raise variation performed with toes pointed inward (pigeon-toed stance). This position emphasises the outer head of the gastrocnemius (lateral gastrocnemius). Perform through full range of motion. Pair with toes-outward raises to develop the full calf.',
   NULL),

  -- ════════════════════════════════════════════════════════════════
  -- BACK & ROWS
  -- ════════════════════════════════════════════════════════════════

  ('Bent Over Barbell Row',
   ARRAY['Back','Biceps'],
   ARRAY['Barbell'],
   'Hinge at the hips to a roughly horizontal torso with a flat back. Pull a barbell to the lower chest or upper abdomen, driving the elbows back and squeezing the lats and rhomboids at the top. The bent-over position maximises back stretch at the bottom of each rep.',
   NULL),

  ('Lat Prayer (Pull-Over)',
   ARRAY['Back','Core'],
   ARRAY['Cable'],
   'Face a cable machine set to chest height. With arms extended and a slight elbow bend, pull the handle down and in toward the hips in a large arc (the prayer motion). The lat pull-over isolates the lats without bicep involvement, training the lat''s function of shoulder extension.',
   NULL),

  ('Machine Low Row',
   ARRAY['Back','Biceps'],
   ARRAY['Machine'],
   'Seated at a low-row machine with the cable originating from near the floor. Pull the handles to the abdomen or lower chest, keeping the torso upright. The low angle of pull emphasises the lower lats and teres major compared to mid or high rows.',
   NULL),

  ('Machine Upper-Back Row',
   ARRAY['Back','Shoulders'],
   ARRAY['Machine'],
   'A machine row where the handles are set at or above shoulder height to target the upper back — including the rhomboids, rear delts, and mid-traps. Pull the handles toward the face or upper chest, squeezing the shoulder blades together at the end of each rep.',
   NULL),

  ('Narrow Grip Pull-Down',
   ARRAY['Back','Biceps'],
   ARRAY['Cable','Machine'],
   'A lat pulldown performed with a close neutral-grip handle. The narrow grip allows a greater range of motion and places the elbows in a more advantageous path to fully stretch and contract the lats. Pull the handle to the upper chest while keeping the torso slightly reclined.',
   NULL),

  ('Narrow MAG Grip Row',
   ARRAY['Back','Biceps'],
   ARRAY['Cable','Machine'],
   'Performed with a narrow MAG (multi-angle grip) handle attachment that allows a neutral grip. The handle width and angle reduce wrist strain and allow the elbows to travel in a natural path. Pull to the abdomen while keeping the torso upright, focusing on retracting the shoulder blades.',
   NULL),

  ('Nautilus Pulldown',
   ARRAY['Back','Biceps'],
   ARRAY['Machine'],
   'Performed on a Nautilus or similar plate-loaded pulldown machine with a cam-based resistance curve. The cam is designed to match the strength curve of the lat, providing maximum resistance at the strongest point of the movement for superior muscle stimulus.',
   NULL),

  ('Pronated Lat Pulldown',
   ARRAY['Back','Biceps'],
   ARRAY['Cable','Machine'],
   'A lat pulldown performed with a pronated (overhand) grip, typically on a wide bar. The pronated grip shifts more stress onto the lats and reduces bicep involvement compared to a supinated grip. Pull to the upper chest while retracting the shoulder blades.',
   NULL),

  ('Semi-Horizontal Shrug (Machine)',
   ARRAY['Shoulders','Back'],
   ARRAY['Machine'],
   'Performed on a low row or chest-supported row machine. Sit in the row position but instead of pulling with the arms, perform a shrug — elevating the shoulder blades against the resistance. The semi-horizontal angle changes the force vector compared to a traditional vertical shrug, targeting different fibres of the upper traps.',
   NULL),

  -- ════════════════════════════════════════════════════════════════
  -- CHEST
  -- ════════════════════════════════════════════════════════════════

  ('Cross-Cable Extensions',
   ARRAY['Chest'],
   ARRAY['Cable'],
   'Set two cables on opposite sides of a cable station at chest height. Grasp one cable in each hand and bring them together in a crossing motion in front of the chest, like a cable fly but with full arm extension (no bend in elbows). The cross-over at the end contracts the inner pec fibres maximally.',
   NULL),

  ('High To Low Cable Fly',
   ARRAY['Chest'],
   ARRAY['Cable'],
   'Set cables at the highest position. Pull the handles downward and inward in a wide arc, converging at hip height. The downward angle emphasises the lower chest (sternal head of the pec major). Keep a slight elbow bend throughout and control the eccentric return.',
   NULL),

  ('Low Incline Machine Chest Press',
   ARRAY['Chest','Triceps','Shoulders'],
   ARRAY['Machine'],
   'Performed on a machine set to a low incline (15–25 degrees). The low angle develops the upper chest while reducing shoulder strain compared to a steep incline. Press to full lockout and control the return to maximum pec stretch.',
   NULL),

  ('Machine Chest Fly',
   ARRAY['Chest'],
   ARRAY['Machine'],
   'A chest isolation exercise on a pec fly / butterfly machine. Grip the handles and bring the arms together in a wide arc, squeezing the chest at peak contraction. Unlike a cable fly, the machine provides a guided path and is typically easier to set up for heavy loading.',
   NULL),

  -- ════════════════════════════════════════════════════════════════
  -- SHOULDERS
  -- ════════════════════════════════════════════════════════════════

  ('Hip-Level Cable Lateral Raise',
   ARRAY['Shoulders'],
   ARRAY['Cable'],
   'A cable lateral raise where the cable originates from hip height rather than the floor. This angle changes the strength curve, providing greater tension at the bottom of the movement and a unique stimulus to the medial deltoid. Raise the arm to shoulder height while keeping the elbow slightly bent.',
   NULL),

  ('Seated Dumbbell Lateral Raise',
   ARRAY['Shoulders'],
   ARRAY['Dumbbell'],
   'A lateral raise performed seated on a bench. Sitting eliminates the ability to use leg drive or body momentum, forcing strict deltoid isolation. Raise the dumbbells out to shoulder height leading with the elbows, with pinkies slightly higher than thumbs.',
   NULL),

  ('Seated Lateral Raise',
   ARRAY['Shoulders'],
   ARRAY['Dumbbell','Machine'],
   'Performed seated — either with dumbbells or on a lateral raise machine. Eliminating lower-body contribution forces the medial deltoid to work in isolation. Raise to shoulder height, pause briefly at the top, and control the eccentric phase.',
   NULL),

  ('Super ROM Laterals',
   ARRAY['Shoulders'],
   ARRAY['Dumbbell','Cable'],
   'A lateral raise variation that uses a full extended range of motion — starting from the hip (or even behind the body) and raising to above shoulder height. The extended range stretches the deltoid further at the bottom and contracts it harder at the top. Typically performed with lighter loads.',
   NULL),

  -- ════════════════════════════════════════════════════════════════
  -- BICEPS
  -- ════════════════════════════════════════════════════════════════

  ('Barbell (Or EZ Bar) Biceps Curl',
   ARRAY['Biceps'],
   ARRAY['Barbell'],
   'A biceps curl performed with a straight barbell or EZ-curl bar. The straight bar keeps the wrists fully supinated, maximising bicep activation. The EZ-bar offers a slightly more comfortable wrist angle. Curl from full extension to peak contraction, keeping the upper arms vertical.',
   NULL),

  ('Face-Away Curls',
   ARRAY['Biceps'],
   ARRAY['Cable'],
   'Stand facing away from a low cable pulley with the cable running between the legs or beside the hip. Curl the handle upward in the standard bicep curl motion. Facing away from the cable shifts the resistance profile, loading the bicep maximally at the stretched (bottom) position rather than the top.',
   NULL),

  ('Lying DB Bicep Curl',
   ARRAY['Biceps'],
   ARRAY['Dumbbell'],
   'Lie on a flat or slightly incline bench facing up. Curl dumbbells from the fully extended position to peak contraction while the upper arms remain vertical relative to the floor. The lying position prevents body sway and keeps constant vertical load through the range of motion.',
   NULL),

  ('Machine Preacher Curl',
   ARRAY['Biceps'],
   ARRAY['Machine'],
   'Performed on a dedicated preacher curl machine. The pad fixes the upper arms, eliminating any momentum or shoulder involvement. The machine provides a guided path and a consistent resistance curve, making it easier to achieve peak contraction and perform drop sets or slow eccentrics.',
   NULL),

  -- ════════════════════════════════════════════════════════════════
  -- TRICEPS
  -- ════════════════════════════════════════════════════════════════

  ('Cable Triceps Overhead Extension',
   ARRAY['Triceps'],
   ARRAY['Cable'],
   'Face away from a cable machine and hold the rope attachment overhead with both hands. Extend the elbows to full lockout, pointing the cable attachment forward and slightly up. The overhead position places the long head of the tricep in a fully stretched starting position, maximising its contribution.',
   NULL),

  ('Choker Extensions',
   ARRAY['Triceps'],
   ARRAY['Cable'],
   'A cable triceps extension variation where the rope or bar is held at the throat/neck level to start, then extended downward. The unique start position creates a maximal stretch on the lateral and medial heads of the tricep. Focus on controlled extension and squeeze at lockout.',
   NULL),

  ('Machine Triceps',
   ARRAY['Triceps'],
   ARRAY['Machine'],
   'A general term for tricep isolation movements performed on a dedicated triceps machine, such as a machine dip attachment, tricep press, or overhead extension machine. The machine path guides the movement, allows heavy loading, and is accessible for beginners and in rehabilitation settings.',
   NULL),

  ('Overhead Cable Extension',
   ARRAY['Triceps'],
   ARRAY['Cable'],
   'Using a cable pulley set behind the head (or a cable anchored low with the body turned away), extend the elbows fully overhead. The overhead position fully stretches the long head of the tricep, making it one of the best exercises for long-head development.',
   NULL),

  -- ════════════════════════════════════════════════════════════════
  -- CORE
  -- ════════════════════════════════════════════════════════════════

  ('Decline Crunch',
   ARRAY['Core'],
   ARRAY['Bodyweight'],
   'Perform a crunch on a decline bench with the head lower than the hips. The decline angle increases the range of motion and the load on the rectus abdominis at the top of the movement. Cross the arms over the chest or place hands behind the head; avoid pulling on the neck.',
   NULL),

  ('Face-Away Cable Crunch',
   ARRAY['Core'],
   ARRAY['Cable'],
   'Stand or kneel facing away from a high cable pulley, holding the rope at the back of the head. Crunch forward and downward, bringing the elbows toward the thighs. Facing away from the cable means maximum resistance is applied at the stretched (upright) position, unlike a traditional cable crunch.',
   NULL),

  -- ════════════════════════════════════════════════════════════════
  -- COMPOUND / PULL
  -- ════════════════════════════════════════════════════════════════

  ('Assisted Pull-Up',
   ARRAY['Back','Biceps'],
   ARRAY['Machine'],
   'Performed on an assisted pull-up machine that counterbalances a portion of bodyweight with a weight stack, making the pull-up accessible regardless of strength level. Grip the bar wider than shoulder-width and pull the chest to the bar. As strength increases, reduce the counterbalance weight.',
   NULL),

  -- ════════════════════════════════════════════════════════════════
  -- SHOULDERS & UPPER BACK (SHRUGS)
  -- ════════════════════════════════════════════════════════════════

  ('Barbell RDL',
   ARRAY['Hamstrings','Glutes','Back'],
   ARRAY['Barbell'],
   'The standard barbell Romanian deadlift. Hinge at the hips with a slight knee bend, lowering the barbell along the shins until a strong hamstring stretch is felt at roughly mid-shin. Drive the hips forward to return to standing. Keep the back flat and bar close to the body throughout.',
   NULL),

  ('Barbell Upright Rows',
   ARRAY['Shoulders','Back'],
   ARRAY['Barbell'],
   'Hold a barbell with a slightly-wider-than-hip-width overhand grip. Pull the bar straight up the front of the body to chin height, flaring the elbows wide and above the bar. Targets the lateral deltoid and upper back. Control the descent. Use a slightly wider grip to reduce shoulder impingement risk.',
   NULL),

  ('DB Trap Shrugs',
   ARRAY['Shoulders','Back'],
   ARRAY['Dumbbell'],
   'Hold a dumbbell in each hand at the sides. Shrug the shoulders straight up toward the ears, pause at the top, and lower under control. The dumbbell variation allows a natural arc of motion and greater depth of stretch at the bottom compared to a barbell shrug.',
   NULL),

  ('Dips/Dip Machine',
   ARRAY['Triceps','Chest','Shoulders'],
   ARRAY['Bodyweight','Machine'],
   'Either on parallel bars (bodyweight) or a dedicated dip machine. Lower until the elbows reach 90 degrees, then press back to full lockout. An upright torso emphasises the triceps; a forward lean emphasises the lower chest. One of the best compound pushing movements for upper-body mass.',
   NULL),

  -- ════════════════════════════════════════════════════════════════
  -- SMITH MACHINE
  -- ════════════════════════════════════════════════════════════════

  ('Smith Machine Incline Press',
   ARRAY['Chest','Triceps','Shoulders'],
   ARRAY['Barbell'],
   'Set a bench to 30–45 degrees inside a Smith machine. Unrack and lower the bar to the upper chest, then press back to lockout. The Smith machine''s fixed bar path removes the stabilisation demand, allowing focus on pure pressing strength and chest development.',
   NULL),

  ('Smith Machine RDL',
   ARRAY['Hamstrings','Glutes','Back'],
   ARRAY['Barbell'],
   'The Romanian deadlift performed in a Smith machine. Set the bar at hip height, hinge forward with a flat back, and lower the bar to mid-shin, feeling the hamstring stretch. Return by driving the hips forward. The fixed bar path of the Smith machine provides stability, making this a beginner-friendly RDL variant.',
   NULL),

  ('Smith Machine Upright Row',
   ARRAY['Shoulders','Back'],
   ARRAY['Barbell'],
   'Grip a Smith machine bar with a shoulder-width overhand grip. Pull the bar straight up the body to chin height, flaring the elbows outward and above the bar. The fixed path of the Smith machine provides a controlled movement, making it easier to isolate the lateral delts and upper back.',
   NULL),

  -- ════════════════════════════════════════════════════════════════
  -- LOWER BODY (REMAINING)
  -- ════════════════════════════════════════════════════════════════

  ('Walking Lunges',
   ARRAY['Quads','Glutes','Hamstrings'],
   ARRAY['Bodyweight'],
   'Step forward into a lunge, lower the rear knee toward the floor, then bring the rear foot forward to step into the next lunge — walking continuously across the floor. The walking pattern adds a balance and coordination challenge. Can be loaded with dumbbells, barbells, or a weight vest.',
   NULL)

) AS t(name, muscle_groups, equipment, description, youtube_url)
WHERE NOT EXISTS (
  SELECT 1 FROM exercises e WHERE e.name = t.name
);
