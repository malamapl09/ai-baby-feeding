import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://babybites.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/en',
          '/es',
          '/en/login',
          '/es/login',
          '/en/signup',
          '/es/signup',
          '/en/pricing',
          '/es/pricing',
          '/shared/',
        ],
        disallow: [
          '/api/',
          '/en/dashboard',
          '/es/dashboard',
          '/en/meal-plans',
          '/es/meal-plans',
          '/en/food-tracker',
          '/es/food-tracker',
          '/en/grocery-list',
          '/es/grocery-list',
          '/en/settings',
          '/es/settings',
          '/en/allergen-schedule',
          '/es/allergen-schedule',
          '/en/quick-search',
          '/es/quick-search',
          '/en/onboarding',
          '/es/onboarding',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
