import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { openai } from '@/lib/openai/client';
import { mealSwapSchema } from '@/lib/validations/api';
import { buildMealSwapPrompt } from '@/lib/openai/swap-prompt';
import { rateLimit, RATE_LIMITS, createRateLimitKey } from '@/lib/rate-limit';
import { z } from 'zod';

// Validation schema for swap response
const swapResponseSchema = z.object({
  suggestions: z.array(
    z.object({
      title: z.string(),
      summary: z.string(),
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
      swap_reason: z.string(),
      nutritional_comparison: z.string(),
    })
  ),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ mealId: string }> }
) {
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
      createRateLimitKey(user.id, 'meal-swap'),
      RATE_LIMITS.aiGeneration
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Please wait before requesting more swaps',
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
        },
        { status: 429 }
      );
    }

    const { mealId } = await params;
    const body = await request.json();

    // Validate request body
    const validationResult = mealSwapSchema.safeParse({ ...body, mealId });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues.map((i) => ({
            field: i.path.join('.'),
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    const { reason, customReason } = validationResult.data;

    // Get the meal with its recipe and plan info
    const { data: meal } = await supabase
      .from('meals')
      .select(`
        id,
        title,
        summary,
        meal_type,
        recipe:recipes(ingredients, instructions, prep_time_minutes),
        meal_plans!inner(baby_id, babies!inner(id, name, birthdate, allergies, user_id))
      `)
      .eq('id', mealId)
      .single();

    if (!meal) {
      return NextResponse.json({ error: 'Meal not found' }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mealData = meal as any;
    const baby = Array.isArray(mealData.meal_plans)
      ? mealData.meal_plans[0]?.babies
      : mealData.meal_plans?.babies;
    const babyData = Array.isArray(baby) ? baby[0] : baby;

    // Verify ownership
    if (babyData?.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Calculate baby's age
    const birthdate = new Date(babyData.birthdate);
    const ageMonths = Math.floor(
      (new Date().getTime() - birthdate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );

    // Get disliked patterns from ratings
    const { data: dislikedRatings } = await supabase
      .from('meal_ratings')
      .select('meals!inner(title)')
      .eq('baby_id', babyData.id)
      .or('taste_feedback.in.(disliked,rejected),rating.lte.2');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dislikedPatterns = (dislikedRatings || []).map((r: any) => {
      const mealInfo = Array.isArray(r.meals) ? r.meals[0] : r.meals;
      return mealInfo?.title;
    }).filter(Boolean);

    // Get recipe data
    const recipe = Array.isArray(mealData.recipe) ? mealData.recipe[0] : mealData.recipe;
    const ingredients = recipe?.ingredients || [];

    // Build the prompt
    const prompt = buildMealSwapPrompt({
      originalMeal: {
        title: mealData.title,
        summary: mealData.summary,
        ingredients,
        meal_type: mealData.meal_type,
      },
      ageMonths,
      allergies: babyData.allergies || [],
      swapReason: reason,
      customReason,
      dislikedPatterns,
    });

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a baby nutrition expert. Always respond with valid JSON only, no markdown or explanation.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8, // Slightly higher for variety
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('No response from AI');
    }

    // Parse and validate response
    let swapData;
    try {
      const parsed = JSON.parse(responseText);
      const validated = swapResponseSchema.safeParse(parsed);
      if (!validated.success) {
        console.error('Swap response validation failed:', validated.error);
        throw new Error('Invalid AI response structure');
      }
      swapData = validated.data;
    } catch {
      console.error('Failed to parse swap response:', responseText);
      throw new Error('Invalid AI response');
    }

    return NextResponse.json({
      success: true,
      originalMeal: {
        id: mealData.id,
        title: mealData.title,
        meal_type: mealData.meal_type,
      },
      suggestions: swapData.suggestions,
    });
  } catch (error) {
    console.error('Error generating swap suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate swap suggestions' },
      { status: 500 }
    );
  }
}
