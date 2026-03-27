-- ============================================================
-- NexoPro — Migration 006: Billing (Stripe)
-- ============================================================

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS stripe_customer_id     TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_price_id        TEXT,
  ADD COLUMN IF NOT EXISTS billing_cycle_anchor   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end   BOOLEAN NOT NULL DEFAULT FALSE;

-- Index para lookup por customer_id nos webhooks
CREATE UNIQUE INDEX IF NOT EXISTS tenants_stripe_customer_id_idx
  ON tenants(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
