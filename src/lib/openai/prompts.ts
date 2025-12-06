import { AGE_TEXTURE_GUIDELINES, FEEDING_GOALS } from '@/config/constants';
import { FeedingGoal, MealType, TasteFeedback } from '@/types';

interface MealRatingHistory {
  mealTitle: string;
  rating: number | null;
  tasteFeedback: TasteFeedback | null;
  wouldMakeAgain: boolean | null;
}

export function buildMealPlanPrompt({
  babyName,
  ageMonths,
  days,
  mealsPerDay,
  goal,
  triedFoods,
  allergies,
  includeNewFoods,
  batchCookingMode = false,
  includeFamilyVersion = false,
  ratingsHistory = [],
}: {
  babyName: string;
  ageMonths: number;
  days: number;
  mealsPerDay: MealType[];
  goal: FeedingGoal;
  triedFoods: Array<{ name: string }>;
  allergies: string[];
  includeNewFoods: boolean;
  batchCookingMode?: boolean;
  includeFamilyVersion?: boolean;
  ratingsHistory?: MealRatingHistory[];
}) {
  const ageRange = getAgeRange(ageMonths);
  const textureGuideline = AGE_TEXTURE_GUIDELINES[ageRange as keyof typeof AGE_TEXTURE_GUIDELINES];
  const goalDescription = FEEDING_GOALS[goal]?.description || 'balanced nutrition';

  const triedFoodsList = triedFoods.map((f) => f.name).join(', ') || 'none yet';
  const allergiesList = allergies.length > 0 ? allergies.join(', ') : 'none known';
  const mealsToInclude = mealsPerDay.join(', ');

  const batchCookingSection = batchCookingMode ? `
## BATCH COOKING MODE ENABLED
Design recipes optimized for meal prep:
- Create recipes that share base ingredients (e.g., same vegetable puree can be used in multiple meals)
- Include make-ahead steps that can be done on a "prep day" (weekend)
- Specify storage instructions (e.g., "Fridge: 3 days" or "Freezer: 2 weeks")
- Mark which recipes are freezable
- Include reheating instructions for each meal
- Group prep tasks by type (chopping, cooking, blending)

For each meal, include these additional fields:
- "make_ahead_notes": tips for preparing in advance
- "storage_instructions": how to store and for how long
- "freezable": true/false
- "reheat_instructions": how to safely reheat
- "prep_day_tasks": array of tasks to do on prep day
` : '';

  const batchCookingFields = batchCookingMode ? `,
          "make_ahead_notes": "Can be made ahead and stored",
          "storage_instructions": "Fridge: 3 days, Freezer: 2 weeks",
          "freezable": true,
          "reheat_instructions": "Warm gently, stir, check temperature",
          "prep_day_tasks": ["Cook base ingredient", "Portion into containers"]` : '';

  // Family version section
  const familyVersionSection = includeFamilyVersion ? `
## FAMILY MEAL ADAPTATION
For each baby meal, also provide a family-friendly adult version that uses the same base ingredients:
- Add age-appropriate seasonings (salt, pepper, herbs, spices)
- Suggest protein additions or toppings for adults
- Include portion multiplier for 2 adults (typically 3x baby portion)
- Note any cooking adjustments (e.g., "cook longer for crispier texture")

For each meal, include a "family_version" field with:
- "title": Adult-friendly name
- "modifications": How to adapt for adults
- "seasonings": Array of suggested seasonings
- "additional_ingredients": Optional extras for adults
- "portion_multiplier": Number (default 3)
- "cooking_adjustments": Optional cooking changes
` : '';

  const familyVersionFields = includeFamilyVersion ? `,
          "family_version": {
            "title": "Adult version name",
            "modifications": "How to adapt for adults",
            "seasonings": ["salt", "pepper", "garlic"],
            "additional_ingredients": ["sliced avocado", "hot sauce"],
            "portion_multiplier": 3,
            "cooking_adjustments": "Optional cooking changes"
          }` : '';

  // Nutrition section - always included
  const nutritionSection = `
## NUTRITION INFORMATION
For EVERY meal, estimate nutrition information based on the ingredients and baby-appropriate portions.
Use USDA nutrition data as reference. This is critical for parents tracking their baby's nutritional intake.

Key micronutrients for babies:
- Iron: Critical for brain development, especially 6-12 months (need ~11mg/day)
- Calcium: Bone development (need ~260mg/day for 6-12mo)
- Vitamin A: Vision and immune function
- Vitamin C: Iron absorption and immune health
- Vitamin D: Bone health (need ~10mcg/day)

For each meal, include a "nutrition" field with all required values.
`;

  const nutritionFields = `,
          "nutrition": {
            "calories": 85,
            "protein_grams": 3.5,
            "carbs_grams": 12,
            "fat_grams": 2.5,
            "fiber_grams": 1.5,
            "iron_mg": 1.8,
            "calcium_mg": 45,
            "vitamin_a_mcg": 120,
            "vitamin_c_mg": 15,
            "vitamin_d_mcg": 0.5,
            "serving_size": "2 tablespoons",
            "age_appropriate_notes": "Good iron source for this age"
          }`;

  // Build ratings context if available
  let ratingsContext = '';
  if (ratingsHistory.length > 0) {
    const lovedMeals = ratingsHistory
      .filter((r) => r.tasteFeedback === 'loved' || (r.rating && r.rating >= 4))
      .map((r) => r.mealTitle);
    const dislikedMeals = ratingsHistory
      .filter((r) => r.tasteFeedback === 'disliked' || r.tasteFeedback === 'rejected' || (r.rating && r.rating <= 2))
      .map((r) => r.mealTitle);
    const wouldNotMakeAgain = ratingsHistory
      .filter((r) => r.wouldMakeAgain === false)
      .map((r) => r.mealTitle);

    if (lovedMeals.length > 0 || dislikedMeals.length > 0 || wouldNotMakeAgain.length > 0) {
      ratingsContext = `
## MEAL PREFERENCE HISTORY
Based on past ratings from this baby:
${lovedMeals.length > 0 ? `- LOVED these meals (include similar ones): ${lovedMeals.join(', ')}` : ''}
${dislikedMeals.length > 0 ? `- DISLIKED these meals (avoid similar patterns): ${dislikedMeals.join(', ')}` : ''}
${wouldNotMakeAgain.length > 0 ? `- Parent would NOT make again: ${wouldNotMakeAgain.join(', ')}` : ''}

Please favor similar ingredients and flavors to the loved meals, and avoid patterns from disliked ones.
`;
    }
  }

  return `You are a baby nutrition expert creating a ${days}-day meal plan for a ${ageMonths}-month-old baby named ${babyName}.

## Context
- Baby's age: ${ageMonths} months
- Feeding goal: ${goalDescription}
- Texture guideline for this age: ${textureGuideline}
- Known allergies: ${allergiesList}
- Foods already tried: ${triedFoodsList}
- Include new food introductions: ${includeNewFoods ? 'Yes' : 'No'}
- Meals per day: ${mealsToInclude}
- Batch cooking mode: ${batchCookingMode ? 'ENABLED' : 'Disabled'}
- Family version mode: ${includeFamilyVersion ? 'ENABLED' : 'Disabled'}
${batchCookingSection}${familyVersionSection}${nutritionSection}${ratingsContext}
## Important Guidelines
1. All meals must be age-appropriate and safe
2. Focus on nutrient-dense, whole foods
3. Portions should be baby-sized (1-4 tablespoons per food item)
4. Introduce only ONE new food per day maximum (if including new foods)
5. Avoid honey for babies under 12 months
6. Avoid added salt and sugar
7. Include variety across food groups
8. Textures must match the age guideline above

## Required Output Format
Return ONLY valid JSON in this exact structure:
{
  "days": [
    {
      "day_index": 0,
      "meals": [
        {
          "meal_type": "breakfast",
          "title": "Meal name",
          "summary": "Brief description of the meal",
          "ingredients": [
            {"name": "ingredient", "quantity": "2", "unit": "tablespoons", "category": "fruits"}
          ],
          "instructions": ["Step 1", "Step 2"],
          "prep_time_minutes": 10,
          "texture_notes": "Texture description for this meal",
          "new_food_introduced": "food name or null"${batchCookingFields}${familyVersionFields}${nutritionFields}
        }
      ]
    }
  ]
}

Generate ${days} days of meals. Each day must have these meal types: ${mealsToInclude}.
Include practical, simple recipes that busy parents can prepare quickly.`;
}

