-- Migration: Add meal ratings table
-- This table stores user ratings and feedback for individual meals

CREATE TABLE public.meal_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_id UUID NOT NULL REFERENCES public.meals(id) ON DELETE CASCADE,
  baby_id UUID NOT NULL REFERENCES public.babies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  taste_feedback TEXT CHECK (taste_feedback IN ('loved', 'liked', 'neutral', 'disliked', 'rejected')),
  would_make_again BOOLEAN,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(meal_id, baby_id)
);

-- Enable RLS
ALTER TABLE public.meal_ratings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own ratings" ON public.meal_ratings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own ratings" ON public.meal_ratings
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own ratings" ON public.meal_ratings
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own ratings" ON public.meal_ratings
  FOR DELETE USING (user_id = auth.uid());

-- Indexes for efficient queries
CREATE INDEX idx_meal_ratings_meal_id ON public.meal_ratings(meal_id);
CREATE INDEX idx_meal_ratings_baby_id ON public.meal_ratings(baby_id);
CREATE INDEX idx_meal_ratings_user_id ON public.meal_ratings(user_id);
CREATE INDEX idx_meal_ratings_rating ON public.meal_ratings(baby_id, rating);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_meal_ratings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER trigger_meal_ratings_updated_at
  BEFORE UPDATE ON public.meal_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_meal_ratings_updated_at();
