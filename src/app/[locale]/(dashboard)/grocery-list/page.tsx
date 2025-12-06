import { createClient } from '@/lib/supabase/server';
import { GroceryListClient } from './GroceryListClient';

interface GroceryListPageProps {
  searchParams: Promise<{ plan?: string }>;
}

export default async function GroceryListPage({ searchParams }: GroceryListPageProps) {
  const { plan: planId } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get baby profile
  const { data: baby } = await supabase
    .from('babies')
    .select('id')
    .eq('user_id', user!.id)
    .single();

  // Get grocery lists
  let groceryListQuery = supabase
    .from('grocery_lists')
    .select('*, meal_plan:meal_plans(*)')
    .order('created_at', { ascending: false });

  if (planId) {
    groceryListQuery = groceryListQuery.eq('plan_id', planId);
  }

  const { data: groceryLists } = await groceryListQuery;

  // Filter to only user's grocery lists
  const userGroceryLists = groceryLists?.filter(
    (list) => list.meal_plan?.baby_id === baby?.id
  );

  return <GroceryListClient groceryLists={userGroceryLists || []} selectedPlanId={planId} />;
}