export function buildRecipePrompt({
  mealTitle,
  ageMonths,
  goal,
}: {
  mealTitle: string;
  ageMonths: number;
  goal: FeedingGoal;
}) {
  const ageRange = getAgeRange(ageMonths);
  const textureGuideline = AGE_TEXTURE_GUIDELINES[ageRange as keyof typeof AGE_TEXTURE_GUIDELINES];

  return `Generate a detailed baby-friendly recipe for "${mealTitle}" for a ${ageMonths}-month-old baby.

## Guidelines
- Texture: ${textureGuideline}
- Keep ingredients to 3-7 items
- Steps should be 3-5 simple instructions
- Include prep time estimate
- Note any choking hazards and how to avoid them

## Output Format (JSON only)
{
  "ingredients": [
    {"name": "ingredient", "quantity": "2", "unit": "tablespoons", "category": "category"}
  ],
  "instructions": ["Step 1", "Step 2", "Step 3"],
  "prep_time_minutes": 10,
  "texture_notes": "Description of texture",
  "choking_hazard_notes": "Safety notes or null"
}`;
}

export function buildGroceryListPrompt(ingredients: Array<{ name: string; quantity: string; unit: string; category: string }>) {
  return `Consolidate this list of baby food ingredients into a shopping list.
Combine duplicates, round up quantities, and organize by grocery store section.

Ingredients:
${JSON.stringify(ingredients, null, 2)}

## Output Format (JSON only)
{
  "items": [
    {"name": "ingredient", "quantity": "combined quantity", "unit": "unit", "category": "category", "checked": false}
  ]
}

Group by category and combine any duplicate ingredients. Use standard grocery quantities (e.g., "1 bunch" for herbs, "1 lb" for meats).`;
}

function getAgeRange(months: number): string {
  if (months < 6) return '6-7'; // Default to youngest solid food age
  if (months < 8) return '6-7';
  if (months < 10) return '8-9';
  if (months < 12) return '10-12';
  if (months < 18) return '12-18';
  return '18-24';
}
