import { createClient } from '@/lib/supabase/server';
import { FoodTrackerClient } from './FoodTrackerClient';

export default async function FoodTrackerPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get baby profile
  const { data: baby } = await supabase
    .from('babies')
    .select('*')
    .eq('user_id', user!.id)
    .single();

  // Get all available foods
  const { data: allFoods } = await supabase
    .from('foods')
    .select('*')
    .order('name');

  // Get baby's tried foods
  const { data: babyFoods } = await supabase
    .from('baby_foods')
    .select('*, food:foods(*)')
    .eq('baby_id', baby?.id);

  const ageInMonths = baby
    ? Math.floor(
        (new Date().getTime() - new Date(baby.birthdate).getTime()) /
          (1000 * 60 * 60 * 24 * 30)
      )
    : 6;

  return (
    <FoodTrackerClient
      baby={baby}
      allFoods={allFoods || []}
      babyFoods={babyFoods || []}
      ageInMonths={ageInMonths}
    />
  );
}
