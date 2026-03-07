import { createAdminClient, createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// ── Exercises to seed ────────────────────────────────────────────────────────
const EXERCISES = [
  // GLUTES & HIPS
  { name: '45 Degree Hip Extension',       muscle_groups: ['Glutes','Hamstrings'],                   equipment: ['Machine'],                 description: 'Performed on a 45-degree hyperextension bench. Drive the hips up against gravity by squeezing the glutes, pausing at the top, then lower with control. Keep the spine neutral throughout. Excellent for isolating the glutes and upper hamstrings.' },
  { name: '45 Degree Kickback',            muscle_groups: ['Glutes'],                                equipment: ['Machine','Cable'],          description: 'Position at a 45-degree angle on a hyperextension bench or cable attachment. Drive one leg back and up, squeezing the glute hard at full extension. Control the return. Targets the gluteus maximus through hip hyperextension.' },
  { name: 'Glute Focused Leg Press',       muscle_groups: ['Glutes','Hamstrings'],                   equipment: ['Machine'],                 description: 'Use a high and wide foot placement on the leg press platform. Drive through the heels rather than the toes, and allow a deep range of motion to maximise glute stretch at the bottom. The high foot position transfers emphasis away from the quads and into the glutes and hamstrings.' },
  { name: 'Glute-Biased Split Squat',      muscle_groups: ['Glutes','Quads','Hamstrings'],            equipment: ['Bodyweight','Dumbbell'],    description: 'A split squat variation with the front foot stepped further forward than a standard lunge stance. This increased forward lean and extended stride places greater stretch and load on the glutes. Lower the back knee toward the floor while keeping the torso slightly inclined forward.' },
  { name: 'Machine Hip Thrust',            muscle_groups: ['Glutes'],                                equipment: ['Machine'],                 description: 'Performed in a dedicated hip thrust machine that removes the need to set up with a barbell. Sit with the upper back against the pad and drive the hips to full extension, squeezing the glutes hard at the top. The machine provides consistent resistance throughout the range of motion.' },

  // HAMSTRINGS
  { name: 'Knee-Blocked DB RDL',           muscle_groups: ['Hamstrings','Glutes'],                   equipment: ['Dumbbell'],                description: 'A Romanian deadlift variation where the knees are lightly pressed against a pad or bench to prevent forward travel. This blocks the quads from assisting and forces the hamstrings to do all the work. Hinge deeply, feeling the stretch, then drive the hips forward to return.' },
  { name: 'Machine Nordic Curl',           muscle_groups: ['Hamstrings'],                            equipment: ['Machine'],                 description: 'A machine-assisted version of the Nordic curl. The machine controls the descent, allowing the athlete to lower slowly using hamstring eccentric strength before the machine assists on the return. Ideal for building the eccentric hamstring strength that reduces injury risk.' },
  { name: 'Single Leg Seated Leg Curl (Ext Rot)', muscle_groups: ['Hamstrings'],                    equipment: ['Machine'],                 description: 'Performed unilaterally on a seated leg curl machine with the working foot externally rotated (toes out). External rotation shifts emphasis onto the biceps femoris short head and outer hamstrings. Curl one leg at a time for better isolation and to identify imbalances.' },

  // QUADS
  { name: 'Bodyweight Squat (Heel Elevated)', muscle_groups: ['Quads','Glutes'],                    equipment: ['Bodyweight'],              description: 'A bodyweight squat with heels raised on a plate or wedge. Elevating the heels increases ankle dorsiflexion, allowing the torso to stay more upright and the knees to travel further forward, dramatically increasing quad activation. Great for quad development and squat mobility work.' },
  { name: 'Pendulum Squats',               muscle_groups: ['Quads','Glutes'],                        equipment: ['Machine'],                 description: 'Performed in a pendulum squat machine where the load swings in an arc rather than moving vertically. The arc keeps constant tension on the quads and allows a very deep squat with a natural, joint-friendly movement path. One of the best machine exercises for quad hypertrophy.' },
  { name: 'Quad-Focus Leg Press',          muscle_groups: ['Quads'],                                 equipment: ['Machine'],                 description: 'Use a low and narrow foot placement on the leg press platform. Keep the feet close together in the centre of the platform and drive through the toes. This positioning removes the glutes and hamstrings from the movement, targeting the quads — particularly the vastus lateralis and rectus femoris.' },

  // CALVES
  { name: 'Single Leg Donkey Calf Raise',  muscle_groups: ['Calves'],                                equipment: ['Machine','Bodyweight'],    description: 'A unilateral version of the donkey calf raise performed with the hip flexed and one leg working at a time. The hip-flexed position pre-stretches the gastrocnemius for maximum range of motion. Single-leg loading allows greater intensity per side and helps correct calf imbalances.' },
  { name: 'Standing Single Leg Calf Raise',muscle_groups: ['Calves'],                                equipment: ['Bodyweight','Dumbbell'],   description: 'Stand on one foot with the ball of the foot on the edge of a step. Lower the heel below step level for a full stretch, then raise as high as possible. Single-leg loading significantly increases the stimulus compared to bilateral calf raises and forces each calf to work independently.' },
  { name: 'Toes-Inward Calf Raise',        muscle_groups: ['Calves'],                                equipment: ['Machine','Barbell'],       description: 'A calf raise variation performed with toes pointed inward (pigeon-toed stance). This position emphasises the outer head of the gastrocnemius (lateral gastrocnemius). Perform through full range of motion. Pair with toes-outward raises to develop the full calf.' },

  // BACK & ROWS
  { name: 'Bent Over Barbell Row',         muscle_groups: ['Back','Biceps'],                         equipment: ['Barbell'],                 description: 'Hinge at the hips to a roughly horizontal torso with a flat back. Pull a barbell to the lower chest or upper abdomen, driving the elbows back and squeezing the lats and rhomboids at the top. The bent-over position maximises back stretch at the bottom of each rep.' },
  { name: 'Lat Prayer (Pull-Over)',         muscle_groups: ['Back','Core'],                           equipment: ['Cable'],                   description: 'Face a cable machine set to chest height. With arms extended and a slight elbow bend, pull the handle down and in toward the hips in a large arc (the prayer motion). The lat pull-over isolates the lats without bicep involvement, training the lat\'s function of shoulder extension.' },
  { name: 'Machine Low Row',               muscle_groups: ['Back','Biceps'],                         equipment: ['Machine'],                 description: 'Seated at a low-row machine with the cable originating from near the floor. Pull the handles to the abdomen or lower chest, keeping the torso upright. The low angle of pull emphasises the lower lats and teres major compared to mid or high rows.' },
  { name: 'Machine Upper-Back Row',        muscle_groups: ['Back','Shoulders'],                      equipment: ['Machine'],                 description: 'A machine row where the handles are set at or above shoulder height to target the upper back — including the rhomboids, rear delts, and mid-traps. Pull the handles toward the face or upper chest, squeezing the shoulder blades together at the end of each rep.' },
  { name: 'Narrow Grip Pull-Down',         muscle_groups: ['Back','Biceps'],                         equipment: ['Cable','Machine'],         description: 'A lat pulldown performed with a close neutral-grip handle. The narrow grip allows a greater range of motion and places the elbows in a more advantageous path to fully stretch and contract the lats. Pull the handle to the upper chest while keeping the torso slightly reclined.' },
  { name: 'Narrow MAG Grip Row',           muscle_groups: ['Back','Biceps'],                         equipment: ['Cable','Machine'],         description: 'Performed with a narrow MAG (multi-angle grip) handle attachment that allows a neutral grip. The handle width and angle reduce wrist strain and allow the elbows to travel in a natural path. Pull to the abdomen while keeping the torso upright, focusing on retracting the shoulder blades.' },
  { name: 'Nautilus Pulldown',             muscle_groups: ['Back','Biceps'],                         equipment: ['Machine'],                 description: 'Performed on a Nautilus or similar plate-loaded pulldown machine with a cam-based resistance curve. The cam is designed to match the strength curve of the lat, providing maximum resistance at the strongest point of the movement for superior muscle stimulus.' },
  { name: 'Pronated Lat Pulldown',         muscle_groups: ['Back','Biceps'],                         equipment: ['Cable','Machine'],         description: 'A lat pulldown performed with a pronated (overhand) grip, typically on a wide bar. The pronated grip shifts more stress onto the lats and reduces bicep involvement compared to a supinated grip. Pull to the upper chest while retracting the shoulder blades.' },
  { name: 'Semi-Horizontal Shrug (Machine)', muscle_groups: ['Shoulders','Back'],                   equipment: ['Machine'],                 description: 'Performed on a low row or chest-supported row machine. Sit in the row position but instead of pulling with the arms, perform a shrug — elevating the shoulder blades against the resistance. The semi-horizontal angle changes the force vector compared to a traditional vertical shrug, targeting different fibres of the upper traps.' },

  // CHEST
  { name: 'Cross-Cable Extensions',        muscle_groups: ['Chest'],                                 equipment: ['Cable'],                   description: 'Set two cables on opposite sides of a cable station at chest height. Grasp one cable in each hand and bring them together in a crossing motion in front of the chest. The cross-over at the end contracts the inner pec fibres maximally.' },
  { name: 'High To Low Cable Fly',         muscle_groups: ['Chest'],                                 equipment: ['Cable'],                   description: 'Set cables at the highest position. Pull the handles downward and inward in a wide arc, converging at hip height. The downward angle emphasises the lower chest (sternal head of the pec major). Keep a slight elbow bend throughout and control the eccentric return.' },
  { name: 'Low Incline Machine Chest Press',muscle_groups: ['Chest','Triceps','Shoulders'],           equipment: ['Machine'],                 description: 'Performed on a machine set to a low incline (15–25 degrees). The low angle develops the upper chest while reducing shoulder strain compared to a steep incline. Press to full lockout and control the return to maximum pec stretch.' },
  { name: 'Machine Chest Fly',             muscle_groups: ['Chest'],                                 equipment: ['Machine'],                 description: 'A chest isolation exercise on a pec fly / butterfly machine. Grip the handles and bring the arms together in a wide arc, squeezing the chest at peak contraction. Unlike a cable fly, the machine provides a guided path and is typically easier to set up for heavy loading.' },

  // SHOULDERS
  { name: 'Hip-Level Cable Lateral Raise', muscle_groups: ['Shoulders'],                             equipment: ['Cable'],                   description: 'A cable lateral raise where the cable originates from hip height rather than the floor. This angle changes the strength curve, providing greater tension at the bottom of the movement and a unique stimulus to the medial deltoid. Raise the arm to shoulder height while keeping the elbow slightly bent.' },
  { name: 'Seated Dumbbell Lateral Raise', muscle_groups: ['Shoulders'],                             equipment: ['Dumbbell'],                description: 'A lateral raise performed seated on a bench. Sitting eliminates the ability to use leg drive or body momentum, forcing strict deltoid isolation. Raise the dumbbells out to shoulder height leading with the elbows, with pinkies slightly higher than thumbs.' },
  { name: 'Seated Lateral Raise',          muscle_groups: ['Shoulders'],                             equipment: ['Dumbbell','Machine'],      description: 'Performed seated — either with dumbbells or on a lateral raise machine. Eliminating lower-body contribution forces the medial deltoid to work in isolation. Raise to shoulder height, pause briefly at the top, and control the eccentric phase.' },
  { name: 'Super ROM Laterals',            muscle_groups: ['Shoulders'],                             equipment: ['Dumbbell','Cable'],        description: 'A lateral raise variation that uses a full extended range of motion — starting from the hip (or even behind the body) and raising to above shoulder height. The extended range stretches the deltoid further at the bottom and contracts it harder at the top. Typically performed with lighter loads.' },

  // BICEPS
  { name: 'Barbell (Or EZ Bar) Biceps Curl',muscle_groups: ['Biceps'],                              equipment: ['Barbell'],                 description: 'A biceps curl performed with a straight barbell or EZ-curl bar. The straight bar keeps the wrists fully supinated, maximising bicep activation. The EZ-bar offers a slightly more comfortable wrist angle. Curl from full extension to peak contraction, keeping the upper arms vertical.' },
  { name: 'Face-Away Curls',               muscle_groups: ['Biceps'],                                equipment: ['Cable'],                   description: 'Stand facing away from a low cable pulley with the cable running between the legs or beside the hip. Curl the handle upward in the standard bicep curl motion. Facing away from the cable shifts the resistance profile, loading the bicep maximally at the stretched (bottom) position.' },
  { name: 'Lying DB Bicep Curl',           muscle_groups: ['Biceps'],                                equipment: ['Dumbbell'],                description: 'Lie on a flat bench facing up. Curl dumbbells from the fully extended position to peak contraction while the upper arms remain vertical relative to the floor. The lying position prevents body sway and keeps constant vertical load through the range of motion.' },
  { name: 'Machine Preacher Curl',         muscle_groups: ['Biceps'],                                equipment: ['Machine'],                 description: 'Performed on a dedicated preacher curl machine. The pad fixes the upper arms, eliminating any momentum or shoulder involvement. The machine provides a guided path and a consistent resistance curve, making it easier to achieve peak contraction and perform drop sets or slow eccentrics.' },

  // TRICEPS
  { name: 'Cable Triceps Overhead Extension', muscle_groups: ['Triceps'],                           equipment: ['Cable'],                   description: 'Face away from a cable machine and hold the rope attachment overhead with both hands. Extend the elbows to full lockout. The overhead position places the long head of the tricep in a fully stretched starting position, maximising its contribution.' },
  { name: 'Choker Extensions',             muscle_groups: ['Triceps'],                               equipment: ['Cable'],                   description: 'A cable triceps extension variation where the rope or bar is held at the throat/neck level to start, then extended downward. The unique start position creates a maximal stretch on the lateral and medial heads of the tricep. Focus on controlled extension and squeeze at lockout.' },
  { name: 'Machine Triceps',               muscle_groups: ['Triceps'],                               equipment: ['Machine'],                 description: 'A general term for tricep isolation movements performed on a dedicated triceps machine. The machine path guides the movement, allows heavy loading, and is accessible for beginners and in rehabilitation settings.' },
  { name: 'Overhead Cable Extension',      muscle_groups: ['Triceps'],                               equipment: ['Cable'],                   description: 'Using a cable pulley anchored low with the body turned away, extend the elbows fully overhead. The overhead position fully stretches the long head of the tricep, making it one of the best exercises for long-head development.' },

  // CORE
  { name: 'Decline Crunch',                muscle_groups: ['Core'],                                  equipment: ['Bodyweight'],              description: 'Perform a crunch on a decline bench with the head lower than the hips. The decline angle increases the range of motion and the load on the rectus abdominis at the top of the movement. Cross the arms over the chest or place hands behind the head; avoid pulling on the neck.' },
  { name: 'Face-Away Cable Crunch',        muscle_groups: ['Core'],                                  equipment: ['Cable'],                   description: 'Stand or kneel facing away from a high cable pulley, holding the rope at the back of the head. Crunch forward and downward, bringing the elbows toward the thighs. Facing away from the cable means maximum resistance is applied at the stretched (upright) position.' },

  // COMPOUND / PULL
  { name: 'Assisted Pull-Up',              muscle_groups: ['Back','Biceps'],                         equipment: ['Machine'],                 description: 'Performed on an assisted pull-up machine that counterbalances a portion of bodyweight with a weight stack, making the pull-up accessible regardless of strength level. Grip the bar wider than shoulder-width and pull the chest to the bar. As strength increases, reduce the counterbalance weight.' },

  // BARBELL / COMPOUND
  { name: 'Barbell RDL',                   muscle_groups: ['Hamstrings','Glutes','Back'],             equipment: ['Barbell'],                 description: 'The standard barbell Romanian deadlift. Hinge at the hips with a slight knee bend, lowering the barbell along the shins until a strong hamstring stretch is felt at roughly mid-shin. Drive the hips forward to return to standing. Keep the back flat and bar close to the body throughout.' },
  { name: 'Barbell Upright Rows',          muscle_groups: ['Shoulders','Back'],                      equipment: ['Barbell'],                 description: 'Hold a barbell with a slightly-wider-than-hip-width overhand grip. Pull the bar straight up the front of the body to chin height, flaring the elbows wide and above the bar. Targets the lateral deltoid and upper back.' },
  { name: 'DB Trap Shrugs',                muscle_groups: ['Shoulders','Back'],                      equipment: ['Dumbbell'],                description: 'Hold a dumbbell in each hand at the sides. Shrug the shoulders straight up toward the ears, pause at the top, and lower under control. The dumbbell variation allows a natural arc of motion and greater depth of stretch at the bottom compared to a barbell shrug.' },
  { name: 'Dips/Dip Machine',              muscle_groups: ['Triceps','Chest','Shoulders'],            equipment: ['Bodyweight','Machine'],    description: 'Either on parallel bars (bodyweight) or a dedicated dip machine. Lower until the elbows reach 90 degrees, then press back to full lockout. An upright torso emphasises the triceps; a forward lean emphasises the lower chest.' },

  // SMITH MACHINE
  { name: 'Smith Machine Incline Press',   muscle_groups: ['Chest','Triceps','Shoulders'],            equipment: ['Barbell'],                 description: 'Set a bench to 30–45 degrees inside a Smith machine. Unrack and lower the bar to the upper chest, then press back to lockout. The Smith machine\'s fixed bar path removes the stabilisation demand, allowing focus on pure pressing strength and chest development.' },
  { name: 'Smith Machine RDL',             muscle_groups: ['Hamstrings','Glutes','Back'],             equipment: ['Barbell'],                 description: 'The Romanian deadlift performed in a Smith machine. Set the bar at hip height, hinge forward with a flat back, and lower the bar to mid-shin. The fixed bar path provides stability, making this a beginner-friendly RDL variant.' },
  { name: 'Smith Machine Upright Row',     muscle_groups: ['Shoulders','Back'],                      equipment: ['Barbell'],                 description: 'Grip a Smith machine bar with a shoulder-width overhand grip. Pull the bar straight up the body to chin height, flaring the elbows outward and above the bar. The fixed path provides a controlled movement for targeting the lateral delts and upper back.' },

  // LOWER BODY
  { name: 'Walking Lunges',                muscle_groups: ['Quads','Glutes','Hamstrings'],            equipment: ['Bodyweight'],              description: 'Step forward into a lunge, lower the rear knee toward the floor, then bring the rear foot forward to step into the next lunge — walking continuously across the floor. The walking pattern adds a balance and coordination challenge. Can be loaded with dumbbells, barbells, or a weight vest.' },
]

// ── POST /api/admin/seed-exercises ──────────────────────────────────────────
export async function POST() {
  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (userData?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Use admin client to bypass RLS
  const adminSupabase = await createAdminClient()

  // 1. Fetch all existing exercise names
  const { data: existing, error: fetchErr } = await adminSupabase
    .from('exercises')
    .select('name')

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 })

  const existingNames = new Set((existing ?? []).map((e: { name: string }) => e.name.toLowerCase()))

  // 2. Filter to only exercises that don't already exist (case-insensitive)
  const toInsert = EXERCISES.filter(e => !existingNames.has(e.name.toLowerCase()))

  if (toInsert.length === 0) {
    return NextResponse.json({ inserted: 0, skipped: EXERCISES.length, message: 'All exercises already exist.' })
  }

  // 3. Bulk insert
  const { data: inserted, error: insertErr } = await adminSupabase
    .from('exercises')
    .insert(toInsert.map(e => ({
      name: e.name,
      muscle_groups: e.muscle_groups,
      equipment: e.equipment,
      description: e.description,
      youtube_url: null,
      is_archived: false,
    })))
    .select('name')

  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })

  return NextResponse.json({
    inserted: inserted?.length ?? 0,
    skipped: EXERCISES.length - (inserted?.length ?? 0),
    insertedNames: inserted?.map((e: { name: string }) => e.name),
  })
}
