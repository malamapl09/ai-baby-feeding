import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { openai } from '@/lib/openai/client';
import { buildMealPlanPrompt } from '@/lib/openai/prompts';
import { FREE_TIER_LIMITS } from '@/config/constants';
import { MealType } from '@/types';
import { addDays, startOfDay } from 'date-fns';
import {
  generateMealPlanSchema,
  mealPlanResponseSchema,
  safeParseJSON,
} from '@/lib/validations/api';
import { rateLimit, RATE_LIMITS, createRateLimitKey } from '@/lib/rate-limit';

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
      createRateLimitKey(user.id, 'generate-meal-plan'),
      RATE_LIMITS.aiGeneration
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Please wait before generating another meal plan',
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
            'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Validate request body
    const body = await request.json();
    const validationResult = generateMealPlanSchema.safeParse(body);

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

    const { babyId, days, mealsPerDay, goal, includeNewFoods } = validationResult.data;

    // Get user subscription info
    const { data: userData } = await supabase
      .from('users')
      .select('subscription_plan, plans_generated_this_week, week_reset_date')
      .eq('id', user.id)
      .single();

    // Check free tier limits
    if (userData?.subscription_plan === 'free') {
      const weekResetDate = userData.week_reset_date
        ? new Date(userData.week_reset_date)
        : new Date();
      const today = new Date();
      const daysDiff = Math.floor(
        (today.getTime() - weekResetDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Reset counter if it's been a week
      if (daysDiff >= 7) {
        await supabase
          .from('users')
          .update({
            plans_generated_this_week: 0,
            week_reset_date: today.toISOString().split('T')[0],
          })
          .eq('id', user.id);
        userData.plans_generated_this_week = 0;
      }

      if (
        (userData?.plans_generated_this_week || 0) >= FREE_TIER_LIMITS.plansPerWeek
      ) {
        return NextResponse.json(
          {
            error: 'Weekly plan limit reached',
            message: 'Upgrade to Pro for unlimited meal plans',
          },
          { status: 403 }
        );
      }
    }

    // Get baby profile
    const { data: baby } = await supabase
      .from('babies')
      .select('*')
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

    // Get tried foods
    const { data: babyFoods } = await supabase
      .from('baby_foods')
      .select('food:foods(*)')
      .eq('baby_id', babyId)
      .neq('status', 'allergic');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const triedFoods = (babyFoods || [])
      .map((bf: any) => {
        // Supabase may return relations as arrays
        const food = Array.isArray(bf.food) ? bf.food[0] : bf.food;
        return food;
      })
      .filter(Boolean) as Array<{
        id: string;
        name: string;
        category: string;
        age_min_months: number;
        is_common_allergen: boolean;
        choking_risk: string;
        prep_notes: string | null;
      }>;

    // Build the prompt
    const prompt = buildMealPlanPrompt({
      babyName: baby.name,
      ageMonths,
      days: days,
      mealsPerDay: mealsPerDay as MealType[],
      goal: goal,
      triedFoods: triedFoods || [],
      allergies: baby.allergies || [],
      includeNewFoods: includeNewFoods,
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
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('No response from AI');
    }

    // Validate AI response structure
    const parsedResponse = safeParseJSON(responseText, mealPlanResponseSchema);
    if (!parsedResponse.success) {
      console.error('AI response validation failed:', parsedResponse.error);
      throw new Error('Invalid AI response structure');
    }

    const mealPlanData = parsedResponse.data;

    // Save meal plan to database
    const startDate = startOfDay(new Date());
    const endDate = addDays(startDate, days - 1);

    const { data: mealPlan, error: planError } = await supabase
      .from('meal_plans')
      .insert({
        baby_id: babyId,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        goal,
        days,
      })
      .select()
      .single();

    if (planError) throw planError;

    // Save meals and recipes
    for (const day of mealPlanData.days) {
      for (const meal of day.meals) {
        const { data: mealRecord, error: mealError } = await supabase
          .from('meals')
          .insert({
            plan_id: mealPlan.id,
            day_index: day.day_index,
            meal_type: meal.meal_type,
            title: meal.title,
            summary: meal.summary,
          })
          .select()
          .single();

        if (mealError) throw mealError;

        // Save recipe
        await supabase.from('recipes').insert({
          meal_id: mealRecord.id,
          ingredients: meal.ingredients,
          instructions: meal.instructions,
          prep_time_minutes: meal.prep_time_minutes,
          texture_notes: meal.texture_notes,
          choking_hazard_notes: meal.new_food_introduced
            ? `New food: ${meal.new_food_introduced}`
            : null,
        });
      }
    }

    // Increment plan counter for free users
    if (userData?.subscription_plan === 'free') {
      await supabase
        .from('users')
        .update({
          plans_generated_this_week: (userData.plans_generated_this_week || 0) + 1,
        })
        .eq('id', user.id);
    }

    return NextResponse.json({
      success: true,
      planId: mealPlan.id,
      data: mealPlanData,
    });
  } catch (error) {
    console.error('Error generating meal plan:', error);
    return NextResponse.json(
      { error: 'Failed to generate meal plan' },
      { status: 500 }
    );
  }
}
