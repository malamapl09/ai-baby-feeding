import { AGE_TEXTURE_GUIDELINES } from '@/config/constants';
import { Ingredient, SwapReason } from '@/types';

function getAgeRange(months: number): string {
  if (months < 6) return '6-7';
  if (months < 8) return '6-7';
  if (months < 10) return '8-9';
  if (months < 12) return '10-12';
  if (months < 18) return '12-18';
  return '18-24';
}

const SWAP_REASON_LABELS: Record<SwapReason, string> = {
  missing_ingredient: 'Missing some ingredients',
  dont_like: 'Baby didn\'t like similar meals',
  want_variety: 'Want more variety',
  dietary: 'Dietary restrictions',
  other: 'Other reason',
};

export function buildMealSwapPrompt({
  originalMeal,
  ageMonths,
  allergies,
  swapReason,
  customReason,
  dislikedPatterns = [],
}: {
  originalMeal: {
    title: string;
    summary: string;
    ingredients: Ingredient[];
    meal_type: string;
  };
  ageMonths: number;
  allergies: string[];
  swapReason?: SwapReason;
  customReason?: string;
  dislikedPatterns?: string[];
}) {
  const ageRange = getAgeRange(ageMonths);
  const textureGuideline = AGE_TEXTURE_GUIDELINES[ageRange as keyof typeof AGE_TEXTURE_GUIDELINES];
  const allergiesList = allergies.length > 0 ? allergies.join(', ') : 'none known';

  const reasonDescription = swapReason
    ? `Swap reason: ${SWAP_REASON_LABELS[swapReason]}${customReason ? ` - ${customReason}` : ''}`
    : 'User wants alternative options';

  const dislikedSection = dislikedPatterns.length > 0
    ? `\n\n## AVOID THESE PATTERNS\nBased on past feedback, avoid meals similar to: ${dislikedPatterns.join(', ')}`
    : '';

  return `You are a baby nutrition expert. Generate 3 alternative meal suggestions to swap with the following meal.

## ORIGINAL MEAL TO REPLACE
- Title: ${originalMeal.title}
- Summary: ${originalMeal.summary}
- Meal type: ${originalMeal.meal_type}
- Ingredients: ${originalMeal.ingredients.map(i => i.name).join(', ')}

## CONTEXT
- Baby's age: ${ageMonths} months
- Texture guideline for this age: ${textureGuideline}
- Known allergies: ${allergiesList}
- ${reasonDescription}
${dislikedSection}

## REQUIREMENTS FOR ALTERNATIVES
1. Must maintain similar nutritional value to the original
2. Must be appropriate for the same meal type (${originalMeal.meal_type})
3. Must follow texture guidelines for ${ageMonths}-month-old
4. Must avoid known allergens
5. Should address the swap reason:
${swapReason === 'missing_ingredient' ? '   - Use common pantry ingredients, different from the original' : ''}
${swapReason === 'dont_like' ? '   - Try different flavor profiles and textures' : ''}
${swapReason === 'want_variety' ? '   - Explore different cuisines or ingredient combinations' : ''}
${swapReason === 'dietary' ? '   - Focus on alternative ingredients that meet dietary needs' : ''}
6. Each alternative should be distinctly different from the others

## OUTPUT FORMAT (JSON only)
{
  "suggestions": [
    {
      "title": "Alternative meal name",
      "summary": "Brief description of why this is a good swap",
      "ingredients": [
        {"name": "ingredient", "quantity": "2", "unit": "tablespoons", "category": "fruits"}
      ],
      "instructions": ["Step 1", "Step 2", "Step 3"],
      "prep_time_minutes": 10,
      "texture_notes": "Age-appropriate texture description",
      "swap_reason": "Why this is a good alternative for the user's situation",
      "nutritional_comparison": "How nutrition compares to original (e.g., 'Similar iron content, more fiber')"
    }
  ]
}

Generate exactly 3 alternatives. Each should be practical, simple, and quick to prepare.`;
}
