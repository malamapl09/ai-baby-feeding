-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  stripe_customer_id TEXT,
  subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro_monthly', 'pro_annual', 'lifetime')),
  subscription_status TEXT CHECK (subscription_status IN ('active', 'canceled', 'past_due')),
  plans_generated_this_week INTEGER DEFAULT 0,
  week_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Babies table
CREATE TABLE public.babies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birthdate DATE NOT NULL,
  country TEXT DEFAULT 'US',
  allergies TEXT[] DEFAULT '{}',
  feeding_goal TEXT DEFAULT 'balanced_nutrition' CHECK (feeding_goal IN ('balanced_nutrition', 'weight_gain', 'food_variety', 'picky_eater')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Foods reference table
CREATE TABLE public.foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('fruits', 'vegetables', 'proteins', 'grains', 'dairy', 'legumes', 'other')),
  age_min_months INTEGER DEFAULT 6,
  is_common_allergen BOOLEAN DEFAULT FALSE,
  choking_risk TEXT DEFAULT 'low' CHECK (choking_risk IN ('low', 'medium', 'high')),
  prep_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Baby foods (tracking which foods a baby has tried)
CREATE TABLE public.baby_foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  baby_id UUID NOT NULL REFERENCES public.babies(id) ON DELETE CASCADE,
  food_id UUID NOT NULL REFERENCES public.foods(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'tried' CHECK (status IN ('tried', 'liked', 'disliked', 'allergic')),
  reaction_notes TEXT,
  date_introduced DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(baby_id, food_id)
);

-- Meal plans
CREATE TABLE public.meal_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  baby_id UUID NOT NULL REFERENCES public.babies(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  goal TEXT NOT NULL,
  days INTEGER NOT NULL CHECK (days IN (3, 7)),
  regenerations_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meals within a plan
CREATE TABLE public.meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES public.meal_plans(id) ON DELETE CASCADE,
  day_index INTEGER NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  title TEXT NOT NULL,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipes for meals
CREATE TABLE public.recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_id UUID NOT NULL REFERENCES public.meals(id) ON DELETE CASCADE UNIQUE,
  ingredients JSONB NOT NULL DEFAULT '[]',
  instructions TEXT[] NOT NULL DEFAULT '{}',
  prep_time_minutes INTEGER DEFAULT 15,
  texture_notes TEXT,
  choking_hazard_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grocery lists
CREATE TABLE public.grocery_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES public.meal_plans(id) ON DELETE CASCADE UNIQUE,
  items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.babies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.baby_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grocery_lists ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Babies policies
CREATE POLICY "Users can view own babies" ON public.babies
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create babies" ON public.babies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own babies" ON public.babies
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own babies" ON public.babies
  FOR DELETE USING (auth.uid() = user_id);

-- Baby foods policies
CREATE POLICY "Users can view baby foods" ON public.baby_foods
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.babies WHERE babies.id = baby_foods.baby_id AND babies.user_id = auth.uid())
  );

CREATE POLICY "Users can manage baby foods" ON public.baby_foods
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.babies WHERE babies.id = baby_foods.baby_id AND babies.user_id = auth.uid())
  );

-- Meal plans policies
CREATE POLICY "Users can view own meal plans" ON public.meal_plans
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.babies WHERE babies.id = meal_plans.baby_id AND babies.user_id = auth.uid())
  );

CREATE POLICY "Users can manage own meal plans" ON public.meal_plans
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.babies WHERE babies.id = meal_plans.baby_id AND babies.user_id = auth.uid())
  );

-- Meals policies
CREATE POLICY "Users can view own meals" ON public.meals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.meal_plans mp
      JOIN public.babies b ON b.id = mp.baby_id
      WHERE mp.id = meals.plan_id AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own meals" ON public.meals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.meal_plans mp
      JOIN public.babies b ON b.id = mp.baby_id
      WHERE mp.id = meals.plan_id AND b.user_id = auth.uid()
    )
  );

-- Recipes policies
CREATE POLICY "Users can view own recipes" ON public.recipes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.meals m
      JOIN public.meal_plans mp ON mp.id = m.plan_id
      JOIN public.babies b ON b.id = mp.baby_id
      WHERE m.id = recipes.meal_id AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own recipes" ON public.recipes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.meals m
      JOIN public.meal_plans mp ON mp.id = m.plan_id
      JOIN public.babies b ON b.id = mp.baby_id
      WHERE m.id = recipes.meal_id AND b.user_id = auth.uid()
    )
  );

-- Grocery lists policies
CREATE POLICY "Users can view own grocery lists" ON public.grocery_lists
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.meal_plans mp
      JOIN public.babies b ON b.id = mp.baby_id
      WHERE mp.id = grocery_lists.plan_id AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own grocery lists" ON public.grocery_lists
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.meal_plans mp
      JOIN public.babies b ON b.id = mp.baby_id
      WHERE mp.id = grocery_lists.plan_id AND b.user_id = auth.uid()
    )
  );

-- Foods table is public read (no auth needed)
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view foods" ON public.foods
  FOR SELECT USING (true);

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_babies_updated_at
  BEFORE UPDATE ON public.babies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_baby_foods_updated_at
  BEFORE UPDATE ON public.baby_foods
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_grocery_lists_updated_at
  BEFORE UPDATE ON public.grocery_lists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Indexes for performance
CREATE INDEX idx_babies_user_id ON public.babies(user_id);
CREATE INDEX idx_baby_foods_baby_id ON public.baby_foods(baby_id);
CREATE INDEX idx_meal_plans_baby_id ON public.meal_plans(baby_id);
CREATE INDEX idx_meals_plan_id ON public.meals(plan_id);
CREATE INDEX idx_foods_category ON public.foods(category);
