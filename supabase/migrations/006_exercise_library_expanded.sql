-- ─── Expanded Exercise Library ─────────────────────────────────────────────────
-- 200+ exercises covering every major muscle group and their variants.
-- Safe to re-run: skips any exercise whose name already exists.

INSERT INTO exercises (name, muscle_groups, equipment, description, youtube_url)
SELECT name, muscle_groups, equipment, description, youtube_url
FROM (VALUES

  -- ════════════════════════════════════════════════════════════════
  -- CHEST
  -- ════════════════════════════════════════════════════════════════

  ('Incline Barbell Bench Press', ARRAY['Chest','Triceps','Shoulders'], ARRAY['Barbell'],
   'Performed on a bench set to 30–45°. The incline shifts stress to the upper (clavicular) head of the pec. Unrack, lower to upper chest with control, then press back to lockout. Elbows track at roughly 45° to the torso.', NULL),

  ('Decline Barbell Bench Press', ARRAY['Chest','Triceps'], ARRAY['Barbell'],
   'Feet anchored on a decline bench. The downward angle emphasises the lower chest fibres. Lower the bar to the lower pec, then press back to lockout. Keep the shoulder blades retracted throughout.', NULL),

  ('Dumbbell Bench Press', ARRAY['Chest','Triceps','Shoulders'], ARRAY['Dumbbell'],
   'Lie flat on a bench with a dumbbell in each hand at chest level, palms facing forward. Press straight up to lockout, then lower with control. The independent dumbbells allow a natural arc and greater range of motion than a barbell.', NULL),

  ('Incline Dumbbell Press', ARRAY['Chest','Triceps','Shoulders'], ARRAY['Dumbbell'],
   'Set the bench to 30–45°. Press dumbbells from shoulder level upward and slightly inward to lockout. The incline emphasises the upper chest. Using dumbbells allows each side to work independently, correcting imbalances.', NULL),

  ('Decline Dumbbell Press', ARRAY['Chest','Triceps'], ARRAY['Dumbbell'],
   'On a decline bench with feet secured, press dumbbells from lower chest level. The decline targets the lower pectoral fibres. Keep core tight and lower slowly to maintain control on the decline angle.', NULL),

  ('Incline Dumbbell Fly', ARRAY['Chest'], ARRAY['Dumbbell'],
   'Lie on an incline bench. With a slight bend in the elbows, lower the dumbbells in a wide arc until a deep upper-chest stretch is felt, then squeeze them back together above the chest. Prioritise the stretch at the bottom.', NULL),

  ('Low-to-High Cable Fly', ARRAY['Chest'], ARRAY['Cable'],
   'Set pulleys to the lowest position. Pull the handles upward and inward in a wide arc until hands meet in front of the upper chest. This angle targets the upper pec fibres with constant cable tension.', NULL),

  ('High-to-Low Cable Fly', ARRAY['Chest'], ARRAY['Cable'],
   'Set pulleys to the highest position. Pull the handles downward and inward, crossing slightly, until hands meet in front of the lower chest. Targets the lower/sternal pec fibres. Keep a slight elbow bend throughout.', NULL),

  ('Pec Deck / Machine Fly', ARRAY['Chest'], ARRAY['Machine'],
   'Sit in a pec deck machine with elbows or forearms on the pads. Squeeze the pads together in front of the chest, pause at peak contraction, then return slowly. Isolates the chest without requiring shoulder stabilisation.', NULL),

  ('Machine Chest Press', ARRAY['Chest','Triceps'], ARRAY['Machine'],
   'Seated chest press on a plate-loaded or selectorised machine. Provides a guided path with less stabiliser demand. Great for beginners or as a high-rep burnout after free-weight pressing.', NULL),

  ('Machine Incline Chest Press', ARRAY['Chest','Triceps','Shoulders'], ARRAY['Machine'],
   'Similar to the standard machine press but angled to target the upper chest. The fixed path lets you focus on pressing without balancing the load.', NULL),

  ('Wide Push-Up', ARRAY['Chest','Triceps','Shoulders','Core'], ARRAY['Bodyweight'],
   'A push-up performed with hands placed wider than shoulder-width. The wider hand position increases chest involvement while reducing tricep loading compared to a standard push-up.', NULL),

  ('Incline Push-Up', ARRAY['Chest','Triceps','Shoulders'], ARRAY['Bodyweight'],
   'Hands elevated on a bench or box. The inclined angle shifts emphasis to the lower chest. Also a good regression for building toward standard push-ups.', NULL),

  ('Decline Push-Up', ARRAY['Chest','Triceps','Shoulders'], ARRAY['Bodyweight'],
   'Feet elevated on a bench or box, hands on the floor. The decline angle emphasises the upper chest, similar mechanically to an incline press.', NULL),

  ('Archer Push-Up', ARRAY['Chest','Triceps','Shoulders'], ARRAY['Bodyweight'],
   'A unilateral push-up variation where one arm presses while the other stays extended to the side for support. Builds the strength base for one-arm push-ups and addresses side-to-side imbalances.', NULL),

  ('Explosive Push-Up', ARRAY['Chest','Triceps','Shoulders'], ARRAY['Bodyweight'],
   'Press explosively so hands leave the floor at the top of each rep. Can progress to a clapping push-up. Develops rate-of-force development in the horizontal push pattern.', NULL),

  ('Svend Press', ARRAY['Chest'], ARRAY['Dumbbell'],
   'Hold two weight plates or a dumbbell between the palms and press them forward from the chest while actively squeezing them together. The constant adductor force keeps constant tension on the inner pec fibres.', NULL),

  ('Landmine Press (Chest)', ARRAY['Chest','Shoulders','Triceps'], ARRAY['Barbell'],
   'A landmine anchored in a corner. Press the sleeve of the barbell from chest height upward and forward. The arc path is shoulder-friendly and recruits both the upper chest and front delt.', NULL),

  ('Smith Machine Bench Press', ARRAY['Chest','Triceps'], ARRAY['Smith Machine'],
   'A guided version of the bench press. The fixed vertical bar path reduces stabiliser demand. Useful for training to failure safely without a spotter.', NULL),

  -- ════════════════════════════════════════════════════════════════
  -- BACK
  -- ════════════════════════════════════════════════════════════════

  ('Chin-Up', ARRAY['Back','Biceps'], ARRAY['Bodyweight'],
   'Hang from a bar with a supinated (underhand) grip slightly narrower than shoulder-width. Pull the chest to the bar, driving the elbows down and back. The supinated grip adds more bicep involvement than a standard pull-up.', NULL),

  ('Neutral-Grip Pull-Up', ARRAY['Back','Biceps'], ARRAY['Bodyweight'],
   'Hang from parallel handles with palms facing each other. The neutral grip is often more comfortable for the shoulder and wrists while still training the lats heavily.', NULL),

  ('Wide-Grip Pull-Up', ARRAY['Back','Biceps'], ARRAY['Bodyweight'],
   'Pull-up with hands placed wider than shoulder-width (pronated). The wider grip reduces bicep contribution and places more emphasis on lat width. Pull until the chin clears the bar.', NULL),

  ('Weighted Pull-Up', ARRAY['Back','Biceps'], ARRAY['Bodyweight'],
   'Standard pull-up performed with added load via a weight belt, vest, or dumbbell between the thighs. The primary method for progressive overload once bodyweight reps become easy.', NULL),

  ('Lat Pulldown (Reverse Grip)', ARRAY['Back','Biceps'], ARRAY['Cable','Machine'],
   'Performed with a supinated (underhand) grip on the pulldown bar. The reverse grip increases bicep involvement and often allows a stronger lat contraction for some lifters compared to a pronated grip.', NULL),

  ('Lat Pulldown (Close/Neutral Grip)', ARRAY['Back','Biceps'], ARRAY['Cable','Machine'],
   'Using a close-grip triangle or neutral bar attachment. Allows a slightly longer range of motion at the top and a different angle of pull on the lats compared to a wide overhand grip.', NULL),

  ('Single-Arm Lat Pulldown', ARRAY['Back','Biceps'], ARRAY['Cable'],
   'One arm at a time using a handle on a lat pulldown machine or high cable pulley. Allows full scapular rotation and addresses side-to-side lat imbalances. Can initiate each rep with a slight lean for a better stretch.', NULL),

  ('Barbell Row (Underhand / Yates Row)', ARRAY['Back','Biceps'], ARRAY['Barbell'],
   'A bent-over barbell row using a supinated grip. Popularised by Dorian Yates. The underhand grip allows a more upright torso angle and shifts emphasis to the lower lats and biceps.', NULL),

  ('Pendlay Row', ARRAY['Back','Biceps','Core'], ARRAY['Barbell'],
   'A strict barbell row where the bar is set on the floor between each rep. The lifter takes a horizontal torso position and pulls explosively to the lower chest. The full reset eliminates momentum and demands maximal force on every rep.', NULL),

  ('Chest-Supported Dumbbell Row', ARRAY['Back','Biceps'], ARRAY['Dumbbell'],
   'Lie prone on an incline bench. Row dumbbells from a dead hang up to hip level. The chest support eliminates lower-back involvement so the back can be fully isolated without compensating.', NULL),

  ('Seated Cable Row (Wide Grip)', ARRAY['Back','Biceps'], ARRAY['Cable'],
   'Using a wide overhand bar on a cable row station. The wide grip shifts emphasis to the upper back and rear deltoids, with less lower-lat emphasis than a close-grip row.', NULL),

  ('Single-Arm Cable Row', ARRAY['Back','Biceps'], ARRAY['Cable'],
   'One arm at a time on a cable machine. Allows full range of motion including shoulder protraction on the stretch and full retraction at the peak. Useful for correcting left-right imbalances.', NULL),

  ('T-Bar Row', ARRAY['Back','Biceps'], ARRAY['Barbell'],
   'A landmine or T-bar machine row. The neutral handle position is natural for the shoulder. Load plates on one end and row to the lower chest. Allows heavy loading of the mid-back and rhomboids.', NULL),

  ('Meadows Row', ARRAY['Back','Biceps'], ARRAY['Barbell'],
   'A single-arm landmine row named after John Meadows. Stand perpendicular to the loaded end of the barbell, grip the sleeve, and row toward the hip. The unique angle and grip create a powerful lat and teres major contraction.', NULL),

  ('Machine Row', ARRAY['Back','Biceps'], ARRAY['Machine'],
   'A selectorised or plate-loaded rowing machine. Provides a guided pull that removes spinal load. Good for beginners or as a finisher when the lower back is fatigued from heavier free-weight work.', NULL),

  ('Straight-Arm Pulldown', ARRAY['Back'], ARRAY['Cable'],
   'Stand facing a high cable with a bar or rope. Keep the arms nearly straight and pull the attachment from overhead down to the thighs by driving the elbows toward the hips. Isolates the lats without bicep involvement.', NULL),

  ('Dumbbell Pull-Over', ARRAY['Back','Chest'], ARRAY['Dumbbell'],
   'Lie perpendicular on a bench, upper back supported. Hold one dumbbell with both hands overhead and lower it in an arc behind the head until a deep lat stretch is felt, then pull back over the chest. Trains lats through a long range of motion.', NULL),

  ('Cable Pull-Over', ARRAY['Back'], ARRAY['Cable'],
   'A cable version of the dumbbell pull-over. Kneel or stand facing away from a high pulley and arc the rope attachment downward to the thighs. Cables maintain tension throughout the full range.', NULL),

  ('Inverted Row', ARRAY['Back','Biceps','Core'], ARRAY['Bodyweight'],
   'Lie under a bar set at waist height (in a rack or on a Smith machine). Grip the bar and pull the chest up to it while keeping the body rigid. A great bodyweight horizontal pull for those working up to loaded rows.', NULL),

  ('Seal Row', ARRAY['Back','Biceps'], ARRAY['Barbell'],
   'Lie prone on a high bench and row a barbell hanging below. The chest-supported, face-down position fully eliminates lower-back involvement and momentum, producing an extremely strict mid-back contraction.', NULL),

  ('Trap Bar Deadlift', ARRAY['Back','Hamstrings','Glutes','Quads','Core'], ARRAY['Barbell'],
   'Using a hexagonal/trap bar, stand inside the frame and deadlift. The neutral handles and centred load reduce shear on the spine compared to a conventional deadlift and allow a more quad-dominant pulling pattern.', NULL),

  -- ════════════════════════════════════════════════════════════════
  -- SHOULDERS
  -- ════════════════════════════════════════════════════════════════

  ('Barbell Overhead Press (Seated)', ARRAY['Shoulders','Triceps'], ARRAY['Barbell'],
   'Seated version of the OHP removes the need for core bracing against a swaying torso, allowing focus purely on shoulder and tricep pressing strength. Press from the front rack to full lockout overhead.', NULL),

  ('Push Press', ARRAY['Shoulders','Triceps','Quads'], ARRAY['Barbell'],
   'A dip-and-drive version of the OHP. Bend the knees slightly then explode upward, using leg momentum to initiate the press. Allows heavier loads overhead than a strict press. Finishes the same way — bar overhead at lockout.', NULL),

  ('Dumbbell Shoulder Press (Seated)', ARRAY['Shoulders','Triceps'], ARRAY['Dumbbell'],
   'Seated on a bench with back support or upright. Press both dumbbells from ear level to lockout overhead. The seated position prevents leg drive, isolating the delts and triceps.', NULL),

  ('Dumbbell Shoulder Press (Standing)', ARRAY['Shoulders','Triceps','Core'], ARRAY['Dumbbell'],
   'Standing dumbbell press challenges core stability significantly more than the seated version. Brace the entire midsection, press both dumbbells to lockout, and lower under control.', NULL),

  ('Machine Shoulder Press', ARRAY['Shoulders','Triceps'], ARRAY['Machine'],
   'Guided overhead press on a plate-loaded or selectorised machine. Removes the need to stabilise the load, allowing heavier focus on pressing strength and hypertrophy. Ideal as a supplement to free-weight pressing.', NULL),

  ('Landmine Press (Shoulder)', ARRAY['Shoulders','Triceps'], ARRAY['Barbell'],
   'Press the sleeve of a landmine-anchored barbell from shoulder height to lockout in an angled arc. The arc is shoulder-friendly, making it an excellent alternative for those with shoulder pain during vertical pressing.', NULL),

  ('Machine Lateral Raise', ARRAY['Shoulders'], ARRAY['Machine'],
   'A selectorised machine that mimics the lateral raise. The guided path and constant cable tension isolate the lateral deltoid effectively. Excellent for dropsets.', NULL),

  ('Leaning Lateral Raise', ARRAY['Shoulders'], ARRAY['Dumbbell'],
   'Lean away from a fixed anchor (rack, cable, etc.) while holding a dumbbell with the working arm. The lean lengthens the abduction range at the bottom, improving the stretch on the lateral delt.', NULL),

  ('Front Raise (Barbell)', ARRAY['Shoulders'], ARRAY['Barbell'],
   'Hold a barbell with an overhand grip at hip level and raise it forward to shoulder height. More loading potential than dumbbells, but less individual shoulder control. Targets the anterior deltoid.', NULL),

  ('Front Raise (Plate)', ARRAY['Shoulders'], ARRAY['Bodyweight'],
   'Hold a weight plate with both hands and raise it forward to shoulder height. The pinch grip and wide plate also engage the forearms and create a slightly different stimulus than dumbbell or barbell front raises.', NULL),

  ('Rear Delt Fly (Incline Bench)', ARRAY['Shoulders','Back'], ARRAY['Dumbbell'],
   'Lie face-down on a low incline bench (~15–30°). With a slight elbow bend, raise dumbbells out to the sides in a reverse fly. The incline adds stability and allows focus solely on the rear delt and mid-back.', NULL),

  ('Reverse Pec Deck', ARRAY['Shoulders','Back'], ARRAY['Machine'],
   'Sit facing into the pec deck machine with the arms in front. Pull the handles backward in a wide arc to target the rear deltoids and rhomboids. A rear-delt isolation exercise with consistent resistance through the range.', NULL),

  ('Cable Rear Delt Fly', ARRAY['Shoulders','Back'], ARRAY['Cable'],
   'Using two low cables crossed in front, pull the handles out and back in a wide arc. The cable provides continuous tension through the full range of motion, including the critical peak contraction at the end position.', NULL),

  ('Upright Row (Barbell)', ARRAY['Shoulders','Biceps'], ARRAY['Barbell'],
   'Hold a barbell with a slightly-narrower-than-shoulder-width overhand grip. Pull it straight up the body to chin height, flaring the elbows above the bar. Targets the lateral delt and upper traps. Use wide grip to reduce impingement risk.', NULL),

  ('Upright Row (Dumbbell)', ARRAY['Shoulders','Biceps'], ARRAY['Dumbbell'],
   'A dumbbell upright row allows the hands to travel in a natural path rather than the fixed barbell path. Slightly easier on the wrists and shoulders. Each arm moves independently.', NULL),

  ('Upright Row (Cable)', ARRAY['Shoulders','Biceps'], ARRAY['Cable'],
   'Performed at a low cable pulley. Cable maintains tension at the bottom of the movement (unlike barbell/dumbbell variations) and provides smoother resistance throughout the pull.', NULL),

  ('Barbell Shrug', ARRAY['Shoulders','Back'], ARRAY['Barbell'],
   'Hold a barbell at hip level with an overhand or mixed grip. Elevate the shoulders as high as possible (shrug), hold briefly at the top, then lower fully. Targets the upper trapezius. Avoid rolling the shoulders.', NULL),

  ('Dumbbell Shrug', ARRAY['Shoulders','Back'], ARRAY['Dumbbell'],
   'Same motion as the barbell shrug with dumbbells held at the sides. The neutral hand position can be more natural. Allows each trap to work independently.', NULL),

  ('Trap Bar Shrug', ARRAY['Shoulders','Back'], ARRAY['Barbell'],
   'Stand inside a trap/hex bar and shrug. The neutral grip and centred load are very comfortable. Allows very heavy loading of the upper traps with minimal wrist/forearm involvement.', NULL),

  -- ════════════════════════════════════════════════════════════════
  -- BICEPS
  -- ════════════════════════════════════════════════════════════════

  ('EZ-Bar Curl', ARRAY['Biceps'], ARRAY['Barbell'],
   'Curl an EZ-bar from hip level to shoulder height. The angled grip reduces wrist and elbow stress compared to a straight barbell while still training the biceps and brachialis heavily.', NULL),

  ('Wide-Grip Barbell Curl', ARRAY['Biceps'], ARRAY['Barbell'],
   'A barbell curl with hands wider than shoulder-width. The wider grip shifts emphasis slightly toward the short (inner) head of the bicep, creating a different peak contraction than a standard-width curl.', NULL),

  ('Dumbbell Curl (Simultaneous)', ARRAY['Biceps'], ARRAY['Dumbbell'],
   'Both arms curl together rather than alternating. Allows full focus on each rep and keeps time under tension consistent, but demands more strength than alternating since both arms work at once.', NULL),

  ('Seated Dumbbell Curl', ARRAY['Biceps'], ARRAY['Dumbbell'],
   'Performing the dumbbell curl seated on a bench prevents hip or knee drive from assisting the movement, ensuring the biceps do the work. Lower the weight fully between each rep.', NULL),

  ('Cable Curl (EZ-Bar)', ARRAY['Biceps'], ARRAY['Cable'],
   'EZ-bar attachment on a low cable pulley. Provides constant tension through the full range — unlike free weights, cable tension does not decrease at the top of the curl.', NULL),

  ('Cable Curl (Single-Arm)', ARRAY['Biceps'], ARRAY['Cable'],
   'One handle on a low cable pulley. Allows a full supination of the wrist throughout the curl. Can be performed with elbow braced on the inner knee for a preacher-like isolation.', NULL),

  ('Concentration Curl', ARRAY['Biceps'], ARRAY['Dumbbell'],
   'Sit with elbow braced on the inner thigh. Curl the dumbbell from full extension to peak contraction. Eliminates all swinging and isolates the bicep, often producing a strong peak contraction for the short head.', NULL),

  ('Spider Curl', ARRAY['Biceps'], ARRAY['Dumbbell'],
   'Lie face-down on a high incline bench (or on the vertical side of a preacher bench). Arms hang freely. Curl the dumbbells from full extension to shoulder level. The angle keeps constant tension at the bottom and improves the lower bicep sweep.', NULL),

  ('Bayesian Curl', ARRAY['Biceps'], ARRAY['Cable'],
   'Stand facing away from a low cable pulley, grip the handle, and step forward with shoulder extended behind the body. Curl from this behind-the-hip position. This pre-stretches the long head of the bicep, maximising its stimulus.', NULL),

  ('Drag Curl', ARRAY['Biceps'], ARRAY['Barbell'],
   'A barbell or dumbbell curl where, instead of arcing the bar forward, you drag it straight up the body by leading with the elbows behind the torso. Shifts more tension to the long head and the brachialis.', NULL),

  ('Reverse Curl (Barbell)', ARRAY['Biceps'], ARRAY['Barbell'],
   'Curl a barbell with a pronated (overhand) grip. Trains the brachioradialis and brachialis heavily while the bicep is in a mechanically disadvantaged position. Builds overall arm thickness and forearm development.', NULL),

  ('Reverse Curl (Dumbbell)', ARRAY['Biceps'], ARRAY['Dumbbell'],
   'The dumbbell version of the reverse curl. The independent dumbbells allow a neutral to slightly pronated grip. Strong brachioradialis and brachialis builder.', NULL),

  ('Reverse EZ-Bar Curl', ARRAY['Biceps'], ARRAY['Barbell'],
   'Reverse curl performed on an EZ-bar. The angled grip is easier on the wrists than a straight barbell, making this the most joint-friendly way to load the overhand curl pattern heavily.', NULL),

  -- ════════════════════════════════════════════════════════════════
  -- TRICEPS
  -- ════════════════════════════════════════════════════════════════

  ('Tricep Pushdown (Straight Bar)', ARRAY['Triceps'], ARRAY['Cable'],
   'Using a straight bar on a high cable pulley, push down to full elbow extension. The straight bar puts the wrists in pronation, which some find increases the contraction in the lateral head of the tricep.', NULL),

  ('Tricep Pushdown (V-Bar)', ARRAY['Triceps'], ARRAY['Cable'],
   'A V-shaped bar angled slightly inward. A middle ground between the straight bar and rope that many find comfortable and effective for targeting all three tricep heads.', NULL),

  ('Reverse-Grip Pushdown', ARRAY['Triceps'], ARRAY['Cable'],
   'A cable pushdown with a supinated (underhand) grip on a straight bar. The reverse grip tends to bias the long head of the tricep. Keep elbows pinned at the sides throughout.', NULL),

  ('Skull Crusher (EZ-Bar)', ARRAY['Triceps'], ARRAY['Barbell'],
   'The EZ-bar version of the skull crusher. The angled grip reduces wrist and elbow strain. Lower the bar toward the forehead or just behind the head to maximise long-head stretch, then extend back to lockout.', NULL),

  ('Skull Crusher (Dumbbell)', ARRAY['Triceps'], ARRAY['Dumbbell'],
   'Dumbbells allow each arm to move independently and can travel slightly outside the head, enabling a more natural arc. Lie on a bench and hinge only at the elbows to lower dumbbells toward the ears.', NULL),

  ('Overhead Tricep Extension (Single-Arm)', ARRAY['Triceps'], ARRAY['Dumbbell'],
   'Hold one dumbbell overhead with one hand. Lower it behind the head by bending the elbow, then extend back up. The single-arm variation allows a greater stretch of the long head compared to both-hand versions.', NULL),

  ('Overhead Tricep Extension (Cable/Rope)', ARRAY['Triceps'], ARRAY['Cable'],
   'Stand facing away from a high cable with a rope overhead. Lean forward slightly and extend the elbows from a fully flexed position behind the head. Cable provides consistent tension throughout the extension.', NULL),

  ('Overhead Tricep Extension (EZ-Bar)', ARRAY['Triceps'], ARRAY['Barbell'],
   'Seated or standing, hold an EZ-bar overhead with a narrow grip. Lower behind the head by hinging at the elbows, then extend to lockout. Allows heavier loading than dumbbell overhead extensions.', NULL),

  ('JM Press', ARRAY['Triceps','Chest'], ARRAY['Barbell'],
   'A hybrid between a skull crusher and a close-grip bench press, developed by powerlifter JM Blakely. Lower the bar toward the neck/chin in an arc while bending the elbows slightly outward, then press back up. Heavily loads the medial and lateral tricep heads.', NULL),

  ('Machine Dip', ARRAY['Triceps','Chest'], ARRAY['Machine'],
   'A dip performed on a machine with weight stacks or plates. Provides the benefits of dip mechanics without requiring the shoulder stability of parallel bar dips. Easier to load for high reps.', NULL),

  ('Cable Tricep Kickback', ARRAY['Triceps'], ARRAY['Cable'],
   'Hinge forward at the hip with the upper arm parallel to the floor. Extend the elbow using a single-arm cable attachment. Cables maintain tension at the fully extended position where a dumbbell kickback typically loses tension.', NULL),

  ('Tate Press', ARRAY['Triceps'], ARRAY['Dumbbell'],
   'Lie on a flat bench holding dumbbells over the chest, elbows flared. Lower the dumbbells outward by bending the elbows so they descend toward the chest, then press back up. Isolates the lateral and medial tricep heads.', NULL),

  ('Lying Tricep Extension (Dumbbell)', ARRAY['Triceps'], ARRAY['Dumbbell'],
   'Lie on a flat bench. Arms extended overhead, lower dumbbells to either side of the head by hinging at the elbows. Extend back to lockout. Similar to skull crushers but with a slightly different arc.', NULL),

  -- ════════════════════════════════════════════════════════════════
  -- FOREARMS / GRIP
  -- ════════════════════════════════════════════════════════════════

  ('Barbell Wrist Curl', ARRAY['Forearms'], ARRAY['Barbell'],
   'Sit with forearms resting on the thighs, bar in the fingertips. Curl the wrists upward to full flexion. Works the flexor digitorum and flexor carpi muscles of the forearm.', NULL),

  ('Dumbbell Wrist Curl', ARRAY['Forearms'], ARRAY['Dumbbell'],
   'Same motion as barbell wrist curl but with dumbbells. Allows each wrist to curl independently. Performed palms-up to target the flexors.', NULL),

  ('Reverse Wrist Curl', ARRAY['Forearms'], ARRAY['Barbell'],
   'Palms-down variation of the wrist curl. Targets the extensor muscles on the top of the forearm. Balance this with wrist curls to develop the full forearm and prevent overuse injuries.', NULL),

  ('Farmer''s Carry', ARRAY['Forearms','Shoulders','Core'], ARRAY['Dumbbell'],
   'Pick up heavy dumbbells, trap bar, or farmer carry handles and walk a set distance. A loaded carry that builds crushing grip strength, forearm hypertrophy, core stability, and cardiovascular conditioning simultaneously.', NULL),

  ('Plate Pinch', ARRAY['Forearms'], ARRAY['Dumbbell'],
   'Pinch two smooth weight plates together between the fingers and thumb. Hold for time. Directly trains thumb adductors and finger flexors — the muscles that govern pinch grip strength.', NULL),

  ('Dead Hang', ARRAY['Forearms','Back'], ARRAY['Bodyweight'],
   'Hang from a pull-up bar with a full dead hang for time. Builds open-hand and closed-hand grip endurance, shoulder decompression, and lat lengthening. Progress by adding weight via a vest or belt.', NULL),

  ('Wrist Roller', ARRAY['Forearms'], ARRAY['Bodyweight'],
   'A cylinder with a weight hanging from a rope. Roll the rope up by alternating wrist flexion and extension until fully wound, then reverse. Brutally effective for forearm endurance and strength in both extensors and flexors.', NULL),

  -- ════════════════════════════════════════════════════════════════
  -- QUADS
  -- ════════════════════════════════════════════════════════════════

  ('Goblet Squat', ARRAY['Quads','Glutes','Core'], ARRAY['Dumbbell'],
   'Hold a dumbbell or kettlebell vertically at the chest. Squat to depth while keeping the torso upright. An excellent teaching tool for squat mechanics and a great warm-up or accessory exercise.', NULL),

  ('Barbell Hack Squat', ARRAY['Quads','Glutes'], ARRAY['Barbell'],
   'The barbell is positioned behind the heels on the floor. Grip it, then stand by extending the hips and knees. Named after George Hackenschmidt. Places unique tension on the quads and is more demanding on the grip than machine variations.', NULL),

  ('Single-Leg Leg Press', ARRAY['Quads','Glutes','Hamstrings'], ARRAY['Machine'],
   'Performed on the leg press machine using one leg at a time. Addresses left-right imbalances and increases demand per leg without requiring additional weight.', NULL),

  ('Leg Extension (Single-Leg)', ARRAY['Quads'], ARRAY['Machine'],
   'Single-leg version on the extension machine. Ensures each quad is working equally and is useful for identifying and correcting imbalances between legs.', NULL),

  ('Walking Lunge (Bodyweight)', ARRAY['Quads','Glutes','Hamstrings'], ARRAY['Bodyweight'],
   'Take a large step forward, lower the back knee toward the floor, then rise and step the back foot forward to begin the next rep. Continuous forward motion adds a balance and coordination challenge.', NULL),

  ('Walking Lunge (Dumbbell)', ARRAY['Quads','Glutes','Hamstrings'], ARRAY['Dumbbell'],
   'Walking lunges with dumbbells held at the sides. Loading increases quad and glute demand while also training grip and shoulder stability. A staple hypertrophy movement for the lower body.', NULL),

  ('Barbell Lunge', ARRAY['Quads','Glutes','Hamstrings','Core'], ARRAY['Barbell'],
   'A barbell on the back during lunges significantly increases the core stability demand alongside the leg work. Can be performed as walking lunges or as stationary split squats.', NULL),

  ('Reverse Lunge', ARRAY['Quads','Glutes','Hamstrings'], ARRAY['Bodyweight'],
   'Step backward instead of forward. The reverse direction reduces knee shear and is often better tolerated by those with anterior knee pain. The quad still does significant work to lower and rise.', NULL),

  ('Step-Up', ARRAY['Quads','Glutes'], ARRAY['Dumbbell'],
   'Step up onto a box or bench with a dumbbell in each hand. Drive through the heel of the working leg to fully extend the hip and knee. Lower under control. A unilateral movement that builds quad and glute strength.', NULL),

  ('Sissy Squat', ARRAY['Quads'], ARRAY['Bodyweight'],
   'A radical quad isolation exercise. Hold a fixed object for balance, lean back, and lower the body by bending only at the knees. The shin will become nearly horizontal. Only attempt after building significant quad strength.', NULL),

  ('Wall Sit', ARRAY['Quads','Glutes'], ARRAY['Bodyweight'],
   'Slide down a wall until thighs are parallel to the floor and hold for time. An isometric exercise that builds quad endurance and is easily loadable by holding a plate on the thighs.', NULL),

  ('Terminal Knee Extension (TKE)', ARRAY['Quads'], ARRAY['Resistance Band'],
   'Attach a band at knee height behind the working leg. Step into it and fully extend the knee against the band resistance. Targets the terminal range of knee extension — important for VMO activation and prehab.', NULL),

  ('Landmine Squat', ARRAY['Quads','Glutes','Core'], ARRAY['Barbell'],
   'Hold the sleeve of a landmine barbell at chest level and squat. The angled bar guides the torso into an upright position, making this very knee-friendly and great for those who struggle with depth on free squats.', NULL),

  ('Hack Squat (Machine)', ARRAY['Quads','Glutes'], ARRAY['Machine'],
   'Performed on a 45-degree hack squat machine. Load plates on the machine, shoulders under the pads, and squat. Provides a free path within a fixed plane — less spinal loading than a barbell squat while enabling heavy quad work.', NULL),

  -- ════════════════════════════════════════════════════════════════
  -- HAMSTRINGS
  -- ════════════════════════════════════════════════════════════════

  ('Romanian Deadlift (Dumbbell)', ARRAY['Hamstrings','Glutes'], ARRAY['Dumbbell'],
   'The dumbbell version of the RDL. Dumbbells can travel along the front of the thighs freely, allowing an unencumbered range of motion. Great for those who lack the equipment for barbell RDLs.', NULL),

  ('Single-Leg Romanian Deadlift', ARRAY['Hamstrings','Glutes','Core'], ARRAY['Dumbbell'],
   'A unilateral RDL performed on one leg. The hip hinge and single-leg stance simultaneously develop hamstring strength, hip stability, and balance. Lean forward while extending the free leg back.', NULL),

  ('Stiff-Leg Deadlift', ARRAY['Hamstrings','Glutes','Back'], ARRAY['Barbell'],
   'Similar to the RDL but with a more upright posture and less knee bend. The bar often starts from the floor rather than a hip hinge. Demands strong hamstring and lower-back engagement through a large range of motion.', NULL),

  ('Lying Leg Curl', ARRAY['Hamstrings'], ARRAY['Machine'],
   'Face-down on a lying leg curl machine. Curl the padded lever toward the glutes, pausing at peak contraction, then lower fully. The hip-extended position trains the hamstrings through their function as a knee flexor.', NULL),

  ('Standing Leg Curl', ARRAY['Hamstrings'], ARRAY['Machine'],
   'A unilateral leg curl performed standing. Works each leg independently. The standing position creates a slightly different line of pull on the hamstring compared to prone and seated variations.', NULL),

  ('Glute-Ham Raise (GHR)', ARRAY['Hamstrings','Glutes','Core'], ARRAY['Machine'],
   'Performed on a GHR machine with feet anchored. Lower the body using hamstring eccentric strength, then curl back up using concentric hamstring strength. One of the most complete hamstring exercises available.', NULL),

  ('Sliding Leg Curl', ARRAY['Hamstrings','Glutes'], ARRAY['Bodyweight'],
   'Lie on your back with heels on sliders or a towel. Bridge the hips up, then slide the heels toward the glutes using hamstring strength. A bodyweight but very challenging hamstring-isolation movement.', NULL),

  -- ════════════════════════════════════════════════════════════════
  -- GLUTES
  -- ════════════════════════════════════════════════════════════════

  ('Single-Leg Hip Thrust', ARRAY['Glutes','Hamstrings'], ARRAY['Barbell'],
   'Same setup as the hip thrust but performed one leg at a time. Places double the load on the working glute. Excellent for addressing side-to-side imbalances and increasing glute activation per leg.', NULL),

  ('Dumbbell Hip Thrust', ARRAY['Glutes','Hamstrings'], ARRAY['Dumbbell'],
   'Uses a dumbbell held on the hip instead of a barbell. More practical for home gym or lighter loading. The movement and stimulus is identical to the barbell version.', NULL),

  ('Weighted Glute Bridge', ARRAY['Glutes','Hamstrings'], ARRAY['Dumbbell'],
   'A flat-floor glute bridge with a dumbbell or plate resting on the hip crease. Greater range of motion than the hip thrust because the shoulder stays on the floor, but generally loaded lighter.', NULL),

  ('Single-Leg Glute Bridge', ARRAY['Glutes','Hamstrings'], ARRAY['Bodyweight'],
   'Lie on back, one knee bent, the other leg extended. Drive through the heel of the bent leg to bridge the hips up. A bodyweight but very effective unilateral glute exercise. Can progress by adding load on the working hip.', NULL),

  ('Donkey Kick (Bodyweight)', ARRAY['Glutes'], ARRAY['Bodyweight'],
   'On all fours, kick one leg backward and upward, squeezing the glute at the top. Keep the core braced to prevent lumbar extension. A low-load glute activation movement useful in warm-ups or as a finisher.', NULL),

  ('Standing Hip Abduction (Cable)', ARRAY['Glutes'], ARRAY['Cable'],
   'Attach an ankle cuff to a low cable. Stand side-on to the machine and sweep the working leg out to the side against cable resistance. Targets the gluteus medius and minimus — the hip abductors essential for lateral stability.', NULL),

  ('Lateral Band Walk', ARRAY['Glutes','Quads'], ARRAY['Resistance Band'],
   'Place a resistance band around the ankles or just above the knees. Assume a partial squat position and take lateral steps. Activates the gluteus medius and minimus under constant band tension. Common as a warm-up or prehab movement.', NULL),

  ('Clamshell (Banded)', ARRAY['Glutes'], ARRAY['Resistance Band'],
   'Lie on your side with knees stacked and a band around the thighs just above the knees. Keeping the feet together, raise the top knee as high as possible without rotating the pelvis. Isolates the gluteus medius.', NULL),

  ('Frog Pump', ARRAY['Glutes'], ARRAY['Bodyweight'],
   'Lie on the back, soles of the feet together, knees flared outward (like a frog). Bridge the hips up repeatedly. The frog position externally rotates the hips, increasing glute activation compared to a standard bridge.', NULL),

  ('Reverse Hyperextension', ARRAY['Glutes','Hamstrings','Back'], ARRAY['Machine'],
   'Lie face-down on a reverse hyper machine or GHR. Swing the legs upward, extending the hips against resistance. Decompresses the lumbar spine while training the glutes, hamstrings, and spinal erectors.', NULL),

  ('45-Degree Hyperextension', ARRAY['Glutes','Hamstrings','Back'], ARRAY['Machine'],
   'Secure the ankles in a hyperextension bench angled at 45°. Lower the torso toward the floor by hinging at the hip, then drive back up. Targets the posterior chain. Can be loaded by holding a plate on the chest.', NULL),

  -- ════════════════════════════════════════════════════════════════
  -- CALVES
  -- ════════════════════════════════════════════════════════════════

  ('Standing Calf Raise (Barbell)', ARRAY['Calves'], ARRAY['Barbell'],
   'Place a barbell on the back in squat position with feet on a raised plate. Rise onto the toes to full extension, hold briefly, then lower the heels as far as possible for a full stretch. Heavy loading possible.', NULL),

  ('Dumbbell Calf Raise', ARRAY['Calves'], ARRAY['Dumbbell'],
   'Stand on a step with one foot while holding a dumbbell in the same-side hand. Rise to the toes and lower for a full stretch. The single-leg variation doubles the load per calf without requiring additional equipment.', NULL),

  ('Single-Leg Calf Raise (Bodyweight)', ARRAY['Calves'], ARRAY['Bodyweight'],
   'Stand on one foot on the edge of a step. Rise to the toes and lower until the heel is well below platform level. The highest intensity bodyweight calf exercise. Progress with slow eccentrics or weighted vest.', NULL),

  ('Leg Press Calf Raise', ARRAY['Calves'], ARRAY['Machine'],
   'With legs extended on a leg press machine, position the balls of the feet on the bottom edge of the platform. Perform calf raises using the platform as resistance. Seated leg position loads the soleus more than the gastrocnemius.', NULL),

  ('Tibialis Raise', ARRAY['Calves'], ARRAY['Bodyweight'],
   'Stand with heels on the floor, back against a wall. Dorsiflex the foot — pulling the toes toward the shins — as far as possible, then lower. Trains the tibialis anterior, the opposing muscle to the calves. Helps prevent shin splints.', NULL),

  -- ════════════════════════════════════════════════════════════════
  -- CORE
  -- ════════════════════════════════════════════════════════════════

  ('Side Plank', ARRAY['Core'], ARRAY['Bodyweight'],
   'Support the body on one forearm and the sides of the feet, creating a straight line from head to feet. Primarily targets the lateral core (obliques and quadratus lumborum). Hold for time or add hip dips for a dynamic variation.', NULL),

  ('RKC Plank', ARRAY['Core'], ARRAY['Bodyweight'],
   'A maximal-tension plank used in the Russian Kettlebell Challenge system. From a normal plank, simultaneously try to drag the elbows toward the toes and the toes toward the elbows, fist squeeze, glutes squeezed, everything braced. Creates far more core demand than a passive plank.', NULL),

  ('Copenhagen Plank', ARRAY['Core','Adductors'], ARRAY['Bodyweight'],
   'A side plank with the top foot elevated on a bench. The adductor of the top leg is loaded to keep the hip elevated. One of the most effective exercises for hip adductor strength and groin injury prevention.', NULL),

  ('Dead Bug', ARRAY['Core'], ARRAY['Bodyweight'],
   'Lie on the back with arms extended toward the ceiling and knees at 90°. Lower the opposite arm and leg simultaneously toward the floor while pressing the lower back flat. Trains deep core stability and anti-extension under controlled movement.', NULL),

  ('Bird Dog', ARRAY['Core','Back'], ARRAY['Bodyweight'],
   'From a quadruped position, extend the opposite arm and leg simultaneously while keeping the spine neutral. Trains anti-rotation and lumbar stability. A staple in rehabilitation and injury prevention protocols.', NULL),

  ('Machine Crunch', ARRAY['Core'], ARRAY['Machine'],
   'Seated or kneeling crunch machine. Provides consistent resistance throughout the crunch range. Easier to load progressively for hypertrophy than bodyweight crunches.', NULL),

  ('Hanging Leg Raise (Bent Knee)', ARRAY['Core'], ARRAY['Bodyweight'],
   'Hang from a bar and raise bent knees to 90° (or above). The bent-knee version reduces the lever arm and hip flexor demand compared to straight-leg raises, allowing focus on the lower abs.', NULL),

  ('Dragon Flag', ARRAY['Core'], ARRAY['Bodyweight'],
   'Grip a bench behind the head and lower the entire rigid body from vertical to near-horizontal using only the core. Popularised by Bruce Lee. An extremely advanced anti-extension exercise that demands full-body tension.', NULL),

  ('L-Sit', ARRAY['Core','Triceps','Quads'], ARRAY['Bodyweight'],
   'Support the body on parallel bars or the floor with arms extended, and hold the legs straight and parallel to the ground. A full-body strength hold that demands serious hip flexor and tricep strength alongside core stability.', NULL),

  ('Russian Twist (Weighted)', ARRAY['Core'], ARRAY['Dumbbell'],
   'Seated with feet elevated and spine slightly reclined, hold a dumbbell or plate and rotate the torso side to side, bringing the weight toward the floor on each side. Loading the twist significantly increases oblique demand.', NULL),

  ('Crunch', ARRAY['Core'], ARRAY['Bodyweight'],
   'Lie on the back with knees bent. Raise the shoulders toward the knees by flexing the spine rather than performing a full sit-up. Contracts the rectus abdominis through a short but intense range. Keep the lower back in contact with the floor.', NULL),

  ('Bicycle Crunch', ARRAY['Core'], ARRAY['Bodyweight'],
   'Alternate rotating each elbow toward the opposite knee while extending the other leg. Combines spinal flexion with rotation, hitting both the rectus abdominis and the obliques. One of the most EMG-effective ab exercises.', NULL),

  ('V-Up', ARRAY['Core'], ARRAY['Bodyweight'],
   'Lie flat, then simultaneously raise the legs and the torso, reaching the hands toward the feet at the top. Requires strong hip flexors alongside the abs. More intense than a standard crunch.', NULL),

  ('Hollow Body Hold', ARRAY['Core'], ARRAY['Bodyweight'],
   'Lie flat, press the lower back into the floor, and lift the legs, arms, and shoulders slightly off the ground. Hold this position for time. The foundation of gymnastics pressing and pulling movements — trains full anterior-chain tension.', NULL),

  ('Pallof Press', ARRAY['Core'], ARRAY['Cable'],
   'Stand perpendicular to a cable machine with the handle held at chest. Press the handle directly forward to full extension, then return. The obliques and deep core resist the rotational pull of the cable. An essential anti-rotation exercise.', NULL),

  ('Landmine Rotation', ARRAY['Core'], ARRAY['Barbell'],
   'Hold the sleeve of a landmine barbell with both hands and rotate it in an arc from one hip to the opposite shoulder. Trains the obliques, hip rotators, and thoracic spine through a power-type movement pattern.', NULL),

  ('Suitcase Carry', ARRAY['Core','Forearms'], ARRAY['Dumbbell'],
   'Hold a heavy dumbbell or kettlebell in one hand and walk a set distance while keeping the spine perfectly vertical — resisting lateral flexion. Trains the lateral core and obliques through anti-lateral-flexion.', NULL),

  ('Mountain Climber', ARRAY['Core','Shoulders'], ARRAY['Bodyweight'],
   'In a push-up position, alternate driving each knee toward the chest as fast as possible. Combines core bracing with hip flexion demand and elevates heart rate. A useful metabolic conditioning addition to core circuits.', NULL),

  ('McGill Curl-Up', ARRAY['Core'], ARRAY['Bodyweight'],
   'Developed by Dr. Stuart McGill. Lie on the back, one leg extended, one knee bent. Place hands under the lower back to maintain its curve. Raise only the head and shoulders slightly — not a full sit-up. Activates the rectus abdominis with minimal spinal compression.', NULL),

  ('Reverse Crunch', ARRAY['Core'], ARRAY['Bodyweight'],
   'Lie on the back and draw the knees toward the chest, then curl the hips off the floor at the top. The motion reverses the typical crunch — the pelvis moves toward the ribcage rather than the ribcage toward the pelvis. Better targets the lower abs.', NULL),

  ('Toes-to-Bar', ARRAY['Core'], ARRAY['Bodyweight'],
   'Hang from a pull-up bar and raise the legs until the toes touch the bar. Requires significant hip flexor and lat strength alongside core control. A staple in gymnastics and CrossFit-style training.', NULL),

  -- ════════════════════════════════════════════════════════════════
  -- FULL BODY / POWER / FUNCTIONAL
  -- ════════════════════════════════════════════════════════════════

  ('Barbell Snatch', ARRAY['Back','Shoulders','Quads','Hamstrings','Glutes','Core'], ARRAY['Barbell'],
   'An Olympic lift that moves the barbell from the floor to overhead in one continuous movement. The wide grip, explosive hip extension, and overhead squat reception make it the most technical barbell lift. Develops total-body power, coordination, and mobility.', NULL),

  ('Clean and Jerk', ARRAY['Back','Shoulders','Quads','Hamstrings','Glutes','Core'], ARRAY['Barbell'],
   'Two-part Olympic lift. The clean pulls the bar from the floor to the front rack. The jerk drives it overhead using a dip-and-drive then splits or pushes into a receiving position. The gold standard for upper-body power output.', NULL),

  ('Barbell Thruster', ARRAY['Quads','Shoulders','Triceps','Core','Glutes'], ARRAY['Barbell'],
   'A front squat into an overhead press in one fluid motion. As you rise from the squat, the leg drive transfers energy into the press. A brutal full-body conditioning and strength movement popularised by CrossFit.', NULL),

  ('Dumbbell Thruster', ARRAY['Quads','Shoulders','Triceps','Core','Glutes'], ARRAY['Dumbbell'],
   'Same as the barbell thruster but with dumbbells. More accessible equipment-wise and allows slight wrist adjustment. Common in metabolic circuits and AMRAP-style training.', NULL),

  ('Kettlebell Clean', ARRAY['Back','Shoulders','Quads','Hamstrings','Glutes'], ARRAY['Kettlebell'],
   'Swing the kettlebell from a swing position and guide it into the rack by rotating the wrist. Develops total-body power and coordination. Can be performed single or double kettlebell.', NULL),

  ('Kettlebell Snatch', ARRAY['Back','Shoulders','Quads','Hamstrings','Glutes','Core'], ARRAY['Kettlebell'],
   'The kettlebell is swung and then punched overhead in one motion. Among the most technically demanding kettlebell skills. Develops hip power, shoulder stability, and cardiovascular conditioning. The benchmark is 100 reps with 24kg in 5 minutes.', NULL),

  ('Medicine Ball Slam', ARRAY['Core','Back','Shoulders'], ARRAY['Bodyweight'],
   'Raise a heavy medicine ball overhead, then slam it into the floor as hard as possible. Trains the entire posterior chain and core through an explosive, powerful downward movement. Excellent for developing rate-of-force development.', NULL),

  ('Box Jump', ARRAY['Quads','Glutes','Hamstrings','Calves'], ARRAY['Bodyweight'],
   'Jump explosively from a standing position onto a sturdy box. Land softly with knees bent. Step down carefully. Develops lower-body power and reactive strength. Progress by increasing box height.', NULL),

  ('Broad Jump', ARRAY['Quads','Glutes','Hamstrings','Calves'], ARRAY['Bodyweight'],
   'A standing long jump for maximum horizontal distance. Measure from takeoff line to heel at landing. Requires full lower-body triple extension and coordination. Excellent test and developer of horizontal power.', NULL),

  ('Battle Ropes', ARRAY['Shoulders','Core','Back'], ARRAY['Bodyweight'],
   'Anchor a heavy rope and perform alternating or simultaneous wave patterns, slams, or circles. A conditioning tool that heavily taxes the shoulders, arms, and cardiovascular system while keeping the feet planted.', NULL),

  ('Burpee', ARRAY['Quads','Chest','Shoulders','Core','Glutes'], ARRAY['Bodyweight'],
   'From standing: drop hands to floor, jump feet back to push-up position, perform a push-up, jump feet to hands, then explosively jump up with arms overhead. A total-body conditioning movement used heavily in HIIT and military fitness.', NULL),

  ('Man Maker', ARRAY['Chest','Back','Shoulders','Quads','Core'], ARRAY['Dumbbell'],
   'Hold dumbbells, perform a push-up, then row each dumbbell, then stand via a squat clean, press overhead. One of the most demanding total-body dumbbell movements. Often done for a set number of reps in conditioning circuits.', NULL),

  ('Push Press (Dumbbell)', ARRAY['Shoulders','Triceps','Quads'], ARRAY['Dumbbell'],
   'Dip the knees slightly and drive the dumbbells overhead using leg momentum. Allows heavier overhead loads than a strict press. Develops the link between lower-body power and upper-body pressing.', NULL),

  ('Sandbag Clean', ARRAY['Back','Shoulders','Quads','Hamstrings','Glutes'], ARRAY['Bodyweight'],
   'Hoist a sandbag from the floor to the shoulders using a hip-hinge and pull. The shifting, unstable load makes this more challenging than a barbell clean and engages a wider range of stabilisers.', NULL),

  ('Weighted Vest Walk', ARRAY['Quads','Glutes','Core','Calves'], ARRAY['Bodyweight'],
   'Walk continuously wearing a weighted vest. Develops aerobic endurance and lower-body muscular endurance with minimal skill requirement. Very accessible and effective for increasing caloric expenditure.', NULL),

  ('Jump Squat', ARRAY['Quads','Glutes','Hamstrings','Calves'], ARRAY['Bodyweight'],
   'Perform a squat then explode upward, leaving the ground at the top. Land softly back into the next squat. Develops lower-body power and reactive capacity. Can be loaded with a barbell, dumbbells, or a vest.', NULL),

  -- ════════════════════════════════════════════════════════════════
  -- CARDIO / CONDITIONING
  -- ════════════════════════════════════════════════════════════════

  ('Treadmill Run', ARRAY['Quads','Hamstrings','Calves','Core'], ARRAY['Machine'],
   'Sustained running on a motorised treadmill. Highly programmable for pace, incline, and interval patterns. One of the most accessible forms of cardiovascular training for improving aerobic capacity and burning calories.', NULL),

  ('Outdoor Run', ARRAY['Quads','Hamstrings','Calves','Core'], ARRAY['Bodyweight'],
   'Running outdoors on roads, tracks, or trails. Ground reaction forces, wind resistance, and varied terrain make outdoor running slightly more demanding than treadmill running at equivalent paces.', NULL),

  ('Stationary Bike', ARRAY['Quads','Hamstrings','Calves'], ARRAY['Machine'],
   'Low-impact cardiovascular exercise on a stationary cycle. Excellent for those with knee or hip issues. Can be used for steady-state cardio or high-intensity interval training (HIIT) by varying resistance.', NULL),

  ('Outdoor Cycling', ARRAY['Quads','Hamstrings','Glutes','Calves'], ARRAY['Bodyweight'],
   'Cycling outdoors on a bike. Terrain, hills, and wind resistance add natural variability. Road cycling, mountain biking, and gravel cycling all provide excellent aerobic and lower-body conditioning.', NULL),

  ('Rowing Machine', ARRAY['Back','Hamstrings','Glutes','Core','Biceps','Shoulders'], ARRAY['Machine'],
   'The ergometer (erg) is one of the most effective full-body cardio tools. Each stroke engages legs, core, and arms in sequence: legs drive, then core lean-back, then arm pull. Measured in split times (pace per 500m).', NULL),

  ('Elliptical', ARRAY['Quads','Hamstrings','Glutes','Core'], ARRAY['Machine'],
   'A low-impact cardiovascular machine mimicking running motion without the impact forces. The moving arm handles also engage the upper body. Good for active recovery or for those with joint issues.', NULL),

  ('Stair Climber', ARRAY['Quads','Glutes','Calves','Hamstrings'], ARRAY['Machine'],
   'Simulates stair climbing on a revolving step machine. Provides cardiovascular conditioning with high glute and quad involvement. A steep calorie-burn per minute compared to most cardio machines.', NULL),

  ('Jump Rope (Standard)', ARRAY['Calves','Quads','Shoulders','Core'], ARRAY['Bodyweight'],
   'Continuous single-bounce jump rope. An efficient cardiovascular tool that also improves foot speed, coordination, and calf endurance. Start with single jumps before progressing to more advanced techniques.', NULL),

  ('Jump Rope (Double-Under)', ARRAY['Calves','Quads','Shoulders','Core'], ARRAY['Bodyweight'],
   'The rope passes under the feet twice per jump. Requires a fast wrist rotation and a higher jump. A benchmark in CrossFit and jump rope training. Significantly more intense than single-unders.', NULL),

  ('Assault Bike', ARRAY['Quads','Hamstrings','Glutes','Shoulders','Back','Core'], ARRAY['Machine'],
   'A fan-resistance stationary bike with moving arm handles. As effort increases, resistance increases proportionally — you cannot "cheat" the resistance. One of the most brutal conditioning tools available. Used for sprints, EMOM intervals, and all-out efforts.', NULL),

  ('SkiErg', ARRAY['Back','Shoulders','Core','Triceps'], ARRAY['Machine'],
   'A Concept2 machine simulating the double-pole ski motion. Pull the handles from overhead down to hip level. Primarily trains the upper body and core with high cardiovascular demand. Excellent for low-impact conditioning.', NULL),

  ('Incline Treadmill Walk', ARRAY['Quads','Glutes','Calves','Hamstrings'], ARRAY['Machine'],
   'Walk at a high incline (10–15%) on a treadmill at a moderate pace. Demands significant lower-body effort and elevates heart rate to cardio zones without the impact of running. Popularised as "Zone 2" training.', NULL),

  ('Swimming (Laps)', ARRAY['Back','Shoulders','Core','Quads','Hamstrings'], ARRAY['Bodyweight'],
   'Continuous lap swimming using any stroke. Exceptional total-body cardiovascular exercise with zero impact on joints. Freestyle (front crawl) is most efficient for conditioning; other strokes target muscles differently.', NULL),

  ('High Knees', ARRAY['Quads','Core','Calves'], ARRAY['Bodyweight'],
   'Run in place while driving the knees as high as possible with each step, aiming for 90° hip flexion. High tempo. A cardiovascular warm-up drill that also trains hip flexor strength and running mechanics.', NULL),

  ('Lateral Shuffle', ARRAY['Quads','Glutes','Calves'], ARRAY['Bodyweight'],
   'Side-to-side lateral stepping drill performed continuously for distance or time. Improves lateral movement patterns, hip abductor strength, and cardiovascular fitness. Common in sports conditioning and agility training.', NULL),

  ('Sprint Intervals', ARRAY['Quads','Hamstrings','Glutes','Calves','Core'], ARRAY['Bodyweight'],
   'Short maximal-effort sprints followed by rest periods (e.g. 10–30 second sprint, 90 second walk). One of the most effective methods for improving anaerobic capacity, VO2 max, and fat loss. Can be performed on track, treadmill, or any open surface.', NULL)

) AS t(name, muscle_groups, equipment, description, youtube_url)
WHERE NOT EXISTS (
  SELECT 1 FROM exercises e WHERE e.name = t.name
);
