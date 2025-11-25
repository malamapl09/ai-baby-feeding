import { AGE_TEXTURE_GUIDELINES, FEEDING_GOALS } from '@/config/constants';
import { FeedingGoal, MealType } from '@/types';

export function buildMealPlanPrompt({
  babyName,
  ageMonths,
  days,
  mealsPerDay,
  goal,
  triedFoods,
  allergies,
  includeNewFoods,
}: {
  babyName: string;
  ageMonths: number;
  days: number;
  mealsPerDay: MealType[];
  goal: FeedingGoal;
  triedFoods: Array<{ name: string }>;
  allergies: string[];
  includeNewFoods: boolean;
}) {
  const ageRange = getAgeRange(ageMonths);
  const textureGuideline = AGE_TEXTURE_GUIDELINES[ageRange as keyof typeof AGE_TEXTURE_GUIDELINES];
  const goalDescription = FEEDING_GOALS[goal]?.description || 'balanced nutrition';

  const triedFoodsList = triedFoods.map((f) => f.name).join(', ') || 'none yet';
  const allergiesList = allergies.length > 0 ? allergies.join(', ') : 'none known';
  const mealsToInclude = mealsPerDay.join(', ');

  return `You are a baby nutrition expert creating a ${days}-day meal plan for a ${ageMonths}-month-old baby named ${babyName}.

## Context
- Baby's age: ${ageMonths} months
- Feeding goal: ${goalDescription}
- Texture guideline for this age: ${textureGuideline}
- Known allergies: ${allergiesList}
- Foods already tried: ${triedFoodsList}
- Include new food introductions: ${includeNewFoods ? 'Yes' : 'No'}
- Meals per day: ${mealsToInclude}

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
          "new_food_introduced": "food name or null"
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
