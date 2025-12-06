import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { nanoid } from 'nanoid';
import { addDays } from 'date-fns';

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

    const body = await request.json();
    const { planId, includePdf = false, expiresInDays = 30 } = body;

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    // Verify the plan exists and belongs to the user
    const { data: plan } = await supabase
      .from('meal_plans')
      .select('id, baby_id, babies!inner(user_id)')
      .eq('id', planId)
      .single();

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const planData = plan as any;
    const babyOwner = Array.isArray(planData.babies) ? planData.babies[0]?.user_id : planData.babies?.user_id;

    if (babyOwner !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if a share already exists for this plan
    const { data: existingShare } = await supabase
      .from('shared_meal_plans')
      .select('*')
      .eq('plan_id', planId)
      .eq('created_by', user.id)
      .single();

    if (existingShare) {
      // Update existing share
      const { data: updatedShare, error: updateError } = await supabase
        .from('shared_meal_plans')
        .update({
          include_pdf: includePdf,
          expires_at: expiresInDays ? addDays(new Date(), expiresInDays).toISOString() : null,
        })
        .eq('id', existingShare.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating share:', updateError);
        return NextResponse.json({ error: 'Failed to update share link' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        share: updatedShare,
        shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}/shared/${updatedShare.share_token}`,
        isNew: false,
      });
    }

    // Create new share
    const shareToken = nanoid(12);
    const expiresAt = expiresInDays ? addDays(new Date(), expiresInDays).toISOString() : null;

    const { data: share, error } = await supabase
      .from('shared_meal_plans')
      .insert({
        plan_id: planId,
        share_token: shareToken,
        created_by: user.id,
        include_pdf: includePdf,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating share:', error);
      return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      share,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}/shared/${share.share_token}`,
      isNew: true,
    });
  } catch (error) {
    console.error('Error in create share API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
