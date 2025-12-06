-- Migration: Add nutrition_info column to recipes table
-- This stores baby-focused nutrition data (macros + key micronutrients)

-- Add nutrition_info column as JSONB
ALTER TABLE public.recipes
ADD COLUMN nutrition_info JSONB DEFAULT NULL;

-- Add GIN index for efficient querying
CREATE INDEX idx_recipes_nutrition ON public.recipes USING GIN (nutrition_info);

-- Add comment explaining the column structure
COMMENT ON COLUMN public.recipes.nutrition_info IS
  'JSON object containing nutrition data: calories, protein_grams, carbs_grams, fat_grams, fiber_grams, iron_mg, calcium_mg, vitamin_a_mcg, vitamin_c_mg, vitamin_d_mcg, serving_size, age_appropriate_notes';
