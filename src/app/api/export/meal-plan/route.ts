import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { MealPlanPDF } from '@/lib/pdf/meal-plan-template';
import { z } from 'zod';

const exportRequestSchema = z.object({
  planId: z.string().uuid(),
  format: z.enum(['pdf', 'png']),
  layout: z.enum(['compact', 'detailed']).default('detailed'),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = exportRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { planId, format, layout } = result.data;

    // Fetch the meal plan with all related data
    const { data: mealPlan, error: planError } = await supabase
      .from('meal_plans')
      .select(`
        *,
        babies!inner(name, user_id)
      `)
      .eq('id', planId)
      .single();

    if (planError || !mealPlan) {
      return NextResponse.json({ error: 'Meal plan not found' }, { status: 404 });
    }

    // Verify ownership
    if (mealPlan.babies.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch meals with recipes
    const { data: meals, error: mealsError } = await supabase
      .from('meals')
      .select(`
        *,
        recipes(*)
      `)
      .eq('plan_id', planId)
      .order('day_index', { ascending: true })
      .order('meal_type', { ascending: true });

    if (mealsError) {
      return NextResponse.json({ error: 'Failed to fetch meals' }, { status: 500 });
    }

    // Transform meals to include recipe directly
    const transformedMeals = meals.map(meal => ({
      ...meal,
      recipe: meal.recipes?.[0] || null,
    }));

    if (format === 'pdf') {
      // Generate PDF
      const pdfBuffer = await renderToBuffer(
        MealPlanPDF({
          mealPlan: {
            id: mealPlan.id,
            baby_id: mealPlan.baby_id,
            start_date: mealPlan.start_date,
            end_date: mealPlan.end_date,
            goal: mealPlan.goal,
            days: mealPlan.days,
            created_at: mealPlan.created_at,
          },
          meals: transformedMeals,
          babyName: mealPlan.babies.name,
          layout,
        })
      );

      const filename = `meal-plan-${mealPlan.babies.name.toLowerCase().replace(/\s+/g, '-')}-${mealPlan.start_date}.pdf`;

      return new NextResponse(new Uint8Array(pdfBuffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    // For PNG format, return the data needed for client-side rendering
    // The actual image generation will happen on the client using html-to-image
    return NextResponse.json({
      mealPlan: {
        id: mealPlan.id,
        baby_id: mealPlan.baby_id,
        start_date: mealPlan.start_date,
        end_date: mealPlan.end_date,
        goal: mealPlan.goal,
        days: mealPlan.days,
        created_at: mealPlan.created_at,
      },
      meals: transformedMeals,
      babyName: mealPlan.babies.name,
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export meal plan' },
      { status: 500 }
    );
  }
}
