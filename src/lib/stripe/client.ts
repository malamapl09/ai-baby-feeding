import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover',
      typescript: true,
    });
  }
  return _stripe;
}

// For backward compatibility - lazy getter
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return getStripeClient()[prop as keyof Stripe];
  },
});
