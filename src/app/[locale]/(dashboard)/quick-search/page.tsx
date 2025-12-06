import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { QuickSearchClient } from './QuickSearchClient';

export const metadata = {
  title: 'Quick Search | BabyBites',
  description: 'Find recipes with ingredients you have on hand',
};

export default async function QuickSearchPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get baby profile
  const { data: baby } = await supabase
    .from('babies')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!baby) {
    redirect('/onboarding');
  }

  // Get tried foods
  const { data: babyFoods } = await supabase
    .from('baby_foods')
    .select('food:foods(id, name, category)')
    .eq('baby_id', baby.id)
    .neq('status', 'allergic');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const triedFoods = (babyFoods || [])
    .map((bf: any) => {
      const food = Array.isArray(bf.food) ? bf.food[0] : bf.food;
      return food;
    })
    .filter(Boolean) as Array<{
      id: string;
      name: string;
      category: string;
    }>;

  // Get subscription status
  const { data: userData } = await supabase
    .from('users')
    .select('subscription_plan')
    .eq('id', user.id)
    .single();

  const isPro = userData?.subscription_plan !== 'free';

  return (
    <QuickSearchClient
      baby={baby}
      triedFoods={triedFoods}
      isPro={isPro}
    />
  );
}
