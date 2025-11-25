import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Use service role for webhook to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Check if an event has already been processed (idempotency)
 */
async function isEventProcessed(eventId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('stripe_events')
    .select('id')
    .eq('event_id', eventId)
    .single();

  return !!data;
}

/**
 * Mark an event as processed
 */
async function markEventProcessed(
  eventId: string,
  eventType: string,
  payload: unknown
): Promise<void> {
  await supabaseAdmin.from('stripe_events').insert({
    event_id: eventId,
    event_type: eventType,
    payload: payload,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    // Check idempotency - skip if already processed
    const alreadyProcessed = await isEventProcessed(event.id);
    if (alreadyProcessed) {
      console.log(`Event ${event.id} already processed, skipping`);
      return NextResponse.json({ received: true, skipped: true });
    }

    // Process the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const plan = session.metadata?.plan;
        const customerId = session.customer as string;

        if (userId && plan) {
          await supabaseAdmin
            .from('users')
            .update({
              subscription_plan: plan,
              subscription_status: 'active',
              stripe_customer_id: customerId,
            })
            .eq('id', userId);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by Stripe customer ID
        const { data: user } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (user) {
          const status = subscription.status === 'active' ? 'active' :
                        subscription.status === 'past_due' ? 'past_due' : 'canceled';

          await supabaseAdmin
            .from('users')
            .update({ subscription_status: status })
            .eq('id', user.id);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data: user } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (user) {
          await supabaseAdmin
            .from('users')
            .update({
              subscription_plan: 'free',
              subscription_status: null,
            })
            .eq('id', user.id);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { data: user } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (user) {
          await supabaseAdmin
            .from('users')
            .update({ subscription_status: 'past_due' })
            .eq('id', user.id);
        }
        break;
      }
    }

    // Mark event as processed for idempotency
    await markEventProcessed(event.id, event.type, event.data.object);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
