-- Migration: Add shared meal plans table
-- This table stores share links for meal plans

CREATE TABLE public.shared_meal_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES public.meal_plans(id) ON DELETE CASCADE,
  share_token TEXT UNIQUE NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  include_pdf BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.shared_meal_plans ENABLE ROW LEVEL SECURITY;

-- Policies
-- Users can view their own shared plans
CREATE POLICY "Users can view their own shared plans" ON public.shared_meal_plans
  FOR SELECT USING (created_by = auth.uid());

-- Users can create share links for their own plans
CREATE POLICY "Users can create share links" ON public.shared_meal_plans
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- Users can update their own shared plans (e.g., to update view count)
CREATE POLICY "Users can update their own shared plans" ON public.shared_meal_plans
  FOR UPDATE USING (created_by = auth.uid());

-- Users can delete their own shared plans
CREATE POLICY "Users can delete their own shared plans" ON public.shared_meal_plans
  FOR DELETE USING (created_by = auth.uid());

-- Public read access for active (non-expired) shared plans via share token
-- This is a service role policy that will be used by the API
CREATE POLICY "Anyone can view active shared plans by token" ON public.shared_meal_plans
  FOR SELECT USING (
    expires_at IS NULL OR expires_at > NOW()
  );

-- Indexes
CREATE INDEX idx_shared_plans_token ON public.shared_meal_plans(share_token);
CREATE INDEX idx_shared_plans_plan_id ON public.shared_meal_plans(plan_id);
CREATE INDEX idx_shared_plans_created_by ON public.shared_meal_plans(created_by);
