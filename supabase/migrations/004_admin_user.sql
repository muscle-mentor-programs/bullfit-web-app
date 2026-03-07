-- ─── Migration 004: Admin user role marker ───────────────────────────────────
-- The actual admin user account is created via /api/admin/setup-user
-- (uses Supabase Admin SDK which handles password hashing correctly)
-- This migration is a placeholder to mark migration 004 as applied.
-- Run this after deploying: curl -X POST https://<your-domain>/api/admin/setup-user

-- Nothing to execute here; admin user is seeded via API on first deploy.
SELECT 1;
