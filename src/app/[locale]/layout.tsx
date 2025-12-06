import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Toaster } from "@/components/ui/sonner";
import { APP_NAME } from "@/config/constants";
import { routing } from '@/i18n/routing';
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://babybites.app';

// Generate hreflang alternates
function generateAlternates(locale: string) {
  const languages: Record<string, string> = {};
  routing.locales.forEach((loc) => {
    languages[loc] = `${baseUrl}/${loc}`;
  });

  return {
    canonical: `${baseUrl}/${locale}`,
    languages,
  };
}

interface GenerateMetadataProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: GenerateMetadataProps): Promise<Metadata> {
  const { locale } = await params;

  // Localized content
  const isSpanish = locale === 'es';
  const title = isSpanish
    ? `${APP_NAME} - Planificador de Comidas para Bebés con IA`
    : `${APP_NAME} - AI Baby Meal Planner`;
  const description = isSpanish
    ? 'Planes de comidas inteligentes y personalizados para bebés. Guía nutricional impulsada por IA para padres con bebés de 6-24 meses.'
    : 'Smart, personalized meal plans for babies. AI-powered nutrition guidance for parents with babies 6-24 months.';

  const keywords = isSpanish
    ? [
        'plan de comidas bebé',
        'comida para bebé',
        'nutrición bebé',
        'alimentación infantil',
        'baby led weaning',
        'primeros alimentos',
        'comidas para niños pequeños',
      ]
    : [
        'baby meal plan',
        'baby food',
        'baby nutrition',
        'infant feeding',
        'baby led weaning',
        'first foods',
        'toddler meals',
      ];

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: `%s | ${APP_NAME}`,
    },
    description,
    keywords,
    authors: [{ name: APP_NAME }],
    creator: APP_NAME,
    publisher: APP_NAME,

    // Open Graph
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}`,
      siteName: APP_NAME,
      type: 'website',
      locale: isSpanish ? 'es_ES' : 'en_US',
      images: [
        {
          url: `/${locale}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },

    // Twitter Cards
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`/${locale}/opengraph-image`],
    },

    // Alternates (hreflang)
    alternates: generateAlternates(locale),

    // Robots
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // Validate that the incoming locale is supported
  if (!routing.locales.includes(locale as typeof routing.locales[number])) {
    notFound();
  }

  // Provide all messages to the client
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
