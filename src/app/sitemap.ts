import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://babybites.app';
  const locales = routing.locales; // ['en', 'es']

  // Public routes that should be indexed
  const staticRoutes = [
    { path: '', changeFrequency: 'weekly' as const, priority: 1.0 },
    { path: '/login', changeFrequency: 'monthly' as const, priority: 0.5 },
    { path: '/signup', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/pricing', changeFrequency: 'weekly' as const, priority: 0.8 },
  ];

  // Generate sitemap entries with hreflang alternates
  const entries: MetadataRoute.Sitemap = staticRoutes.flatMap((route) => {
    // Create language alternates for hreflang
    const languages: Record<string, string> = {};
    locales.forEach((locale) => {
      languages[locale] = `${baseUrl}/${locale}${route.path}`;
    });

    // Create an entry for each locale
    return locales.map((locale) => ({
      url: `${baseUrl}/${locale}${route.path}`,
      lastModified: new Date(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages,
      },
    }));
  });

  return entries;
}
