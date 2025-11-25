-- Migration: Add indexes and improved RLS policies for performance and security
-- Date: 2025-11-25

-- =============================================
-- PERFORMANCE INDEXES
-- =============================================

-- Index for fast Stripe webhook lookups
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id
  ON public.users(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- Index for food tracker queries
CREATE INDEX IF NOT EXISTS idx_baby_foods_food_id
  ON public.baby_foods(food_id);

CREATE INDEX IF NOT EXISTS idx_baby_foods_baby_id
  ON public.baby_foods(baby_id);

CREATE INDEX IF NOT EXISTS idx_baby_foods_status
  ON public.baby_foods(status);

-- Index for meal plan queries by date
CREATE INDEX IF NOT EXISTS idx_meal_plans_created_at
  ON public.meal_plans(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id_created
  ON public.meal_plans(user_id, created_at DESC);

-- Index for baby lookups
CREATE INDEX IF NOT EXISTS idx_babies_user_id
  ON public.babies(user_id);

-- Index for meals by plan
CREATE INDEX IF NOT EXISTS idx_meals_meal_plan_id
  ON public.meals(meal_plan_id);

-- Index for recipes by meal
CREATE INDEX IF NOT EXISTS idx_recipes_meal_id
  ON public.recipes(meal_id);

-- Index for grocery lists
CREATE INDEX IF NOT EXISTS idx_grocery_lists_user_id_created
  ON public.grocery_lists(user_id, created_at DESC);

-- =============================================
-- IMPROVED RLS POLICIES
-- =============================================

-- Drop existing baby_foods INSERT policy and add one with food validation
DROP POLICY IF EXISTS "Users can insert foods for their babies" ON public.baby_foods;

CREATE POLICY "Users can insert foods for their babies with validation" ON public.baby_foods
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.babies WHERE id = baby_id AND user_id = auth.uid())
    AND EXISTS (SELECT 1 FROM public.foods WHERE id = food_id)
  );

-- =============================================
-- DATA INTEGRITY CONSTRAINTS
-- =============================================

-- Create a table to track processed Stripe events (for idempotency)
CREATE TABLE IF NOT EXISTS public.stripe_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  payload JSONB
);

-- Index for fast event lookups
CREATE INDEX IF NOT EXISTS idx_stripe_events_event_id
  ON public.stripe_events(event_id);

-- RLS for stripe_events (only service role should access this)
ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;

-- No public access to stripe_events - only service role
CREATE POLICY "Service role only" ON public.stripe_events
  FOR ALL USING (false);

-- =============================================
-- TRIGGER: Ensure reaction_notes when status is allergic
-- =============================================

CREATE OR REPLACE FUNCTION check_allergic_reaction_notes()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'allergic' AND (NEW.reaction_notes IS NULL OR NEW.reaction_notes = '') THEN
    RAISE EXCEPTION 'reaction_notes is required when status is allergic';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_allergic_reaction_notes ON public.baby_foods;

CREATE TRIGGER enforce_allergic_reaction_notes
  BEFORE INSERT OR UPDATE ON public.baby_foods
  FOR EACH ROW
  EXECUTE FUNCTION check_allergic_reaction_notes();

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON INDEX idx_users_stripe_customer_id IS 'Fast lookup for Stripe webhook processing';
COMMENT ON INDEX idx_baby_foods_food_id IS 'Fast lookup for food tracker queries';
COMMENT ON TABLE public.stripe_events IS 'Tracks processed Stripe webhook events for idempotency';
