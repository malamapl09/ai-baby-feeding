import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { MealPlanView } from './MealPlanView';

interface MealPlanPageProps {
  params: Promise<{ id: string }>;
}

export default async function MealPlanPage({ params }: MealPlanPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get baby to verify ownership
  const { data: baby } = await supabase
    .from('babies')
    .select('id, name')
    .eq('user_id', user!.id)
    .single();

  // Get meal plan
  const { data: mealPlan } = await supabase
    .from('meal_plans')
    .select('*')
    .eq('id', id)
    .eq('baby_id', baby?.id)
    .single();

  if (!mealPlan) {
    notFound();
  }

  // Get all meals with recipes
  const { data: meals } = await supabase
    .from('meals')
    .select('*, recipe:recipes(*)')
    .eq('plan_id', id)
    .order('day_index')
    .order('meal_type');

  // Get grocery list if exists
  const { data: groceryList } = await supabase
    .from('grocery_lists')
    .select('*')
    .eq('plan_id', id)
    .single();

  return (
    <MealPlanView
      mealPlan={mealPlan}
      meals={meals || []}
      groceryList={groceryList}
      babyName={baby?.name || 'Baby'}
    />
  );
}
