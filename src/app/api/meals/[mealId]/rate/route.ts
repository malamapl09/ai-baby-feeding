import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { mealRatingSchema } from '@/lib/validations/api';

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

    const { mealId } = await params;
    const body = await request.json();

    // Validate request body
    const validationResult = mealRatingSchema.safeParse({ ...body, mealId });

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

    const { babyId, rating, tasteFeedback, wouldMakeAgain, notes } = validationResult.data;

    // Verify the meal exists and belongs to a plan for this user's baby
    const { data: meal } = await supabase
      .from('meals')
      .select('id, plan_id, meal_plans!inner(baby_id, babies!inner(user_id))')
      .eq('id', mealId)
      .single();

    if (!meal) {
      return NextResponse.json({ error: 'Meal not found' }, { status: 404 });
    }

    // Verify the baby belongs to the user
    const { data: baby } = await supabase
      .from('babies')
      .select('id')
      .eq('id', babyId)
      .eq('user_id', user.id)
      .single();

    if (!baby) {
      return NextResponse.json({ error: 'Baby not found or unauthorized' }, { status: 404 });
    }

    // Upsert the rating (insert or update if exists)
    const { data: ratingData, error } = await supabase
      .from('meal_ratings')
      .upsert(
        {
          meal_id: mealId,
          baby_id: babyId,
          user_id: user.id,
          rating: rating ?? null,
          taste_feedback: tasteFeedback ?? null,
          would_make_again: wouldMakeAgain ?? null,
          notes: notes ?? null,
        },
        {
          onConflict: 'meal_id,baby_id',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Error saving rating:', error);
      return NextResponse.json({ error: 'Failed to save rating' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      rating: ratingData,
    });
  } catch (error) {
    console.error('Error in rate meal API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
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

    const { mealId } = await params;
    const { searchParams } = new URL(request.url);
    const babyId = searchParams.get('babyId');

    if (!babyId) {
      return NextResponse.json({ error: 'babyId is required' }, { status: 400 });
    }

    // Get the rating for this meal and baby
    const { data: rating, error } = await supabase
      .from('meal_ratings')
      .select('*')
      .eq('meal_id', mealId)
      .eq('baby_id', babyId)
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" - that's ok
      console.error('Error fetching rating:', error);
      return NextResponse.json({ error: 'Failed to fetch rating' }, { status: 500 });
    }

    return NextResponse.json({
      rating: rating || null,
    });
  } catch (error) {
    console.error('Error in get meal rating API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
