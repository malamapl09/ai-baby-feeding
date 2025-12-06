import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { openai } from '@/lib/openai/client';
import { z } from 'zod';
import { rateLimit, RATE_LIMITS, createRateLimitKey } from '@/lib/rate-limit';

const quickSearchSchema = z.object({
  babyId: z.string().uuid(),
  ingredients: z.array(z.string()).min(1).max(20),
  filterByTriedFoods: z.boolean().optional().default(true),
  includeAiSuggestions: z.boolean().optional().default(false),
});

interface RecipeWithMeal {
  id: string;
  ingredients: string[];
  prep_time_minutes: number;
  meal: {
    title: string;
    summary: string;
    meal_type: string;
  } | null;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Apply rate limiting
    const rateLimitResult = rateLimit(
      createRateLimitKey(user.id, 'quick-search'),
      RATE_LIMITS.api
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000) },
        { status: 429 }
      );
    }

    // Validate request body
    const body = await request.json();
    const validationResult = quickSearchSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { babyId, ingredients, filterByTriedFoods, includeAiSuggestions } = validationResult.data;

    // Verify baby belongs to user
    const { data: baby } = await supabase
      .from('babies')
      .select('id, name, birthdate, allergies')
      .eq('id', babyId)
      .eq('user_id', user.id)
      .single();

    if (!baby) {
      return NextResponse.json({ error: 'Baby not found' }, { status: 404 });
    }

    // Calculate baby's age in months
    const birthdate = new Date(baby.birthdate);
    const ageMonths = Math.floor(
      (new Date().getTime() - birthdate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );

    // Get existing recipes from the user's meal plans
    const { data: recipes } = await supabase
      .from('recipes')
      .select(`
        id,
        ingredients,
        prep_time_minutes,
        meal:meals(
          title,
          summary,
          meal_type,
          plan:meal_plans(baby_id)
        )
      `)
      .not('meal', 'is', null);

    // Filter recipes that belong to this baby and calculate match scores
    const ingredientsLower = new Set(ingredients.map((i) => i.toLowerCase()));

    const matchedRecipes = (recipes || [])
      .filter((recipe) => {
        // Handle the nested structure - meal could be an array
        const meal = Array.isArray(recipe.meal) ? recipe.meal[0] : recipe.meal;
        if (!meal) return false;

        // Plan could be an array too
        const plan = Array.isArray(meal.plan) ? meal.plan[0] : meal.plan;
        return plan?.baby_id === babyId;
      })
      .map((recipe) => {
        const recipeIngredients = (recipe.ingredients || []) as string[];
        const matchedIngredients = recipeIngredients.filter((ing) =>
          ingredientsLower.has(ing.toLowerCase())
        );
        const matchScore =
          recipeIngredients.length > 0
            ? matchedIngredients.length / recipeIngredients.length
            : 0;

        const meal = Array.isArray(recipe.meal) ? recipe.meal[0] : recipe.meal;

        return {
          id: recipe.id,
          title: meal?.title || 'Untitled',
          summary: meal?.summary || '',
          prepTimeMinutes: recipe.prep_time_minutes || 15,
          ingredients: recipeIngredients,
          matchedIngredients: matchedIngredients.map((i) => i.toLowerCase()),
          matchScore,
          mealType: meal?.meal_type || 'meal',
        };
      })
      .filter((recipe) => recipe.matchScore > 0.3) // At least 30% match
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10); // Top 10 matches

    // AI suggestions (optional, rate limited more strictly)
    let aiSuggestions: Array<{
      title: string;
      summary: string;
      ingredients: string[];
      instructions: string[];
      prepTimeMinutes: number;
      textureNotes?: string;
    }> = [];

    if (includeAiSuggestions && ingredients.length >= 2) {
      // Additional rate limit for AI generation
      const aiRateLimitResult = rateLimit(
        createRateLimitKey(user.id, 'quick-search-ai'),
        RATE_LIMITS.aiGeneration
      );

      if (aiRateLimitResult.success) {
        const prompt = `Generate 2 simple, healthy baby food recipes for a ${ageMonths}-month-old baby.

Available ingredients: ${ingredients.join(', ')}

Requirements:
- Only use the available ingredients listed above
- Age-appropriate texture and preparation
- Safe for babies (avoid honey, salt, added sugar, whole nuts)
${baby.allergies?.length ? `- AVOID these allergens: ${baby.allergies.join(', ')}` : ''}

Return JSON only:
{
  "recipes": [
    {
      "title": "Recipe name",
      "summary": "Brief description",
      "ingredients": ["ingredient 1", "ingredient 2"],
      "instructions": ["Step 1", "Step 2"],
      "prep_time_minutes": 15,
      "texture_notes": "e.g., Soft mash, Finger food"
    }
  ]
}`;

        try {
          const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are a baby nutrition expert. Always respond with valid JSON only.',
              },
              { role: 'user', content: prompt },
            ],
            temperature: 0.7,
            response_format: { type: 'json_object' },
          });

          const responseText = completion.choices[0]?.message?.content;
          if (responseText) {
            const parsed = JSON.parse(responseText);
            aiSuggestions = (parsed.recipes || []).map((r: {
              title: string;
              summary: string;
              ingredients: string[];
              instructions: string[];
              prep_time_minutes: number;
              texture_notes?: string;
            }) => ({
              title: r.title,
              summary: r.summary,
              ingredients: r.ingredients,
              instructions: r.instructions,
              prepTimeMinutes: r.prep_time_minutes,
              textureNotes: r.texture_notes,
            }));
          }
        } catch (aiError) {
          console.error('AI suggestion error:', aiError);
          // Continue without AI suggestions
        }
      }
    }

    return NextResponse.json({
      existingRecipes: matchedRecipes,
      aiSuggestions,
      ingredientCount: ingredients.length,
    });
  } catch (error) {
    console.error('Quick search error:', error);
    return NextResponse.json(
      { error: 'Failed to search recipes' },
      { status: 500 }
    );
  }
}
