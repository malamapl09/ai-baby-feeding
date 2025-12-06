import { Metadata } from 'next';
import { SharedPlanView } from './SharedPlanView';

interface SharedPlanPageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: SharedPlanPageProps): Promise<Metadata> {
  const { token } = await params;

  // Fetch plan data for metadata
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/share/${token}`, {
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      const plan = data.plan;
      const babyName = plan.babies?.name || 'Baby';

      return {
        title: `${babyName}'s Meal Plan | BabyBites`,
        description: `A ${plan.days}-day meal plan for ${babyName}. View nutritious baby food recipes and meal ideas.`,
        openGraph: {
          title: `${babyName}'s Meal Plan | BabyBites`,
          description: `A ${plan.days}-day meal plan with delicious, age-appropriate recipes.`,
          type: 'website',
        },
      };
    }
  } catch {
    // Fallback metadata
  }

  return {
    title: 'Shared Meal Plan | BabyBites',
    description: 'View this shared baby meal plan with nutritious recipes.',
  };
}

export default async function SharedPlanPage({ params }: SharedPlanPageProps) {
  const { token } = await params;

  return <SharedPlanView token={token} />;
}
