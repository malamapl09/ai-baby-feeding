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

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface Recipe {
  id: string;
  meal_id: string;
  ingredients: Ingredient[];
  instructions: string[];
  prep_time_minutes: number;
  texture_notes: string | null;
  choking_hazard_notes: string | null;
  batch_info?: BatchInfo | null;
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
}

// Batch Cooking Types
export interface BatchInfo {
  makeAheadNotes: string | null;
  storageInstructions: string | null;
  freezable: boolean;
  reheatInstructions: string | null;
  prepDayTasks: string[];
}

// UI State Types
export interface PlanGenerationOptions {
  days: 3 | 7;
  mealsPerDay: MealType[];
  goal: FeedingGoal;
  includeNewFoods: boolean;
  batchCookingMode: boolean;
}
