import { z } from 'zod';

// =============================================
// REQUEST VALIDATION SCHEMAS
// =============================================

export const generateMealPlanSchema = z.object({
  babyId: z.string().uuid('Invalid baby ID'),
  days: z.number().int().min(1).max(14, 'Maximum 14 days allowed'),
  mealsPerDay: z.array(z.enum(['breakfast', 'lunch', 'dinner', 'snack'])).min(1),
  goal: z.enum([
    'balanced_nutrition',
    'weight_gain',
    'food_variety',
    'picky_eater',
  ]),
  includeNewFoods: z.boolean().optional().default(true),
  batchCookingMode: z.boolean().optional().default(false),
  includeFamilyVersion: z.boolean().optional().default(false),
});

export const generateGroceryListSchema = z.object({
  planId: z.string().uuid('Invalid plan ID'),
});

export const mealRatingSchema = z.object({
  mealId: z.string().uuid('Invalid meal ID'),
  babyId: z.string().uuid('Invalid baby ID'),
  rating: z.number().int().min(1).max(5).optional(),
  tasteFeedback: z.enum(['loved', 'liked', 'neutral', 'disliked', 'rejected']).optional(),
  wouldMakeAgain: z.boolean().optional(),
  notes: z.string().max(500).optional(),
});

export const mealSwapSchema = z.object({
  mealId: z.string().uuid('Invalid meal ID'),
  reason: z.enum(['missing_ingredient', 'dont_like', 'want_variety', 'dietary', 'other']).optional(),
  customReason: z.string().max(200).optional(),
});

// =============================================
// AI RESPONSE VALIDATION SCHEMAS
// =============================================

// Family adaptation schema
const familyVersionSchema = z.object({
  title: z.string(),
  modifications: z.string(),
  seasonings: z.array(z.string()),
  additional_ingredients: z.array(z.string()).optional(),
  portion_multiplier: z.number().optional().default(3),
  cooking_adjustments: z.string().optional(),
});

// Nutrition schema - baby-focused with macros and key micronutrients
const nutritionSchema = z.object({
  calories: z.number().min(0),
  protein_grams: z.number().min(0),
  carbs_grams: z.number().min(0),
  fat_grams: z.number().min(0),
  fiber_grams: z.number().min(0),
  // Baby-focused micronutrients
  iron_mg: z.number().min(0),
  calcium_mg: z.number().min(0),
  vitamin_a_mcg: z.number().min(0),
  vitamin_c_mg: z.number().min(0),
  vitamin_d_mcg: z.number().min(0),
  // Context
  serving_size: z.string(),
  age_appropriate_notes: z.string().nullable().optional(),
});

const mealSchema = z.object({
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  title: z.string().min(1),
  summary: z.string().min(1),
  ingredients: z.array(
    z.object({
      name: z.string(),
      quantity: z.string(),
      unit: z.string(),
      category: z.string().optional(),
    })
  ),
  instructions: z.array(z.string()),
  prep_time_minutes: z.number().optional().default(15),
  texture_notes: z.string().optional(),
  new_food_introduced: z.string().nullable().optional(),
  // Batch cooking fields (optional)
  make_ahead_notes: z.string().optional(),
  storage_instructions: z.string().optional(),
  freezable: z.boolean().optional(),
  reheat_instructions: z.string().optional(),
  prep_day_tasks: z.array(z.string()).optional(),
  // Family version (optional)
  family_version: familyVersionSchema.optional(),
  // Nutrition info
  nutrition: nutritionSchema,
});

const daySchema = z.object({
  day_index: z.number().int().min(0),
  meals: z.array(mealSchema),
});

export const mealPlanResponseSchema = z.object({
  days: z.array(daySchema),
  tips: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

const groceryItemSchema = z.object({
  name: z.string(),
  quantity: z.string(),
  unit: z.string(),
  category: z.string(),
  checked: z.boolean().optional().default(false),
});

export const groceryListResponseSchema = z.object({
  items: z.array(groceryItemSchema),
});

// =============================================
// TYPE EXPORTS
// =============================================

export type GenerateMealPlanInput = z.infer<typeof generateMealPlanSchema>;
export type GenerateGroceryListInput = z.infer<typeof generateGroceryListSchema>;
export type MealRatingInput = z.infer<typeof mealRatingSchema>;
export type MealSwapInput = z.infer<typeof mealSwapSchema>;
export type MealPlanResponse = z.infer<typeof mealPlanResponseSchema>;
export type GroceryListResponse = z.infer<typeof groceryListResponseSchema>;

// =============================================
// VALIDATION HELPER
// =============================================

export function safeParseJSON<T>(
  text: string,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: string } {
  try {
    const json = JSON.parse(text);
    const result = schema.safeParse(json);
    if (result.success) {
      return { success: true, data: result.data };
    }
    return {
      success: false,
      error: `Validation failed: ${result.error.issues.map((i) => i.message).join(', ')}`,
    };
  } catch {
    return { success: false, error: 'Invalid JSON response' };
  }
}
