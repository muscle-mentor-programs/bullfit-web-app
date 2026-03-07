import { createAdminClient, createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// ── Volume constants (sets per exercise per session, by week) ─────────────────
// Priority muscle: starts high, increases weeks 1→2 before support catches up
const PC = [4, 5, 5, 6, 6, 5]   // Priority Compound
const PI = [3, 4, 4, 5, 5, 4]   // Priority Isolation
const SC = [3, 3, 4, 4, 5, 4]   // Support Compound
const SI = [2, 2, 3, 3, 4, 3]   // Support Isolation

// ── Exercises to upsert into the library ─────────────────────────────────────
const EXERCISES_TO_SEED = [
  // CHEST
  { name: 'Barbell Flat Bench Press',     muscle_groups: ['chest', 'triceps', 'front deltoids'] },
  { name: 'Barbell Incline Bench Press',  muscle_groups: ['upper chest', 'chest', 'front deltoids', 'triceps'] },
  { name: 'DB Flat Press',                muscle_groups: ['chest', 'triceps', 'front deltoids'] },
  { name: 'DB Incline Press',             muscle_groups: ['upper chest', 'chest', 'front deltoids', 'triceps'] },
  { name: 'Cable Fly Low-to-High',        muscle_groups: ['lower chest', 'chest'] },
  { name: 'Cable Fly High-to-Low',        muscle_groups: ['upper chest', 'chest'] },
  { name: 'Pec Deck Machine',             muscle_groups: ['chest'] },
  { name: 'DB Decline Press',             muscle_groups: ['lower chest', 'chest', 'triceps'] },
  // BACK
  { name: 'Barbell Bent-Over Row',        muscle_groups: ['back', 'lats', 'rhomboids', 'biceps', 'rear deltoids'] },
  { name: 'DB Single-Arm Row',            muscle_groups: ['back', 'lats', 'biceps'] },
  { name: 'Meadows Row',                  muscle_groups: ['back', 'lats', 'biceps'] },
  { name: 'Incline DB Row',               muscle_groups: ['back', 'rhomboids', 'rear deltoids'] },
  { name: 'Cable Row Neutral Grip',       muscle_groups: ['back', 'rhomboids', 'biceps'] },
  { name: 'Cable Row Wide Grip',          muscle_groups: ['back', 'rear deltoids'] },
  { name: 'Chest-Supported Machine Row', muscle_groups: ['back', 'rhomboids', 'rear deltoids'] },
  { name: 'Lat Pulldown Wide Grip',       muscle_groups: ['lats', 'back', 'biceps'] },
  { name: 'Lat Pulldown Neutral Grip',    muscle_groups: ['lats', 'back', 'biceps'] },
  { name: 'Pull-Up',                      muscle_groups: ['lats', 'back', 'biceps'] },
  { name: 'Chin-Up',                      muscle_groups: ['lats', 'biceps', 'back'] },
  { name: 'Straight-Arm Cable Pulldown',  muscle_groups: ['lats', 'back'] },
  // SHOULDERS
  { name: 'Barbell Overhead Press',       muscle_groups: ['front deltoids', 'deltoids', 'triceps'] },
  { name: 'DB Overhead Press',            muscle_groups: ['deltoids', 'front deltoids', 'triceps'] },
  { name: 'DB Lateral Raise',             muscle_groups: ['lateral deltoids', 'deltoids'] },
  { name: 'Cable Lateral Raise',          muscle_groups: ['lateral deltoids', 'deltoids'] },
  { name: 'Machine Lateral Raise',        muscle_groups: ['lateral deltoids', 'deltoids'] },
  { name: 'DB Rear Delt Fly',             muscle_groups: ['rear deltoids', 'deltoids', 'rhomboids'] },
  { name: 'Cable Rear Delt Fly',          muscle_groups: ['rear deltoids', 'deltoids'] },
  { name: 'Reverse Pec Deck',             muscle_groups: ['rear deltoids', 'deltoids', 'rhomboids'] },
  { name: 'Face Pull',                    muscle_groups: ['rear deltoids', 'deltoids', 'rotator cuff'] },
  { name: 'DB Front Raise',               muscle_groups: ['front deltoids', 'deltoids'] },
  { name: 'Arnold Press',                 muscle_groups: ['deltoids', 'front deltoids', 'lateral deltoids', 'triceps'] },
  // BICEPS
  { name: 'Barbell Curl',                 muscle_groups: ['biceps'] },
  { name: 'EZ Bar Curl',                  muscle_groups: ['biceps'] },
  { name: 'DB Curl',                      muscle_groups: ['biceps'] },
  { name: 'Incline DB Curl',              muscle_groups: ['biceps', 'long head biceps'] },
  { name: 'Hammer Curl',                  muscle_groups: ['biceps', 'brachialis', 'brachioradialis'] },
  { name: 'Cable Curl',                   muscle_groups: ['biceps'] },
  { name: 'Machine Preacher Curl',        muscle_groups: ['biceps', 'short head biceps'] },
  { name: 'Spider Curl',                  muscle_groups: ['biceps', 'short head biceps'] },
  { name: 'Concentration Curl',           muscle_groups: ['biceps'] },
  // TRICEPS
  { name: 'Close-Grip Bench Press',       muscle_groups: ['triceps', 'chest', 'front deltoids'] },
  { name: 'EZ Bar Skull Crusher',         muscle_groups: ['triceps', 'long head triceps'] },
  { name: 'DB Overhead Tricep Extension', muscle_groups: ['triceps', 'long head triceps'] },
  { name: 'Rope Pushdown',                muscle_groups: ['triceps', 'lateral head triceps'] },
  { name: 'V-Bar Pushdown',              muscle_groups: ['triceps'] },
  { name: 'Single-Arm Cable Pushdown',    muscle_groups: ['triceps', 'lateral head triceps'] },
  { name: 'Overhead Cable Tricep Extension', muscle_groups: ['triceps', 'long head triceps'] },
  { name: 'Tate Press',                   muscle_groups: ['triceps'] },
  // QUADS
  { name: 'Barbell Back Squat',           muscle_groups: ['quads', 'glutes', 'hamstrings'] },
  { name: 'Barbell Front Squat',          muscle_groups: ['quads', 'glutes'] },
  { name: 'Leg Press Low Foot',           muscle_groups: ['quads'] },
  { name: 'Leg Press High Foot',          muscle_groups: ['quads', 'glutes', 'hamstrings'] },
  { name: 'Hack Squat Machine',           muscle_groups: ['quads', 'glutes'] },
  { name: 'Leg Extension',               muscle_groups: ['quads'] },
  { name: 'Bulgarian Split Squat',        muscle_groups: ['quads', 'glutes', 'hamstrings'] },
  { name: 'DB Reverse Lunge',             muscle_groups: ['quads', 'glutes'] },
  { name: 'Walking Lunge',                muscle_groups: ['quads', 'glutes', 'hamstrings'] },
  // HAMSTRINGS
  { name: 'Romanian Deadlift',            muscle_groups: ['hamstrings', 'glutes', 'lower back'] },
  { name: 'Lying Leg Curl',               muscle_groups: ['hamstrings'] },
  { name: 'Seated Leg Curl',              muscle_groups: ['hamstrings'] },
  { name: 'Nordic Hamstring Curl',        muscle_groups: ['hamstrings'] },
  { name: 'Stiff-Leg Deadlift',           muscle_groups: ['hamstrings', 'glutes', 'lower back'] },
  { name: 'Single-Leg RDL',              muscle_groups: ['hamstrings', 'glutes'] },
  { name: 'Glute-Ham Raise',              muscle_groups: ['hamstrings', 'glutes'] },
  // GLUTES
  { name: 'Barbell Hip Thrust',           muscle_groups: ['glutes', 'hamstrings'] },
  { name: 'Machine Hip Thrust',           muscle_groups: ['glutes'] },
  { name: 'Cable Kickback',               muscle_groups: ['glutes'] },
  { name: 'Barbell Sumo Deadlift',        muscle_groups: ['glutes', 'hamstrings', 'quads', 'lower back'] },
  { name: 'Reverse Hyperextension',       muscle_groups: ['glutes', 'hamstrings', 'lower back'] },
  { name: 'Cable Pull-Through',           muscle_groups: ['glutes', 'hamstrings'] },
  // CALVES
  { name: 'Standing Calf Raise',          muscle_groups: ['calves', 'gastrocnemius'] },
  { name: 'Seated Calf Raise',            muscle_groups: ['calves', 'soleus'] },
  { name: 'Leg Press Calf Raise',         muscle_groups: ['calves', 'gastrocnemius'] },
]

// ── Types ─────────────────────────────────────────────────────────────────────
interface ExerciseSlot {
  name: string          // exact exercise name
  setsByWeek: number[]  // [w1, w2, w3, w4, w5, w6]
  repMin: number
  repMax: number
  restSeconds: number
}
interface SessionDef { dayOfWeek: number; title: string; exercises: ExerciseSlot[] }
interface ProgramDef  { title: string; description: string; durationWeeks: number; sessions: SessionDef[] }

// ── Program definitions ───────────────────────────────────────────────────────
// Exercise order rule: priority-muscle COMPOUND → support COMPOUND → priority ISO → support ISO
// Volume rule: priority weeks 1-2 increase first; support catches up weeks 3-4+

const PROGRAMS: ProgramDef[] = [

  // ════════════════════════════════════════════════════════════════════════════
  // 1. ARMS PRIORITY  — 5 days/week
  //    Biceps/Triceps: 3x/week | Chest: 2x | Back: 2x | Shoulders: 2x | Legs: 2x
  // ════════════════════════════════════════════════════════════════════════════
  {
    title: 'Arms Priority',
    description: 'Designed around maximum bicep and tricep development, this 5-day program gives arms 3x weekly frequency with progressively increasing volume. Priority arm exercises come before all other work each session. Chest, back, shoulders, and legs are trained twice weekly with sufficient volume to maintain and grow. Volume on arm exercises increases in weeks 1–2; all other muscles follow suit in weeks 3–4, reaching peak stimulus in week 5.',
    durationWeeks: 6,
    sessions: [
      {
        dayOfWeek: 1,
        title: 'Arms A + Chest',
        exercises: [
          // ── Priority compounds ──
          { name: 'Close-Grip Bench Press',       setsByWeek: PC, repMin: 8,  repMax: 12, restSeconds: 90  },
          { name: 'EZ Bar Curl',                  setsByWeek: PC, repMin: 8,  repMax: 12, restSeconds: 75  },
          // ── Support compound ──
          { name: 'Barbell Flat Bench Press',     setsByWeek: SC, repMin: 6,  repMax: 10, restSeconds: 120 },
          // ── Priority isolations ──
          { name: 'EZ Bar Skull Crusher',         setsByWeek: PI, repMin: 10, repMax: 15, restSeconds: 75  },
          { name: 'Incline DB Curl',              setsByWeek: PI, repMin: 10, repMax: 15, restSeconds: 60  },
          // ── Support isolation ──
          { name: 'Pec Deck Machine',             setsByWeek: SI, repMin: 12, repMax: 20, restSeconds: 60  },
        ],
      },
      {
        dayOfWeek: 2,
        title: 'Back + Legs',
        exercises: [
          // ── Support compounds (all non-priority today) ──
          { name: 'Barbell Bent-Over Row',        setsByWeek: SC, repMin: 6,  repMax: 10, restSeconds: 120 },
          { name: 'Barbell Back Squat',           setsByWeek: SC, repMin: 6,  repMax: 10, restSeconds: 180 },
          { name: 'Romanian Deadlift',            setsByWeek: SC, repMin: 8,  repMax: 12, restSeconds: 120 },
          { name: 'Lat Pulldown Wide Grip',       setsByWeek: SC, repMin: 10, repMax: 15, restSeconds: 90  },
          // ── Support isolations ──
          { name: 'Leg Extension',               setsByWeek: SI, repMin: 12, repMax: 20, restSeconds: 60  },
          { name: 'Lying Leg Curl',               setsByWeek: SI, repMin: 10, repMax: 15, restSeconds: 75  },
        ],
      },
      {
        dayOfWeek: 4,
        title: 'Arms B + Shoulders',
        exercises: [
          // ── Priority compounds ──
          { name: 'Rope Pushdown',                setsByWeek: PC, repMin: 10, repMax: 15, restSeconds: 75  },
          { name: 'Cable Curl',                   setsByWeek: PC, repMin: 10, repMax: 15, restSeconds: 60  },
          // ── Support compound ──
          { name: 'DB Overhead Press',            setsByWeek: SC, repMin: 8,  repMax: 12, restSeconds: 90  },
          // ── Priority isolations ──
          { name: 'DB Overhead Tricep Extension', setsByWeek: PI, repMin: 10, repMax: 15, restSeconds: 75  },
          { name: 'Hammer Curl',                  setsByWeek: PI, repMin: 12, repMax: 15, restSeconds: 60  },
          // ── Support isolation ──
          { name: 'DB Lateral Raise',             setsByWeek: SI, repMin: 15, repMax: 20, restSeconds: 60  },
        ],
      },
      {
        dayOfWeek: 5,
        title: 'Chest B + Legs B + Shoulders B',
        exercises: [
          // ── Support compounds ──
          { name: 'Barbell Incline Bench Press',  setsByWeek: SC, repMin: 8,  repMax: 12, restSeconds: 120 },
          { name: 'Barbell Hip Thrust',           setsByWeek: SC, repMin: 10, repMax: 15, restSeconds: 120 },
          { name: 'Leg Press Low Foot',           setsByWeek: SC, repMin: 10, repMax: 15, restSeconds: 120 },
          // ── Support isolations ──
          { name: 'Cable Fly High-to-Low',        setsByWeek: SI, repMin: 12, repMax: 15, restSeconds: 60  },
          { name: 'Seated Leg Curl',              setsByWeek: SI, repMin: 10, repMax: 15, restSeconds: 75  },
          { name: 'Cable Lateral Raise',          setsByWeek: SI, repMin: 15, repMax: 20, restSeconds: 60  },
        ],
      },
      {
        dayOfWeek: 6,
        title: 'Arms C + Back B',
        exercises: [
          // ── Priority compounds ──
          { name: 'Chin-Up',                      setsByWeek: PC, repMin: 6,  repMax: 12, restSeconds: 120 },
          { name: 'V-Bar Pushdown',              setsByWeek: PC, repMin: 10, repMax: 15, restSeconds: 75  },
          // ── Support compound ──
          { name: 'DB Single-Arm Row',            setsByWeek: SC, repMin: 8,  repMax: 15, restSeconds: 90  },
          // ── Priority isolations ──
          { name: 'Machine Preacher Curl',        setsByWeek: PI, repMin: 10, repMax: 15, restSeconds: 60  },
          { name: 'Single-Arm Cable Pushdown',    setsByWeek: PI, repMin: 12, repMax: 15, restSeconds: 60  },
          // ── Support isolation ──
          { name: 'Cable Row Neutral Grip',       setsByWeek: SI, repMin: 10, repMax: 15, restSeconds: 75  },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 2. BACK PRIORITY  — 5 days/week
  //    Back: 3x/week (priority) | Biceps: 3x | Chest: 2x | Shoulders: 2x | Legs: 2x
  // ════════════════════════════════════════════════════════════════════════════
  {
    title: 'Back Priority',
    description: 'A wide, thick back is the goal. Back exercises open every session that includes them, with 3x weekly pulling frequency accumulating high volume through vertical pulls, horizontal rows, and rear delt work. Biceps benefit from the pulling frequency and receive additional direct work. Chest, shoulders, and legs are trained twice weekly. Back volume increases in weeks 1–2; remaining muscle groups follow starting week 3.',
    durationWeeks: 6,
    sessions: [
      {
        dayOfWeek: 1,
        title: 'Back A — Vertical Pulls + Biceps',
        exercises: [
          // ── Priority compounds ──
          { name: 'Lat Pulldown Wide Grip',       setsByWeek: PC, repMin: 8,  repMax: 12, restSeconds: 120 },
          { name: 'Pull-Up',                      setsByWeek: PC, repMin: 6,  repMax: 10, restSeconds: 120 },
          // ── Priority isolation ──
          { name: 'Straight-Arm Cable Pulldown',  setsByWeek: PI, repMin: 12, repMax: 15, restSeconds: 75  },
          { name: 'Incline DB Curl',              setsByWeek: PI, repMin: 10, repMax: 15, restSeconds: 60  },
          // ── Support isolations ──
          { name: 'DB Rear Delt Fly',             setsByWeek: SI, repMin: 15, repMax: 20, restSeconds: 60  },
          { name: 'Standing Calf Raise',          setsByWeek: SI, repMin: 15, repMax: 20, restSeconds: 60  },
        ],
      },
      {
        dayOfWeek: 2,
        title: 'Chest + Shoulders + Triceps',
        exercises: [
          // ── Support compounds ──
          { name: 'Barbell Flat Bench Press',     setsByWeek: SC, repMin: 6,  repMax: 10, restSeconds: 120 },
          { name: 'Barbell Overhead Press',       setsByWeek: SC, repMin: 8,  repMax: 12, restSeconds: 120 },
          // ── Support isolations ──
          { name: 'DB Incline Press',             setsByWeek: SI, repMin: 10, repMax: 15, restSeconds: 90  },
          { name: 'DB Lateral Raise',             setsByWeek: SI, repMin: 15, repMax: 20, restSeconds: 60  },
          { name: 'Rope Pushdown',                setsByWeek: SI, repMin: 12, repMax: 15, restSeconds: 60  },
        ],
      },
      {
        dayOfWeek: 3,
        title: 'Back B — Horizontal Rows + Biceps',
        exercises: [
          // ── Priority compounds ──
          { name: 'Barbell Bent-Over Row',        setsByWeek: PC, repMin: 6,  repMax: 10, restSeconds: 120 },
          { name: 'DB Single-Arm Row',            setsByWeek: PC, repMin: 8,  repMax: 12, restSeconds: 90  },
          // ── Priority isolation ──
          { name: 'Cable Row Wide Grip',          setsByWeek: PI, repMin: 10, repMax: 15, restSeconds: 75  },
          { name: 'Cable Curl',                   setsByWeek: PI, repMin: 10, repMax: 15, restSeconds: 60  },
          // ── Support isolations ──
          { name: 'Reverse Pec Deck',             setsByWeek: SI, repMin: 15, repMax: 20, restSeconds: 60  },
          { name: 'EZ Bar Curl',                  setsByWeek: SI, repMin: 8,  repMax: 12, restSeconds: 60  },
        ],
      },
      {
        dayOfWeek: 4,
        title: 'Legs',
        exercises: [
          // ── Support compounds ──
          { name: 'Barbell Back Squat',           setsByWeek: SC, repMin: 6,  repMax: 10, restSeconds: 180 },
          { name: 'Romanian Deadlift',            setsByWeek: SC, repMin: 8,  repMax: 12, restSeconds: 120 },
          { name: 'Leg Press Low Foot',           setsByWeek: SC, repMin: 10, repMax: 15, restSeconds: 120 },
          // ── Support isolations ──
          { name: 'Leg Extension',               setsByWeek: SI, repMin: 15, repMax: 20, restSeconds: 60  },
          { name: 'Lying Leg Curl',               setsByWeek: SI, repMin: 10, repMax: 15, restSeconds: 75  },
          { name: 'Barbell Hip Thrust',           setsByWeek: SI, repMin: 10, repMax: 15, restSeconds: 90  },
        ],
      },
      {
        dayOfWeek: 5,
        title: 'Back C + Chest B + Biceps B',
        exercises: [
          // ── Priority compounds ──
          { name: 'Meadows Row',                  setsByWeek: PC, repMin: 8,  repMax: 12, restSeconds: 90  },
          { name: 'Lat Pulldown Neutral Grip',    setsByWeek: PC, repMin: 10, repMax: 15, restSeconds: 90  },
          // ── Support compound ──
          { name: 'DB Flat Press',                setsByWeek: SC, repMin: 10, repMax: 15, restSeconds: 90  },
          // ── Priority isolation ──
          { name: 'Chest-Supported Machine Row', setsByWeek: PI, repMin: 12, repMax: 15, restSeconds: 75  },
          { name: 'Barbell Curl',                 setsByWeek: PI, repMin: 8,  repMax: 12, restSeconds: 60  },
          // ── Support isolation ──
          { name: 'Pec Deck Machine',             setsByWeek: SI, repMin: 12, repMax: 20, restSeconds: 60  },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 3. CHEST PRIORITY  — 4 days/week
  //    Chest: 2x/week (priority) | Back: 2x | Shoulders: 2x | Arms: 2x | Legs: 2x
  // ════════════════════════════════════════════════════════════════════════════
  {
    title: 'Chest Priority',
    description: 'Built around twice-weekly chest training with heavy compound pressing leading every chest session. Flat, incline, and isolation work accumulate substantial volume across the pectoral. Back, shoulders, arms, and legs are all trained twice weekly with enough volume to grow. Chest volume peaks in weeks 1–2; the supporting muscle groups build systematically from week 3 onward.',
    durationWeeks: 6,
    sessions: [
      {
        dayOfWeek: 1,
        title: 'Chest A — Flat + Triceps',
        exercises: [
          // ── Priority compounds ──
          { name: 'Barbell Flat Bench Press',     setsByWeek: PC, repMin: 5,  repMax: 10, restSeconds: 180 },
          { name: 'DB Flat Press',                setsByWeek: PC, repMin: 8,  repMax: 12, restSeconds: 120 },
          // ── Support compound ──
          { name: 'Close-Grip Bench Press',       setsByWeek: SC, repMin: 8,  repMax: 12, restSeconds: 90  },
          // ── Priority isolation ──
          { name: 'Cable Fly Low-to-High',        setsByWeek: PI, repMin: 12, repMax: 15, restSeconds: 60  },
          // ── Support isolations ──
          { name: 'EZ Bar Skull Crusher',         setsByWeek: SI, repMin: 10, repMax: 15, restSeconds: 75  },
          { name: 'Rope Pushdown',                setsByWeek: SI, repMin: 12, repMax: 15, restSeconds: 60  },
        ],
      },
      {
        dayOfWeek: 2,
        title: 'Back + Biceps + Rear Delts',
        exercises: [
          // ── Support compounds ──
          { name: 'Barbell Bent-Over Row',        setsByWeek: SC, repMin: 6,  repMax: 10, restSeconds: 120 },
          { name: 'Pull-Up',                      setsByWeek: SC, repMin: 6,  repMax: 10, restSeconds: 120 },
          { name: 'Lat Pulldown Wide Grip',       setsByWeek: SC, repMin: 10, repMax: 15, restSeconds: 90  },
          // ── Support isolations ──
          { name: 'Cable Curl',                   setsByWeek: SI, repMin: 10, repMax: 15, restSeconds: 60  },
          { name: 'Hammer Curl',                  setsByWeek: SI, repMin: 12, repMax: 15, restSeconds: 60  },
          { name: 'Face Pull',                    setsByWeek: SI, repMin: 15, repMax: 20, restSeconds: 60  },
        ],
      },
      {
        dayOfWeek: 4,
        title: 'Chest B — Incline + Shoulders',
        exercises: [
          // ── Priority compounds ──
          { name: 'Barbell Incline Bench Press',  setsByWeek: PC, repMin: 6,  repMax: 10, restSeconds: 180 },
          { name: 'DB Incline Press',             setsByWeek: PC, repMin: 8,  repMax: 12, restSeconds: 120 },
          // ── Support compound ──
          { name: 'DB Overhead Press',            setsByWeek: SC, repMin: 8,  repMax: 12, restSeconds: 90  },
          // ── Priority isolation ──
          { name: 'Pec Deck Machine',             setsByWeek: PI, repMin: 12, repMax: 20, restSeconds: 60  },
          // ── Support isolations ──
          { name: 'DB Lateral Raise',             setsByWeek: SI, repMin: 15, repMax: 20, restSeconds: 60  },
          { name: 'DB Rear Delt Fly',             setsByWeek: SI, repMin: 15, repMax: 20, restSeconds: 60  },
        ],
      },
      {
        dayOfWeek: 5,
        title: 'Legs + Back B + Arms B',
        exercises: [
          // ── Support compounds ──
          { name: 'Barbell Back Squat',           setsByWeek: SC, repMin: 6,  repMax: 10, restSeconds: 180 },
          { name: 'Romanian Deadlift',            setsByWeek: SC, repMin: 8,  repMax: 12, restSeconds: 120 },
          { name: 'DB Single-Arm Row',            setsByWeek: SC, repMin: 8,  repMax: 12, restSeconds: 90  },
          // ── Support isolations ──
          { name: 'Leg Extension',               setsByWeek: SI, repMin: 15, repMax: 20, restSeconds: 60  },
          { name: 'Seated Leg Curl',              setsByWeek: SI, repMin: 10, repMax: 15, restSeconds: 75  },
          { name: 'EZ Bar Curl',                  setsByWeek: SI, repMin: 8,  repMax: 12, restSeconds: 60  },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 4. QUAD PRIORITY  — 4 days/week
  //    Quads: 2x/week (priority) | Hams: 2x | Glutes: 2x | Upper: 2x each
  // ════════════════════════════════════════════════════════════════════════════
  {
    title: 'Quad Priority',
    description: 'Quad development is the driving goal. Heavy squat patterns and leg press work open both lower body sessions, with isolation finishers targeting peak contraction and stretch. Hamstrings and glutes are trained throughout for a complete lower body. Upper body receives two high-quality sessions weekly to maintain and build the full physique alongside quad growth.',
    durationWeeks: 6,
    sessions: [
      {
        dayOfWeek: 1,
        title: 'Quad Focus A + Posterior Chain',
        exercises: [
          // ── Priority compounds (quads first) ──
          { name: 'Barbell Back Squat',           setsByWeek: PC, repMin: 5,  repMax: 10, restSeconds: 180 },
          { name: 'Leg Press Low Foot',           setsByWeek: PC, repMin: 10, repMax: 15, restSeconds: 120 },
          // ── Support compound ──
          { name: 'Romanian Deadlift',            setsByWeek: SC, repMin: 8,  repMax: 12, restSeconds: 120 },
          // ── Priority isolation ──
          { name: 'Leg Extension',               setsByWeek: PI, repMin: 15, repMax: 20, restSeconds: 60  },
          // ── Support isolations ──
          { name: 'Barbell Hip Thrust',           setsByWeek: SI, repMin: 10, repMax: 15, restSeconds: 90  },
          { name: 'Lying Leg Curl',               setsByWeek: SI, repMin: 10, repMax: 15, restSeconds: 75  },
        ],
      },
      {
        dayOfWeek: 2,
        title: 'Upper Push',
        exercises: [
          // ── Support compounds ──
          { name: 'Barbell Flat Bench Press',     setsByWeek: SC, repMin: 6,  repMax: 10, restSeconds: 120 },
          { name: 'Barbell Overhead Press',       setsByWeek: SC, repMin: 8,  repMax: 12, restSeconds: 120 },
          // ── Support isolations ──
          { name: 'DB Incline Press',             setsByWeek: SI, repMin: 10, repMax: 15, restSeconds: 90  },
          { name: 'DB Lateral Raise',             setsByWeek: SI, repMin: 15, repMax: 20, restSeconds: 60  },
          { name: 'Rope Pushdown',                setsByWeek: SI, repMin: 12, repMax: 15, restSeconds: 60  },
          { name: 'Cable Fly High-to-Low',        setsByWeek: SI, repMin: 12, repMax: 15, restSeconds: 60  },
        ],
      },
      {
        dayOfWeek: 4,
        title: 'Quad Focus B + Posterior Chain',
        exercises: [
          // ── Priority compounds ──
          { name: 'Hack Squat Machine',           setsByWeek: PC, repMin: 8,  repMax: 12, restSeconds: 180 },
          { name: 'Bulgarian Split Squat',        setsByWeek: PC, repMin: 8,  repMax: 12, restSeconds: 120 },
          // ── Support compound ──
          { name: 'Barbell Hip Thrust',           setsByWeek: SC, repMin: 10, repMax: 15, restSeconds: 120 },
          // ── Priority isolation ──
          { name: 'Leg Extension',               setsByWeek: PI, repMin: 15, repMax: 20, restSeconds: 60  },
          // ── Support isolations ──
          { name: 'Seated Leg Curl',              setsByWeek: SI, repMin: 10, repMax: 15, restSeconds: 75  },
          { name: 'Standing Calf Raise',          setsByWeek: SI, repMin: 15, repMax: 20, restSeconds: 60  },
        ],
      },
      {
        dayOfWeek: 5,
        title: 'Upper Pull + Arms',
        exercises: [
          // ── Support compounds ──
          { name: 'Barbell Bent-Over Row',        setsByWeek: SC, repMin: 6,  repMax: 10, restSeconds: 120 },
          { name: 'Pull-Up',                      setsByWeek: SC, repMin: 6,  repMax: 10, restSeconds: 120 },
          { name: 'Lat Pulldown Wide Grip',       setsByWeek: SC, repMin: 10, repMax: 15, restSeconds: 90  },
          // ── Support isolations ──
          { name: 'EZ Bar Curl',                  setsByWeek: SI, repMin: 8,  repMax: 12, restSeconds: 60  },
          { name: 'Hammer Curl',                  setsByWeek: SI, repMin: 12, repMax: 15, restSeconds: 60  },
          { name: 'EZ Bar Skull Crusher',         setsByWeek: SI, repMin: 10, repMax: 15, restSeconds: 75  },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 5. HAMSTRING & GLUTE PRIORITY  — 4 days/week
  //    Hams + Glutes: 2x/week (priority) | Quads: 2x | Upper: 2x each
  // ════════════════════════════════════════════════════════════════════════════
  {
    title: 'Hamstring & Glute Priority',
    description: 'Posterior chain development is the focus — hip thrusts, hip hinges, and leg curl variations anchor the two lower body sessions. Hip thrusts and Romanian deadlifts open the priority sessions before quad and upper body work follows. All upper body muscle groups receive twice-weekly quality sessions. Hamstring and glute volume escalates in weeks 1–2; quad and upper body volume builds from week 3.',
    durationWeeks: 6,
    sessions: [
      {
        dayOfWeek: 1,
        title: 'Posterior Chain A — Hip Hinge + Quads',
        exercises: [
          // ── Priority compounds (hams/glutes first) ──
          { name: 'Romanian Deadlift',            setsByWeek: PC, repMin: 6,  repMax: 10, restSeconds: 180 },
          { name: 'Barbell Hip Thrust',           setsByWeek: PC, repMin: 10, repMax: 15, restSeconds: 120 },
          // ── Support compound ──
          { name: 'Barbell Back Squat',           setsByWeek: SC, repMin: 6,  repMax: 10, restSeconds: 180 },
          // ── Priority isolations ──
          { name: 'Lying Leg Curl',               setsByWeek: PI, repMin: 10, repMax: 15, restSeconds: 75  },
          { name: 'Cable Kickback',               setsByWeek: PI, repMin: 15, repMax: 20, restSeconds: 60  },
          // ── Support isolation ──
          { name: 'Leg Extension',               setsByWeek: SI, repMin: 15, repMax: 20, restSeconds: 60  },
        ],
      },
      {
        dayOfWeek: 2,
        title: 'Upper Push',
        exercises: [
          // ── Support compounds ──
          { name: 'Barbell Flat Bench Press',     setsByWeek: SC, repMin: 6,  repMax: 10, restSeconds: 120 },
          { name: 'Barbell Overhead Press',       setsByWeek: SC, repMin: 8,  repMax: 12, restSeconds: 120 },
          // ── Support isolations ──
          { name: 'DB Incline Press',             setsByWeek: SI, repMin: 10, repMax: 15, restSeconds: 90  },
          { name: 'DB Lateral Raise',             setsByWeek: SI, repMin: 15, repMax: 20, restSeconds: 60  },
          { name: 'Rope Pushdown',                setsByWeek: SI, repMin: 12, repMax: 15, restSeconds: 60  },
          { name: 'Pec Deck Machine',             setsByWeek: SI, repMin: 12, repMax: 20, restSeconds: 60  },
        ],
      },
      {
        dayOfWeek: 4,
        title: 'Posterior Chain B — Isolation + Quads B',
        exercises: [
          // ── Priority compounds ──
          { name: 'Stiff-Leg Deadlift',           setsByWeek: PC, repMin: 8,  repMax: 12, restSeconds: 120 },
          { name: 'Machine Hip Thrust',           setsByWeek: PC, repMin: 10, repMax: 15, restSeconds: 120 },
          // ── Support compound ──
          { name: 'Bulgarian Split Squat',        setsByWeek: SC, repMin: 8,  repMax: 12, restSeconds: 120 },
          // ── Priority isolations ──
          { name: 'Seated Leg Curl',              setsByWeek: PI, repMin: 10, repMax: 15, restSeconds: 75  },
          { name: 'Reverse Hyperextension',       setsByWeek: PI, repMin: 12, repMax: 15, restSeconds: 75  },
          // ── Support isolation ──
          { name: 'Leg Press Low Foot',           setsByWeek: SI, repMin: 10, repMax: 15, restSeconds: 90  },
        ],
      },
      {
        dayOfWeek: 5,
        title: 'Upper Pull + Arms',
        exercises: [
          // ── Support compounds ──
          { name: 'Barbell Bent-Over Row',        setsByWeek: SC, repMin: 6,  repMax: 10, restSeconds: 120 },
          { name: 'Pull-Up',                      setsByWeek: SC, repMin: 6,  repMax: 10, restSeconds: 120 },
          { name: 'Lat Pulldown Wide Grip',       setsByWeek: SC, repMin: 10, repMax: 15, restSeconds: 90  },
          // ── Support isolations ──
          { name: 'EZ Bar Curl',                  setsByWeek: SI, repMin: 8,  repMax: 12, restSeconds: 60  },
          { name: 'Hammer Curl',                  setsByWeek: SI, repMin: 12, repMax: 15, restSeconds: 60  },
          { name: 'V-Bar Pushdown',              setsByWeek: SI, repMin: 12, repMax: 15, restSeconds: 60  },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 6. SHOULDERS PRIORITY  — 5 days/week
  //    Shoulders: 3x/week (priority) | Chest: 2x | Back: 2x | Arms: 2x | Legs: 2x
  // ════════════════════════════════════════════════════════════════════════════
  {
    title: 'Shoulders Priority',
    description: 'All three deltoid heads — front, lateral, and rear — receive focused attention three times per week. Overhead press variations lead shoulder sessions, followed by lateral and rear delt isolation work that progressively increases each week. Chest, back, arms, and legs are each trained twice weekly. Shoulder volume spikes in weeks 1–2 while other muscle groups build volume starting week 3 to reach a shared peak by week 5.',
    durationWeeks: 6,
    sessions: [
      {
        dayOfWeek: 1,
        title: 'Shoulders A + Chest + Triceps',
        exercises: [
          // ── Priority compound ──
          { name: 'Barbell Overhead Press',       setsByWeek: PC, repMin: 5,  repMax: 10, restSeconds: 180 },
          // ── Support compound ──
          { name: 'Barbell Flat Bench Press',     setsByWeek: SC, repMin: 6,  repMax: 10, restSeconds: 120 },
          // ── Priority isolations ──
          { name: 'DB Lateral Raise',             setsByWeek: PI, repMin: 15, repMax: 20, restSeconds: 60  },
          { name: 'Cable Rear Delt Fly',          setsByWeek: PI, repMin: 15, repMax: 20, restSeconds: 60  },
          // ── Support isolations ──
          { name: 'Cable Fly Low-to-High',        setsByWeek: SI, repMin: 12, repMax: 15, restSeconds: 60  },
          { name: 'Rope Pushdown',                setsByWeek: SI, repMin: 12, repMax: 15, restSeconds: 60  },
        ],
      },
      {
        dayOfWeek: 2,
        title: 'Back + Biceps + Rear Delts A',
        exercises: [
          // ── Support compounds ──
          { name: 'Barbell Bent-Over Row',        setsByWeek: SC, repMin: 6,  repMax: 10, restSeconds: 120 },
          { name: 'Pull-Up',                      setsByWeek: SC, repMin: 6,  repMax: 10, restSeconds: 120 },
          // ── Priority isolation (rear delts — shoulders) ──
          { name: 'Reverse Pec Deck',             setsByWeek: PI, repMin: 15, repMax: 20, restSeconds: 60  },
          // ── Support isolations ──
          { name: 'Lat Pulldown Wide Grip',       setsByWeek: SI, repMin: 10, repMax: 15, restSeconds: 90  },
          { name: 'Barbell Curl',                 setsByWeek: SI, repMin: 8,  repMax: 12, restSeconds: 60  },
          { name: 'Hammer Curl',                  setsByWeek: SI, repMin: 12, repMax: 15, restSeconds: 60  },
        ],
      },
      {
        dayOfWeek: 3,
        title: 'Shoulders B + Legs',
        exercises: [
          // ── Priority compound ──
          { name: 'DB Overhead Press',            setsByWeek: PC, repMin: 8,  repMax: 12, restSeconds: 120 },
          // ── Support compound ──
          { name: 'Barbell Back Squat',           setsByWeek: SC, repMin: 6,  repMax: 10, restSeconds: 180 },
          // ── Priority isolations ──
          { name: 'Machine Lateral Raise',        setsByWeek: PI, repMin: 15, repMax: 20, restSeconds: 60  },
          { name: 'Face Pull',                    setsByWeek: PI, repMin: 15, repMax: 20, restSeconds: 60  },
          // ── Support isolations ──
          { name: 'Romanian Deadlift',            setsByWeek: SI, repMin: 8,  repMax: 12, restSeconds: 120 },
          { name: 'Leg Extension',               setsByWeek: SI, repMin: 15, repMax: 20, restSeconds: 60  },
        ],
      },
      {
        dayOfWeek: 4,
        title: 'Chest B + Triceps B + Back B',
        exercises: [
          // ── Support compounds ──
          { name: 'Barbell Incline Bench Press',  setsByWeek: SC, repMin: 8,  repMax: 12, restSeconds: 120 },
          { name: 'DB Single-Arm Row',            setsByWeek: SC, repMin: 8,  repMax: 12, restSeconds: 90  },
          // ── Support isolations ──
          { name: 'Pec Deck Machine',             setsByWeek: SI, repMin: 12, repMax: 20, restSeconds: 60  },
          { name: 'Cable Row Neutral Grip',       setsByWeek: SI, repMin: 10, repMax: 15, restSeconds: 75  },
          { name: 'EZ Bar Skull Crusher',         setsByWeek: SI, repMin: 10, repMax: 15, restSeconds: 75  },
          { name: 'Lying Leg Curl',               setsByWeek: SI, repMin: 10, repMax: 15, restSeconds: 75  },
        ],
      },
      {
        dayOfWeek: 5,
        title: 'Shoulders C + Rear Delts B + Biceps B',
        exercises: [
          // ── Priority compound ──
          { name: 'Arnold Press',                 setsByWeek: PC, repMin: 8,  repMax: 12, restSeconds: 90  },
          // ── Priority isolations ──
          { name: 'Cable Lateral Raise',          setsByWeek: PI, repMin: 15, repMax: 20, restSeconds: 60  },
          { name: 'DB Rear Delt Fly',             setsByWeek: PI, repMin: 15, repMax: 20, restSeconds: 60  },
          { name: 'DB Front Raise',               setsByWeek: PI, repMin: 12, repMax: 15, restSeconds: 60  },
          // ── Support isolations ──
          { name: 'Incline DB Curl',              setsByWeek: SI, repMin: 10, repMax: 15, restSeconds: 60  },
          { name: 'Barbell Hip Thrust',           setsByWeek: SI, repMin: 10, repMax: 15, restSeconds: 90  },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 7. FULL BODY PRIORITY  — 3 days/week
  //    Every muscle hit 3x/week — balanced hypertrophy across all groups
  // ════════════════════════════════════════════════════════════════════════════
  {
    title: 'Full Body Priority',
    description: 'A 3-day full body program where every major muscle group is trained each session, giving each muscle 3x weekly stimulus. Compound movements anchor every session and rotate between A, B, and C variations to ensure complete development. Ideal for anyone with a condensed schedule who wants well-rounded hypertrophy across the entire body. Volume increases on all movements simultaneously each week.',
    durationWeeks: 6,
    sessions: [
      {
        dayOfWeek: 1,
        title: 'Full Body A',
        exercises: [
          // ── Compounds first ──
          { name: 'Barbell Back Squat',           setsByWeek: SC, repMin: 5,  repMax: 10, restSeconds: 180 },
          { name: 'Barbell Flat Bench Press',     setsByWeek: SC, repMin: 6,  repMax: 10, restSeconds: 120 },
          { name: 'Barbell Bent-Over Row',        setsByWeek: SC, repMin: 6,  repMax: 10, restSeconds: 120 },
          { name: 'Barbell Overhead Press',       setsByWeek: SC, repMin: 8,  repMax: 12, restSeconds: 90  },
          // ── Isolations ──
          { name: 'EZ Bar Curl',                  setsByWeek: SI, repMin: 8,  repMax: 12, restSeconds: 60  },
          { name: 'Rope Pushdown',                setsByWeek: SI, repMin: 12, repMax: 15, restSeconds: 60  },
        ],
      },
      {
        dayOfWeek: 3,
        title: 'Full Body B',
        exercises: [
          // ── Compounds first ──
          { name: 'Romanian Deadlift',            setsByWeek: SC, repMin: 6,  repMax: 10, restSeconds: 180 },
          { name: 'Barbell Incline Bench Press',  setsByWeek: SC, repMin: 8,  repMax: 12, restSeconds: 120 },
          { name: 'Pull-Up',                      setsByWeek: SC, repMin: 6,  repMax: 10, restSeconds: 120 },
          { name: 'Barbell Hip Thrust',           setsByWeek: SC, repMin: 10, repMax: 15, restSeconds: 90  },
          // ── Isolations ──
          { name: 'DB Lateral Raise',             setsByWeek: SI, repMin: 15, repMax: 20, restSeconds: 60  },
          { name: 'Incline DB Curl',              setsByWeek: SI, repMin: 10, repMax: 15, restSeconds: 60  },
        ],
      },
      {
        dayOfWeek: 5,
        title: 'Full Body C',
        exercises: [
          // ── Compounds first ──
          { name: 'Hack Squat Machine',           setsByWeek: SC, repMin: 8,  repMax: 12, restSeconds: 180 },
          { name: 'DB Flat Press',                setsByWeek: SC, repMin: 10, repMax: 15, restSeconds: 90  },
          { name: 'DB Single-Arm Row',            setsByWeek: SC, repMin: 8,  repMax: 12, restSeconds: 90  },
          { name: 'DB Overhead Press',            setsByWeek: SC, repMin: 8,  repMax: 12, restSeconds: 90  },
          // ── Isolations ──
          { name: 'Leg Extension',               setsByWeek: SI, repMin: 15, repMax: 20, restSeconds: 60  },
          { name: 'Hammer Curl',                  setsByWeek: SI, repMin: 12, repMax: 15, restSeconds: 60  },
        ],
      },
    ],
  },
]

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(_req: NextRequest) {
  // Auth check via regular (RLS) client
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (userData?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = await createAdminClient()

  // ── Step 1: Upsert exercises into the library ─────────────────────────────
  const exercisePayload = EXERCISES_TO_SEED.map(e => ({ ...e, is_archived: false }))
  await admin.from('exercises').upsert(exercisePayload, { onConflict: 'name', ignoreDuplicates: false })

  // ── Step 2: Reload full exercise pool (name → id) ─────────────────────────
  const { data: allExercises } = await admin
    .from('exercises')
    .select('id, name')
    .eq('is_archived', false)

  if (!allExercises || allExercises.length === 0) {
    return NextResponse.json({ error: 'No exercises found after seeding.' }, { status: 500 })
  }

  const exMap = new Map<string, string>()
  for (const ex of allExercises) exMap.set(ex.name.toLowerCase(), ex.id)

  function findId(name: string): string | null {
    return exMap.get(name.toLowerCase()) ?? null
  }

  // ── Step 3: Delete any existing programs with matching titles ─────────────
  const titles = PROGRAMS.map(p => p.title)
  const { data: existing } = await admin.from('programs').select('id').in('title', titles)
  if (existing && existing.length > 0) {
    await admin.from('programs').delete().in('id', existing.map(p => p.id))
  }

  // ── Step 4: Create programs with per-week volume progression ──────────────
  const created: string[] = []
  const errors: string[] = []

  for (const programDef of PROGRAMS) {
    try {
      const { data: program, error: pErr } = await admin
        .from('programs')
        .insert({
          title: programDef.title,
          description: programDef.description,
          price_cents: 0,
          duration_weeks: programDef.durationWeeks,
          is_published: true,
        })
        .select()
        .single()

      if (pErr || !program) {
        errors.push(`${programDef.title}: ${pErr?.message ?? 'insert failed'}`)
        continue
      }

      for (let w = 0; w < programDef.durationWeeks; w++) {
        const weekNum = w + 1
        const { data: week, error: wErr } = await admin
          .from('program_weeks')
          .insert({ program_id: program.id, week_number: weekNum, title: `Week ${weekNum}` })
          .select()
          .single()

        if (wErr || !week) continue

        for (const sessionDef of programDef.sessions) {
          const { data: session, error: sErr } = await admin
            .from('program_sessions')
            .insert({
              program_week_id: week.id,
              day_of_week: sessionDef.dayOfWeek,
              title: sessionDef.title,
              session_order: sessionDef.dayOfWeek,
            })
            .select()
            .single()

          if (sErr || !session) continue

          const exerciseRows: {
            session_id: string
            exercise_id: string
            exercise_order: number
            prescribed_sets: number
            rep_range_min: number
            rep_range_max: number
            rest_seconds: number
            notes: null
          }[] = []

          for (let i = 0; i < sessionDef.exercises.length; i++) {
            const slot = sessionDef.exercises[i]
            const exId = findId(slot.name)
            if (!exId) continue

            exerciseRows.push({
              session_id: session.id,
              exercise_id: exId,
              exercise_order: i + 1,
              prescribed_sets: slot.setsByWeek[w] ?? slot.setsByWeek[slot.setsByWeek.length - 1],
              rep_range_min: slot.repMin,
              rep_range_max: slot.repMax,
              rest_seconds: slot.restSeconds,
              notes: null,
            })
          }

          if (exerciseRows.length > 0) {
            await admin.from('session_exercises').insert(exerciseRows)
          }
        }
      }

      created.push(programDef.title)
    } catch (err) {
      errors.push(`${programDef.title}: ${err instanceof Error ? err.message : 'unknown error'}`)
    }
  }

  return NextResponse.json({
    message: `Seeded ${created.length} programs and ${EXERCISES_TO_SEED.length} exercises`,
    created,
    exercisesSeeded: EXERCISES_TO_SEED.length,
    ...(errors.length > 0 && { errors }),
  })
}
