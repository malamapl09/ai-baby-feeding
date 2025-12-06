import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { GroceryListPDF } from '@/lib/pdf/grocery-list-template';
import { z } from 'zod';

const exportRequestSchema = z.object({
  listId: z.string().uuid(),
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

    const { listId } = result.data;

    // Fetch the grocery list with meal plan and baby info
    const { data: groceryList, error: listError } = await supabase
      .from('grocery_lists')
      .select(`
        *,
        meal_plans!inner(
          start_date,
          end_date,
          babies!inner(name, user_id)
        )
      `)
      .eq('id', listId)
      .single();

    if (listError || !groceryList) {
      return NextResponse.json({ error: 'Grocery list not found' }, { status: 404 });
    }

    // Verify ownership
    if (groceryList.meal_plans.babies.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      GroceryListPDF({
        groceryList: {
          id: groceryList.id,
          plan_id: groceryList.plan_id,
          items: groceryList.items || [],
          created_at: groceryList.created_at,
        },
        planDates: {
          start: groceryList.meal_plans.start_date,
          end: groceryList.meal_plans.end_date,
        },
        babyName: groceryList.meal_plans.babies.name,
      })
    );

    const babyNameSlug = groceryList.meal_plans.babies.name.toLowerCase().replace(/\s+/g, '-');
    const filename = `grocery-list-${babyNameSlug}-${groceryList.meal_plans.start_date}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export grocery list' },
      { status: 500 }
    );
  }
}
