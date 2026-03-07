-- ─── Enable UUID extension ────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL DEFAULT '',
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client')),
  stripe_customer_id TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Programs ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS programs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  price_cents     INTEGER NOT NULL DEFAULT 0,
  duration_weeks  INTEGER NOT NULL DEFAULT 4 CHECK (duration_weeks BETWEEN 4 AND 8),
  cover_image_url TEXT,
  is_published    BOOLEAN NOT NULL DEFAULT FALSE,
  stripe_price_id TEXT,
  stripe_product_id TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Program Weeks ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS program_weeks (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id   UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  week_number  INTEGER NOT NULL,
  title        TEXT NOT NULL DEFAULT '',
  description  TEXT,
  UNIQUE(program_id, week_number)
);

-- ─── Program Sessions ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS program_sessions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_week_id  UUID NOT NULL REFERENCES program_weeks(id) ON DELETE CASCADE,
  day_of_week      INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1=Mon, 7=Sun
  title            TEXT NOT NULL,
  description      TEXT,
  session_order    INTEGER NOT NULL DEFAULT 0
);

-- ─── Exercise Library ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exercises (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  muscle_groups   TEXT[] NOT NULL DEFAULT '{}',
  equipment       TEXT[] NOT NULL DEFAULT '{}',
  description     TEXT,
  youtube_url     TEXT,
  is_archived     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Session Exercises (prescriptions) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS session_exercises (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id       UUID NOT NULL REFERENCES program_sessions(id) ON DELETE CASCADE,
  exercise_id      UUID NOT NULL REFERENCES exercises(id),
  exercise_order   INTEGER NOT NULL DEFAULT 0,
  prescribed_sets  INTEGER NOT NULL DEFAULT 3,
  rep_range_min    INTEGER NOT NULL DEFAULT 8,
  rep_range_max    INTEGER NOT NULL DEFAULT 12,
  notes            TEXT,
  rest_seconds     INTEGER
);

-- ─── User Programs (purchases) ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_programs (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  program_id                UUID NOT NULL REFERENCES programs(id),
  stripe_payment_intent_id  TEXT,
  purchased_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  start_date                DATE NOT NULL,
  UNIQUE(user_id, program_id)
);

-- ─── User Sessions (scheduled workouts) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_sessions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  program_session_id  UUID NOT NULL REFERENCES program_sessions(id),
  scheduled_date      DATE NOT NULL,
  started_at          TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_date
  ON user_sessions(user_id, scheduled_date);

-- ─── User Exercise Logs ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_exercise_logs (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_session_id      UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
  session_exercise_id  UUID REFERENCES session_exercises(id),
  exercise_id          UUID NOT NULL REFERENCES exercises(id),
  exercise_order       INTEGER NOT NULL DEFAULT 0
);

-- ─── User Set Logs ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_set_logs (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_exercise_log_id  UUID NOT NULL REFERENCES user_exercise_logs(id) ON DELETE CASCADE,
  set_number            INTEGER NOT NULL,
  weight_lbs            DECIMAL(6,2),
  reps                  INTEGER,
  completed             BOOLEAN NOT NULL DEFAULT FALSE,
  logged_at             TIMESTAMPTZ
);

-- ─── Chat Rooms ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_rooms (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type        TEXT NOT NULL CHECK (type IN ('group', 'direct', 'admin_direct')),
  program_id  UUID REFERENCES programs(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Chat Room Members ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_room_members (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_room_id  UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(chat_room_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_chat_room_members_user
  ON chat_room_members(user_id);

-- ─── Chat Messages ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_room_id  UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id     UUID NOT NULL REFERENCES users(id),
  content       TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_room_created
  ON chat_messages(chat_room_id, created_at DESC);

-- ─── User Nutrition Goals ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_nutrition_goals (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  calories        INTEGER NOT NULL DEFAULT 2000,
  protein_g       INTEGER NOT NULL DEFAULT 150,
  carbs_g         INTEGER NOT NULL DEFAULT 200,
  fat_g           INTEGER NOT NULL DEFAULT 65,
  set_by          TEXT NOT NULL DEFAULT 'self' CHECK (set_by IN ('self', 'admin')),
  effective_date  DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE INDEX IF NOT EXISTS idx_nutrition_goals_user_date
  ON user_nutrition_goals(user_id, effective_date DESC);

-- ─── Food Log Entries ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS food_log_entries (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  log_date        DATE NOT NULL,
  meal_type       TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_name       TEXT NOT NULL,
  usda_food_id    TEXT,
  serving_amount  DECIMAL(8,3) NOT NULL DEFAULT 1,
  serving_unit    TEXT NOT NULL DEFAULT 'serving',
  calories        DECIMAL(8,2) NOT NULL DEFAULT 0,
  protein_g       DECIMAL(8,2) NOT NULL DEFAULT 0,
  carbs_g         DECIMAL(8,2) NOT NULL DEFAULT 0,
  fat_g           DECIMAL(8,2) NOT NULL DEFAULT 0,
  logged_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_food_log_user_date
  ON food_log_entries(user_id, log_date);

-- ─── User Metrics ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_metrics (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recorded_date   DATE NOT NULL,
  weight_lbs      DECIMAL(6,2),
  notes           TEXT,
  UNIQUE(user_id, recorded_date)
);

-- ─── Updated_at trigger for programs ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER programs_updated_at
  BEFORE UPDATE ON programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Auto-create user row on auth signup ──────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
