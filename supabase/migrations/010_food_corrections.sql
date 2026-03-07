-- ─── Food Overrides ──────────────────────────────────────────────────────────
-- Stores admin-verified food data that overrides external API results.
-- Keyed by food_id which is either a USDA fdcId or a barcode string.

CREATE TABLE IF NOT EXISTS food_overrides (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id           TEXT NOT NULL UNIQUE,   -- USDA fdcId or barcode
  food_name         TEXT NOT NULL,
  brand_name        TEXT,
  serving_size      NUMERIC,
  serving_size_unit TEXT,
  calories          NUMERIC NOT NULL,
  protein_g         NUMERIC NOT NULL,
  carbs_g           NUMERIC NOT NULL,
  fat_g             NUMERIC NOT NULL,
  approved_by       UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE food_overrides ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read verified overrides (so the search API works)
CREATE POLICY "Authenticated users can read food overrides"
  ON food_overrides FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can manage food overrides"
  ON food_overrides FOR ALL
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── Food Corrections ─────────────────────────────────────────────────────────
-- User-submitted corrections pending admin review.

CREATE TABLE IF NOT EXISTS food_corrections (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  food_id                TEXT NOT NULL,           -- USDA fdcId or barcode
  original_name          TEXT NOT NULL,
  corrected_name         TEXT NOT NULL,
  corrected_brand        TEXT,
  corrected_serving_size NUMERIC,
  corrected_serving_unit TEXT,
  corrected_calories     NUMERIC NOT NULL,
  corrected_protein_g    NUMERIC NOT NULL,
  corrected_carbs_g      NUMERIC NOT NULL,
  corrected_fat_g        NUMERIC NOT NULL,
  notes                  TEXT,
  status                 TEXT NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by            UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at            TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE food_corrections ENABLE ROW LEVEL SECURITY;

-- Users can submit corrections
CREATE POLICY "Users can submit corrections"
  ON food_corrections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own corrections
CREATE POLICY "Users can view own corrections"
  ON food_corrections FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all corrections
CREATE POLICY "Admins can view all corrections"
  ON food_corrections FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins can update corrections (approve/reject)
CREATE POLICY "Admins can update corrections"
  ON food_corrections FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
