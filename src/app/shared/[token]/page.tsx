import { Metadata } from 'next';
import { SharedPlanView } from './SharedPlanView';
import { JsonLd, generateRecipeSchema } from '@/lib/seo/structured-data';
import { APP_NAME } from '@/config/constants';

interface SharedPlanPageProps {
  params: Promise<{ token: string }>;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://babybites.app';

export async function generateMetadata({ params }: SharedPlanPageProps): Promise<Metadata> {
  const { token } = await params;

  // Fetch plan data for metadata
  try {
    const response = await fetch(`${baseUrl}/api/share/${token}`, {
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      const plan = data.plan;
      const babyName = plan.babies?.name || 'Baby';

      const title = `${babyName}'s Meal Plan | ${APP_NAME}`;
      const description = `A ${plan.days}-day meal plan for ${babyName}. View nutritious baby food recipes and meal ideas.`;

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          type: 'website',
          url: `${baseUrl}/shared/${token}`,
          siteName: APP_NAME,
          images: [
            {
              url: `/shared/${token}/opengraph-image`,
              width: 1200,
              height: 630,
              alt: `${babyName}'s Meal Plan`,
            },
          ],
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images: [`/shared/${token}/opengraph-image`],
        },
      };
    }
  } catch {
    // Fallback metadata
  }

  return {
    title: `Shared Meal Plan | ${APP_NAME}`,
    description: 'View this shared baby meal plan with nutritious recipes.',
    openGraph: {
      title: `Shared Meal Plan | ${APP_NAME}`,
      description: 'View this shared baby meal plan with nutritious recipes.',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Shared Meal Plan | ${APP_NAME}`,
      description: 'View this shared baby meal plan with nutritious recipes.',
    },
  };
}

// Fetch plan data for Recipe schema
async function getPlanData(token: string) {
  try {
    const response = await fetch(`${baseUrl}/api/share/${token}`, {
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      return data.plan;
    }
  } catch {
    return null;
  }
  return null;
}

export default async function SharedPlanPage({ params }: SharedPlanPageProps) {
  const { token } = await params;

  // Fetch plan for Recipe JSON-LD
  const plan = await getPlanData(token);

  // Generate Recipe schema if plan has meal data
  const recipeSchema = plan
    ? generateRecipeSchema({
        name: `${plan.babies?.name || 'Baby'}'s ${plan.days}-Day Meal Plan`,
        description: `A personalized ${plan.days}-day meal plan with age-appropriate recipes for babies.`,
        prepTime: 15,
        suitableForAgeMonths: plan.babies?.age_months,
      })
    : null;

  return (
    <>
      {recipeSchema && <JsonLd data={recipeSchema} />}
      <SharedPlanView token={token} />
    </>
  );
}
