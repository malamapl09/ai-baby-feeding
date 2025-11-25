import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { openai } from '@/lib/openai/client';
import { buildGroceryListPrompt } from '@/lib/openai/prompts';
import {
  generateGroceryListSchema,
  groceryListResponseSchema,
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
      createRateLimitKey(user.id, 'generate-grocery-list'),
      RATE_LIMITS.aiGeneration
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Please wait before generating another grocery list',
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
    const validationResult = generateGroceryListSchema.safeParse(body);

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

    const { planId } = validationResult.data;

    // Get plan and verify ownership
    const { data: plan } = await supabase
      .from('meal_plans')
      .select('*, baby:babies(user_id)')
      .eq('id', planId)
      .single();

    if (!plan || plan.baby?.user_id !== user.id) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Check if grocery list already exists
    const { data: existingList } = await supabase
      .from('grocery_lists')
      .select('id')
      .eq('plan_id', planId)
      .single();

    if (existingList) {
      return NextResponse.json({ error: 'Grocery list already exists' }, { status: 400 });
    }

    // Get all recipes for this plan
    const { data: meals } = await supabase
      .from('meals')
      .select('recipe:recipes(ingredients)')
      .eq('plan_id', planId);

    if (!meals || meals.length === 0) {
      return NextResponse.json({ error: 'No meals found' }, { status: 404 });
    }

    // Collect all ingredients
    const allIngredients: Array<{ name: string; quantity: string; unit: string; category: string }> = [];
    meals.forEach((meal) => {
      // Supabase returns embedded relations as arrays
      const recipe = Array.isArray(meal.recipe) ? meal.recipe[0] : meal.recipe;
      if (recipe?.ingredients) {
        allIngredients.push(
          ...(recipe.ingredients as Array<{
            name: string;
            quantity: string;
            unit: string;
            category: string;
          }>)
        );
      }
    });

    // Use AI to consolidate the grocery list
    const prompt = buildGroceryListPrompt(allIngredients);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that consolidates grocery lists. Always respond with valid JSON only.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('No response from AI');
    }

    // Validate AI response structure
    const parsedResponse = safeParseJSON(responseText, groceryListResponseSchema);
    if (!parsedResponse.success) {
      console.error('AI response validation failed:', parsedResponse.error);
      throw new Error('Invalid AI response structure');
    }

    const groceryData = parsedResponse.data;

    // Save grocery list
    const { data: groceryList, error } = await supabase
      .from('grocery_lists')
      .insert({
        plan_id: planId,
        items: groceryData.items,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      groceryList,
    });
  } catch (error) {
    console.error('Error generating grocery list:', error);
    return NextResponse.json(
      { error: 'Failed to generate grocery list' },
      { status: 500 }
    );
  }
}
