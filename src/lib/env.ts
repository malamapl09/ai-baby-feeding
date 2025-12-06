import { z } from 'zod';

/**
 * Environment variable validation schema.
 * Required variables will cause build failures if missing.
 * Optional variables allow graceful degradation.
 */
const envSchema = z.object({
  // Supabase (required for core functionality)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(), // Only needed for admin operations

  // OpenAI (required for meal plan generation)
  OPENAI_API_KEY: z.string().optional(), // Will fail at runtime if not set when generating plans

  // Stripe (optional - payments disabled if not set)
  STRIPE_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRO_MONTHLY_PRICE_ID: z.string().optional(),
  STRIPE_PRO_ANNUAL_PRICE_ID: z.string().optional(),
  STRIPE_LIFETIME_PRICE_ID: z.string().optional(),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url().optional().default('http://localhost:3000'),

  // Optional
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validate environment variables.
 * Call this at application startup to fail fast if configuration is missing.
 */
export function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const errors = parsed.error.issues.map((issue) => {
      return `  - ${issue.path.join('.')}: ${issue.message}`;
    });

    console.error('Environment validation failed:');
    console.error(errors.join('\n'));

    // In production, throw an error for critical missing vars only
    if (process.env.NODE_ENV === 'production') {
      const criticalMissing = parsed.error.issues.some(
        (issue) =>
          issue.path[0] === 'NEXT_PUBLIC_SUPABASE_URL' ||
          issue.path[0] === 'NEXT_PUBLIC_SUPABASE_ANON_KEY'
      );
      if (criticalMissing) {
        throw new Error('Critical environment variables missing. See logs for details.');
      }
    }

    console.warn('\nSome optional environment variables are missing. Some features may not work.');
  }

  return parsed.success ? parsed.data : (process.env as unknown as Env);
}

/**
 * Check if Stripe is configured
 */
export function isStripeConfigured(): boolean {
  return !!(
    process.env.STRIPE_SECRET_KEY &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  );
}

/**
 * Check if OpenAI is configured
 */
export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

/**
 * Check if we're using placeholder values (for development warnings)
 */
export function hasPlaceholderValues(): boolean {
  const placeholders = [
    'placeholder',
    'sk-placeholder',
    'sk_test_placeholder',
    'pk_test_placeholder',
    'whsec_placeholder',
    'price_placeholder',
  ];

  const values = [
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    process.env.OPENAI_API_KEY,
    process.env.STRIPE_SECRET_KEY,
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    process.env.STRIPE_WEBHOOK_SECRET,
  ];

  return values.some((v) => v && placeholders.some((p) => v.includes(p)));
}

// Export validated env (call validateEnv() in your app entry point)
export const env = {
  get supabaseUrl() {
    return process.env.NEXT_PUBLIC_SUPABASE_URL!;
  },
  get supabaseAnonKey() {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  },
  get supabaseServiceRoleKey() {
    return process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  },
  get openaiApiKey() {
    return process.env.OPENAI_API_KEY || '';
  },
  get stripeSecretKey() {
    return process.env.STRIPE_SECRET_KEY || '';
  },
  get stripePublishableKey() {
    return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
  },
  get stripeWebhookSecret() {
    return process.env.STRIPE_WEBHOOK_SECRET || '';
  },
  get appUrl() {
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  },
  get isDevelopment() {
    return process.env.NODE_ENV === 'development';
  },
  get isProduction() {
    return process.env.NODE_ENV === 'production';
  },
};
