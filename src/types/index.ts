// User Types
export interface User {
  id: string;
  email: string;
  stripe_customer_id: string | null;
  subscription_plan: 'free' | 'pro_monthly' | 'pro_annual' | 'lifetime';
  subscription_status: 'active' | 'canceled' | 'past_due' | null;
  created_at: string;
  updated_at: string;
}

// Baby Types
export interface Baby {
  id: string;
  user_id: string;
  name: string;
  birthdate: string;
  country: string;
  allergies: string[];
  feeding_goal: FeedingGoal;
  created_at: string;
  updated_at: string;
}

export type FeedingGoal =
  | 'balanced_nutrition'
  | 'weight_gain'
  | 'food_variety'
  | 'picky_eater';

// Food Types
export interface Food {
  id: string;
  name: string;
  category: FoodCategory;
  age_min_months: number;
  is_common_allergen: boolean;
  choking_risk: 'low' | 'medium' | 'high';
  prep_notes: string | null;
}

export type FoodCategory =
  | 'fruits'
  | 'vegetables'
  | 'proteins'
  | 'grains'
  | 'dairy'
  | 'legumes'
  | 'other';

export interface BabyFood {
  id: string;
  baby_id: string;
  food_id: string;
  status: 'tried' | 'liked' | 'disliked' | 'allergic';
  reaction_notes: string | null;
  date_introduced: string;
  food?: Food;
}

// Meal Plan Types
export interface MealPlan {
  id: string;
  baby_id: string;
  start_date: string;
  end_date: string;
  goal: FeedingGoal;
  days: number;
  created_at: string;
}

export interface Meal {
  id: string;
  plan_id: string;
  day_index: number;
  meal_type: MealType;
  title: string;
  summary: string;
  recipe?: Recipe;
}

// Note: 'snack' is kept for backward compatibility with existing meal plans
export type MealType = 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'snack';

export interface Recipe {
  id: string;
  meal_id: string;
  ingredients: Ingredient[];
  instructions: string[];
  prep_time_minutes: number;
  texture_notes: string | null;
  choking_hazard_notes: string | null;
  batch_info?: BatchInfo | null;
  family_version?: FamilyAdaptation | null;
  nutrition?: NutritionInfo | null;
}

// Family Meal Adaptation
export interface FamilyAdaptation {
  title: string;
  modifications: string;
  seasonings: string[];
  additional_ingredients?: string[];
  portion_multiplier: number;
  cooking_adjustments?: string;
}

export interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
  category: FoodCategory;
}

// Grocery List Types
export interface GroceryList {
  id: string;
  plan_id: string;
  items: GroceryItem[];
  created_at: string;
}

export interface GroceryItem {
  name: string;
  quantity: string;
  unit: string;
  category: FoodCategory;
  checked: boolean;
}

// AI Response Types
export interface AIGeneratedMealPlan {
  days: AIGeneratedDay[];
}

export interface AIGeneratedDay {
  day_index: number;
  date: string;
  meals: AIGeneratedMeal[];
}

export interface AIGeneratedMeal {
  meal_type: MealType;
  title: string;
  summary: string;
  ingredients: Ingredient[];
  instructions: string[];
  prep_time_minutes: number;
  texture_notes: string;
  new_food_introduced: string | null;
  // Batch cooking fields (only present when batchCookingMode is enabled)
  make_ahead_notes?: string;
  storage_instructions?: string;
  freezable?: boolean;
  reheat_instructions?: string;
  prep_day_tasks?: string[];
  // Family version (only present when includeFamilyVersion is enabled)
  family_version?: FamilyAdaptation;
  // Nutrition info
  nutrition: NutritionInfo;
}

// Batch Cooking Types
export interface BatchInfo {
  makeAheadNotes: string | null;
  storageInstructions: string | null;
  freezable: boolean;
  reheatInstructions: string | null;
  prepDayTasks: string[];
}

// Nutrition Types
export interface NutritionInfo {
  calories: number;
  protein_grams: number;
  carbs_grams: number;
  fat_grams: number;
  fiber_grams: number;
  // Baby-focused micronutrients
  iron_mg: number;
  calcium_mg: number;
  vitamin_a_mcg: number;
  vitamin_c_mg: number;
  vitamin_d_mcg: number;
  // Context
  serving_size: string;
  age_appropriate_notes: string | null;
}

// Meal Rating Types
export type TasteFeedback = 'loved' | 'liked' | 'neutral' | 'disliked' | 'rejected';

export interface MealRating {
  id: string;
  meal_id: string;
  baby_id: string;
  user_id: string;
  rating: number | null;
  taste_feedback: TasteFeedback | null;
  would_make_again: boolean | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MealRatingInput {
  mealId: string;
  babyId: string;
  rating?: number;
  tasteFeedback?: TasteFeedback;
  wouldMakeAgain?: boolean;
  notes?: string;
}

// Meal Swap Types
export type SwapReason = 'missing_ingredient' | 'dont_like' | 'want_variety' | 'dietary' | 'other';

export interface MealSwapSuggestion {
  title: string;
  summary: string;
  ingredients: Ingredient[];
  instructions: string[];
  prep_time_minutes: number;
  texture_notes: string;
  swap_reason: string;
  nutritional_comparison: string;
}

export interface MealSwapRequest {
  mealId: string;
  reason?: SwapReason;
  customReason?: string;
}

// Shared Meal Plan Types
export interface SharedMealPlan {
  id: string;
  plan_id: string;
  share_token: string;
  created_by: string;
  include_pdf: boolean;
  expires_at: string | null;
  view_count: number;
  created_at: string;
}

// UI State Types
export interface PlanGenerationOptions {
  days: 3 | 7;
  mealsPerDay: MealType[];
  goal: FeedingGoal;
  includeNewFoods: boolean;
  batchCookingMode: boolean;
}
