-- Migration 009: Add client notes column to user_exercise_logs
-- Allows clients to write personal notes on each exercise during a session.

ALTER TABLE user_exercise_logs
  ADD COLUMN IF NOT EXISTS notes TEXT;
