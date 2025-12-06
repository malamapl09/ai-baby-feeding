import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AllergenScheduleClient } from './AllergenScheduleClient';

export const metadata = {
  title: 'Allergen Schedule | BabyBites',
  description: 'Track allergen introductions for your baby',
};

export default async function AllergenSchedulePage() {
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

  // Get all foods that are common allergens
  const { data: allergenFoods } = await supabase
    .from('foods')
    .select('id, name')
    .eq('is_common_allergen', true);

  // Get baby's allergen food records
  const { data: babyAllergens } = await supabase
    .from('baby_foods')
    .select('food_id, status, date_introduced, reaction_notes, food:foods(name, is_common_allergen)')
    .eq('baby_id', baby.id);

  // Filter to only allergens
  const allergenRecords = (babyAllergens || []).filter((record: { food: { is_common_allergen: boolean } | { is_common_allergen: boolean }[] | null }) => {
    const food = Array.isArray(record.food) ? record.food[0] : record.food;
    return food?.is_common_allergen;
  });

  return (
    <AllergenScheduleClient
      baby={baby}
      allergenFoods={allergenFoods || []}
      allergenRecords={allergenRecords}
    />
  );
}
