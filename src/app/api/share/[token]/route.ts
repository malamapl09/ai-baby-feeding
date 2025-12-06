import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const supabase = await createClient();

    // Fetch the shared plan by token
    const { data: sharedPlan, error: shareError } = await supabase
      .from('shared_meal_plans')
      .select('*')
      .eq('share_token', token)
      .single();

    if (shareError || !sharedPlan) {
      return NextResponse.json({ error: 'Shared plan not found' }, { status: 404 });
    }

    // Check if expired
    if (sharedPlan.expires_at && new Date(sharedPlan.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This share link has expired' }, { status: 410 });
    }

    // Fetch the meal plan with all related data
    const { data: mealPlan, error: planError } = await supabase
      .from('meal_plans')
      .select(`
        *,
        babies (
          name,
          birthdate,
          country
        ),
        meals (
          *,
          recipes (
            *
          )
        )
      `)
      .eq('id', sharedPlan.plan_id)
      .single();

    if (planError || !mealPlan) {
      return NextResponse.json({ error: 'Meal plan not found' }, { status: 404 });
    }

    // Increment view count (fire and forget - don't wait for result)
    supabase
      .from('shared_meal_plans')
      .update({ view_count: (sharedPlan.view_count || 0) + 1 })
      .eq('id', sharedPlan.id)
      .then(() => {});

    // Sanitize baby info for privacy - only include first name initial and age info
    const baby = mealPlan.babies;
    const sanitizedBaby = baby ? {
      name: baby.name ? baby.name.charAt(0) + '.' : 'Baby',
      birthdate: baby.birthdate,
      country: baby.country,
    } : null;

    return NextResponse.json({
      success: true,
      plan: {
        ...mealPlan,
        babies: sanitizedBaby,
      },
      shareInfo: {
        includePdf: sharedPlan.include_pdf,
        viewCount: sharedPlan.view_count + 1,
        createdAt: sharedPlan.created_at,
      },
    });
  } catch (error) {
    console.error('Error fetching shared plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
