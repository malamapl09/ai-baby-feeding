import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CalendarDays, Plus, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

export default async function MealPlansPage() {
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

  // Get all meal plans
  const { data: mealPlans } = await supabase
    .from('meal_plans')
    .select('*')
    .eq('baby_id', baby?.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meal Plans</h1>
          <p className="text-gray-600 mt-1">View and manage your generated meal plans</p>
        </div>
        <Link href="/meal-plans/new">
          <Button className="bg-rose-600 hover:bg-rose-700">
            <Plus className="w-4 h-4 mr-2" />
            New Meal Plan
          </Button>
        </Link>
      </div>

      {mealPlans && mealPlans.length > 0 ? (
        <div className="grid gap-4">
          {mealPlans.map((plan) => (
            <Link key={plan.id} href={`/meal-plans/${plan.id}`}>
              <Card className="hover:border-rose-300 hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center">
                        <CalendarDays className="w-6 h-6 text-rose-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {plan.days}-Day Meal Plan
                        </h3>
                        <p className="text-gray-500">
                          {format(new Date(plan.start_date), 'MMM d')} -{' '}
                          {format(new Date(plan.end_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500 capitalize hidden sm:block">
                        {plan.goal.replace('_', ' ')}
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No meal plans yet</h3>
              <p className="text-gray-500 mb-6">
                Generate your first personalized meal plan for your baby
              </p>
              <Link href="/meal-plans/new">
                <Button className="bg-rose-600 hover:bg-rose-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Generate First Plan
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
