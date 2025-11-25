import { z } from 'zod';

/**
 * Environment variable validation schema.
 * This ensures all required environment variables are set at build/runtime.
 */
const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),

  // OpenAI
  OPENAI_API_KEY: z.string().startsWith('sk-', 'OPENAI_API_KEY must start with sk-'),

  // Stripe
  STRIPE_SECRET_KEY: z.string().startsWith('sk_', 'STRIPE_SECRET_KEY must start with sk_'),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_', 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must start with pk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_', 'STRIPE_WEBHOOK_SECRET must start with whsec_'),
  STRIPE_PRO_MONTHLY_PRICE_ID: z.string().startsWith('price_', 'STRIPE_PRO_MONTHLY_PRICE_ID must start with price_'),
  STRIPE_PRO_ANNUAL_PRICE_ID: z.string().startsWith('price_', 'STRIPE_PRO_ANNUAL_PRICE_ID must start with price_'),
  STRIPE_LIFETIME_PRICE_ID: z.string().startsWith('price_', 'STRIPE_LIFETIME_PRICE_ID must start with price_'),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),

  // Optional
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validate environment variables.
 * Call this at application startup to fail fast if configuration is missing.
 *
 * In development, this will log warnings for placeholder values.
 * In production, it will throw errors for invalid values.
 */
export function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const errors = parsed.error.issues.map((issue) => {
      return `  - ${issue.path.join('.')}: ${issue.message}`;
    });

    console.error('Environment validation failed:');
    console.error(errors.join('\n'));

    // In production, throw an error to prevent startup
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Invalid environment configuration. See logs for details.');
    }

    // In development, log warning but continue with placeholder values
    console.warn('\nUsing placeholder values. The app may not function correctly.');
  }

  return parsed.success ? parsed.data : (process.env as unknown as Env);
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
    return process.env.SUPABASE_SERVICE_ROLE_KEY!;
  },
  get openaiApiKey() {
    return process.env.OPENAI_API_KEY!;
  },
  get stripeSecretKey() {
    return process.env.STRIPE_SECRET_KEY!;
  },
  get stripePublishableKey() {
    return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!;
  },
  get stripeWebhookSecret() {
    return process.env.STRIPE_WEBHOOK_SECRET!;
  },
  get appUrl() {
    return process.env.NEXT_PUBLIC_APP_URL!;
  },
  get isDevelopment() {
    return process.env.NODE_ENV === 'development';
  },
  get isProduction() {
    return process.env.NODE_ENV === 'production';
  },
};
