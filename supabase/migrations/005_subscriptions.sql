-- ─── 005: Subscriptions ────────────────────────────────────────────────────
-- Flat $29.95/mo subscription model. All programs included with subscription.

CREATE TABLE subscriptions (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id  text        NOT NULL UNIQUE,
  stripe_customer_id      text,
  status                  text        NOT NULL DEFAULT 'trialing',
    -- trialing | active | past_due | canceled | unpaid
  trial_end               timestamptz,
  current_period_end      timestamptz,
  cancel_at_period_end    boolean     NOT NULL DEFAULT false,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users read their own subscription; admins read all
CREATE POLICY "Users view own subscription"
  ON subscriptions FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

-- Service role (webhook) can insert and update
CREATE POLICY "Service role manages subscriptions"
  ON subscriptions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ── Helper: does the current user have an active or trialing subscription? ──
CREATE OR REPLACE FUNCTION has_active_subscription()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM subscriptions
    WHERE user_id = auth.uid()
      AND status IN ('trialing', 'active')
      AND (current_period_end IS NULL OR current_period_end > now())
  );
$$;

-- ── Auto-update updated_at timestamp ────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_subscriptions_updated_at();
