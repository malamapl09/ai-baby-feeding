import { APP_NAME } from '@/config/constants';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://babybites.app';

// Organization Schema
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: APP_NAME,
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: 'AI-powered baby meal planning application for parents',
    sameAs: [],
  };
}

// SoftwareApplication Schema
export function generateSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: APP_NAME,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free plan available',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
      bestRating: '5',
      worstRating: '1',
    },
    description:
      'Smart, personalized meal plans for babies. AI-powered nutrition guidance for parents with babies 6-24 months.',
  };
}

// FAQPage Schema
export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// Recipe Schema (for shared meal plans)
export function generateRecipeSchema(recipe: {
  name: string;
  description: string;
  prepTime?: number; // minutes
  ingredients?: string[];
  instructions?: string[];
  image?: string;
  suitableForAgeMonths?: number;
  datePublished?: string; // ISO date string, optional
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.name,
    description: recipe.suitableForAgeMonths
      ? `${recipe.description} Suitable for babies ${recipe.suitableForAgeMonths}+ months.`
      : recipe.description,
    image: recipe.image || `${baseUrl}/og-default.png`,
    author: {
      '@type': 'Organization',
      name: APP_NAME,
    },
    // Use provided date or omit - don't generate dynamic dates that cause hydration issues
    ...(recipe.datePublished && { datePublished: recipe.datePublished }),
    prepTime: recipe.prepTime ? `PT${recipe.prepTime}M` : 'PT15M',
    recipeIngredient: recipe.ingredients || [],
    recipeInstructions: (recipe.instructions || []).map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      text: step,
    })),
    recipeCategory: 'Baby Food',
    suitableForDiet: 'https://schema.org/LowSaltDiet',
  };
}

// JSON-LD Script Component
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}

// Default FAQ data for landing page
export const defaultFAQs = [
  {
    question: 'Can I cancel my subscription anytime?',
    answer:
      "Yes! Monthly and annual subscriptions can be canceled at any time. You'll keep access until the end of your billing period.",
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      "We accept all major credit cards, debit cards, and Apple Pay through Stripe's secure payment system.",
  },
  {
    question: 'Is there a refund policy?',
    answer:
      "We offer a 7-day money-back guarantee. If you're not satisfied, contact us for a full refund.",
  },
  {
    question: `What age range is ${APP_NAME} designed for?`,
    answer:
      `${APP_NAME} is designed for babies and toddlers aged 6-24 months, covering the entire journey from first solids to toddler meals.`,
  },
];
