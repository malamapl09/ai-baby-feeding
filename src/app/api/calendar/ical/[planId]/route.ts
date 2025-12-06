import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateMealCalendar } from '@/lib/calendar/ical-generator';
import { addDays, parseISO } from 'date-fns';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params;
    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get reminder preference from query params
    const reminderMinutes = parseInt(request.nextUrl.searchParams.get('reminder') || '30');

    // Fetch the meal plan
    const { data: mealPlan, error: planError } = await supabase
      .from('meal_plans')
      .select(`
        *,
        babies!inner (
          id,
          name,
          user_id
        ),
        meals (
          id,
          day_index,
          meal_type,
          title,
          summary,
          recipes (
            ingredients,
            prep_time_minutes
          )
        )
      `)
      .eq('id', planId)
      .single();

    if (planError || !mealPlan) {
      return NextResponse.json({ error: 'Meal plan not found' }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const planData = mealPlan as any;
    const babyOwner = Array.isArray(planData.babies) ? planData.babies[0]?.user_id : planData.babies?.user_id;
    const babyName = Array.isArray(planData.babies) ? planData.babies[0]?.name : planData.babies?.name;

    if (babyOwner !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Transform meals for calendar
    const startDate = parseISO(mealPlan.start_date);
    const mealEvents = planData.meals.map((meal: {
      id: string;
      day_index: number;
      meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
      title: string;
      summary: string;
      recipes?: {
        ingredients?: Array<{ name: string; quantity: string; unit: string }>;
        prep_time_minutes?: number;
      };
    }) => ({
      id: meal.id,
      title: meal.title,
      summary: meal.summary,
      mealType: meal.meal_type,
      date: addDays(startDate, meal.day_index),
      ingredients: meal.recipes?.ingredients,
      prepTimeMinutes: meal.recipes?.prep_time_minutes,
    }));

    // Generate calendar
    const calendar = generateMealCalendar(mealEvents, {
      babyName: babyName || 'Baby',
      planId: mealPlan.id,
      reminderMinutes,
    });

    // Return as .ics file
    const icsContent = calendar.toString();
    const filename = `meal-plan-${babyName?.toLowerCase().replace(/\s+/g, '-') || 'baby'}-${mealPlan.start_date}.ics`;

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error generating calendar:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
