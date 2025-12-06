import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // Supported locales
  locales: ['en', 'es'],

  // Default locale when no locale matches
  defaultLocale: 'en',

  // Use prefix for all locales including default
  localePrefix: 'always',
});

export type Locale = (typeof routing.locales)[number];
