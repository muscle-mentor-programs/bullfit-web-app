// ─── Database Types ───────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'client'
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'
export type ChatRoomType = 'group' | 'direct' | 'admin_direct'
export type SetByType = 'self' | 'admin'
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid'

export interface User {
  id: string
  email: string
  name: string
  avatar_url: string | null
  role: UserRole
  stripe_customer_id: string | null
  created_at: string
}

export interface Program {
  id: string
  title: string
  description: string
  price_cents: number
  duration_weeks: number
  cover_image_url: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface ProgramWeek {
  id: string
  program_id: string
  week_number: number
  title: string
  description: string | null
}

export interface ProgramSession {
  id: string
  program_week_id: string
  day_of_week: number // 1=Mon ... 7=Sun
  title: string
  description: string | null
  session_order: number
}

export interface Exercise {
  id: string
  name: string
  muscle_groups: string[]
  equipment: string[]
  description: string | null
  youtube_url: string | null
  is_archived: boolean
  created_at: string
}

export interface SessionExercise {
  id: string
  session_id: string
  exercise_id: string
  exercise_order: number
  prescribed_sets: number
  rep_range_min: number
  rep_range_max: number
  notes: string | null
  rest_seconds: number | null
  // Joined
  exercise?: Exercise
}

export interface UserProgram {
  id: string
  user_id: string
  program_id: string
  stripe_payment_intent_id: string | null
  purchased_at: string
  start_date: string
  // Joined
  program?: Program
}

export interface Subscription {
  id: string
  user_id: string
  stripe_subscription_id: string
  stripe_customer_id: string | null
  status: SubscriptionStatus
  trial_end: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
  // Joined
  user?: User
}

export interface UserSession {
  id: string
  user_id: string
  program_session_id: string
  scheduled_date: string
  started_at: string | null
  completed_at: string | null
  // Joined
  program_session?: ProgramSession & {
    program_week?: ProgramWeek & {
      program?: Program
    }
  }
}

export interface UserExerciseLog {
  id: string
  user_session_id: string
  session_exercise_id: string
  exercise_id: string
  exercise_order: number
  // Joined
  exercise?: Exercise
  session_exercise?: SessionExercise
  set_logs?: UserSetLog[]
}

export interface UserSetLog {
  id: string
  user_exercise_log_id: string
  set_number: number
  weight_lbs: number | null
  reps: number | null
  completed: boolean
  logged_at: string | null
}

export interface ChatRoom {
  id: string
  type: ChatRoomType
  program_id: string | null
  name: string
  // Joined
  members?: ChatRoomMember[]
  last_message?: ChatMessage
  unread_count?: number
}

export interface ChatRoomMember {
  id: string
  chat_room_id: string
  user_id: string
  joined_at: string
  // Joined
  user?: User
}

export interface ChatMessage {
  id: string
  chat_room_id: string
  sender_id: string
  content: string
  created_at: string
  // Joined
  sender?: User
}

export interface UserNutritionGoals {
  id: string
  user_id: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  set_by: SetByType
  effective_date: string
}

export interface FoodLogEntry {
  id: string
  user_id: string
  log_date: string
  meal_type: MealType
  food_name: string
  usda_food_id: string | null
  serving_amount: number
  serving_unit: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  logged_at: string
}

export interface UserMetric {
  id: string
  user_id: string
  recorded_date: string
  weight_lbs: number | null
  notes: string | null
}

// ─── UI / App State Types ─────────────────────────────────────────────────────

export interface MacroTotals {
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

// Active workout state (in-memory during a session)
export interface ActiveSetState {
  setNumber: number
  weightLbs: string
  reps: string
  completed: boolean
}

export interface ActiveExerciseState {
  sessionExerciseId: string
  exerciseId: string
  exerciseOrder: number
  sets: ActiveSetState[]
  exercise: Exercise
  prescribedSets: number
  repRangeMin: number
  repRangeMax: number
  notes: string | null       // coach-prescribed notes (read-only)
  restSeconds: number | null
  clientNotes: string        // user's personal workout notes
}

// ─── USDA API Types ───────────────────────────────────────────────────────────

export interface UsdaFoodSearchResult {
  fdcId: string
  description: string
  brandName?: string
  servingSize?: number
  servingSizeUnit?: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  verified?: boolean  // true when data comes from an admin-approved food_override
}

export type CorrectionStatus = 'pending' | 'approved' | 'rejected'

export interface FoodOverride {
  id: string
  food_id: string
  food_name: string
  brand_name: string | null
  serving_size: number | null
  serving_size_unit: string | null
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  approved_by: string | null
  created_at: string
  updated_at: string
}

export interface FoodCorrection {
  id: string
  user_id: string
  food_id: string
  original_name: string
  corrected_name: string
  corrected_brand: string | null
  corrected_serving_size: number | null
  corrected_serving_unit: string | null
  corrected_calories: number
  corrected_protein_g: number
  corrected_carbs_g: number
  corrected_fat_g: number
  notes: string | null
  status: CorrectionStatus
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  // Joined
  user?: Pick<User, 'id' | 'name' | 'email'>
}

export interface UsdaSearchResponse {
  foods: UsdaFoodSearchResult[]
  totalHits: number
}

// ─── Supabase Database Type (used with createClient<Database>) ────────────────

export type Database = {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'created_at'>
        Update: Partial<Omit<User, 'id' | 'created_at'>>
      }
      programs: {
        Row: Program
        Insert: Omit<Program, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Program, 'id' | 'created_at' | 'updated_at'>>
      }
      program_weeks: {
        Row: ProgramWeek
        Insert: Omit<ProgramWeek, 'id'>
        Update: Partial<Omit<ProgramWeek, 'id'>>
      }
      program_sessions: {
        Row: ProgramSession
        Insert: Omit<ProgramSession, 'id'>
        Update: Partial<Omit<ProgramSession, 'id'>>
      }
      exercises: {
        Row: Exercise
        Insert: Omit<Exercise, 'id' | 'created_at'>
        Update: Partial<Omit<Exercise, 'id' | 'created_at'>>
      }
      session_exercises: {
        Row: SessionExercise
        Insert: Omit<SessionExercise, 'id'>
        Update: Partial<Omit<SessionExercise, 'id'>>
      }
      user_programs: {
        Row: UserProgram
        Insert: Omit<UserProgram, 'id' | 'purchased_at'>
        Update: Partial<Omit<UserProgram, 'id' | 'purchased_at'>>
      }
      user_sessions: {
        Row: UserSession
        Insert: Omit<UserSession, 'id'>
        Update: Partial<Omit<UserSession, 'id'>>
      }
      user_exercise_logs: {
        Row: UserExerciseLog
        Insert: Omit<UserExerciseLog, 'id'>
        Update: Partial<Omit<UserExerciseLog, 'id'>>
      }
      user_set_logs: {
        Row: UserSetLog
        Insert: Omit<UserSetLog, 'id'>
        Update: Partial<Omit<UserSetLog, 'id'>>
      }
      chat_rooms: {
        Row: ChatRoom
        Insert: Omit<ChatRoom, 'id'>
        Update: Partial<Omit<ChatRoom, 'id'>>
      }
      chat_room_members: {
        Row: ChatRoomMember
        Insert: Omit<ChatRoomMember, 'id' | 'joined_at'>
        Update: Partial<Omit<ChatRoomMember, 'id' | 'joined_at'>>
      }
      chat_messages: {
        Row: ChatMessage
        Insert: Omit<ChatMessage, 'id' | 'created_at'>
        Update: Partial<Omit<ChatMessage, 'id' | 'created_at'>>
      }
      user_nutrition_goals: {
        Row: UserNutritionGoals
        Insert: Omit<UserNutritionGoals, 'id'>
        Update: Partial<Omit<UserNutritionGoals, 'id'>>
      }
      food_log_entries: {
        Row: FoodLogEntry
        Insert: Omit<FoodLogEntry, 'id' | 'logged_at'>
        Update: Partial<Omit<FoodLogEntry, 'id' | 'logged_at'>>
      }
      user_metrics: {
        Row: UserMetric
        Insert: Omit<UserMetric, 'id'>
        Update: Partial<Omit<UserMetric, 'id'>>
      }
      subscriptions: {
        Row: Subscription
        Insert: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Subscription, 'id' | 'created_at' | 'updated_at'>>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
