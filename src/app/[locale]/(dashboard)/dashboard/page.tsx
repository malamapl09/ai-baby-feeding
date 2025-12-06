import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { formatAge } from '@/lib/utils/age';
import { FEEDING_GOALS, FREE_TIER_LIMITS } from '@/config/constants';
import {
  CalendarDays,
  Apple,
  Plus,
  Sparkles,
  TrendingUp,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { FeedingGoal } from '@/types';

export default async function DashboardPage() {
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

  // Get user subscription info
  const { data: userData } = await supabase
    .from('users')
    .select('subscription_plan, plans_generated_this_week')
    .eq('id', user!.id)
    .single();

  // Get food stats
  const { count: triedFoodsCount } = await supabase
    .from('baby_foods')
    .select('*', { count: 'exact', head: true })
    .eq('baby_id', baby?.id);

  // Get recent meal plans
  const { data: recentPlans } = await supabase
    .from('meal_plans')
    .select('*')
    .eq('baby_id', baby?.id)
    .order('created_at', { ascending: false })
    .limit(3);

  const isPro = userData?.subscription_plan !== 'free';
  const plansRemaining = isPro
    ? 'unlimited'
    : FREE_TIER_LIMITS.plansPerWeek - (userData?.plans_generated_this_week || 0);

  const ageInMonths = baby
    ? Math.floor(
        (new Date().getTime() - new Date(baby.birthdate).getTime()) /
          (1000 * 60 * 60 * 24 * 30)
      )
    : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Here&apos;s what&apos;s happening with {baby?.name}&apos;s meals
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link href="/meal-plans/new">
            <Button className="bg-rose-600 hover:bg-rose-700">
              <Plus className="w-4 h-4 mr-2" />
              Generate Meal Plan
            </Button>
          </Link>
        </div>
      </div>

      {/* Baby Profile Card */}
      <Card className="bg-gradient-to-r from-rose-50 to-amber-50 border-rose-100">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-sm">
                👶
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{baby?.name}</h2>
                <p className="text-gray-600">{formatAge(baby?.birthdate || '')}</p>
                <Badge variant="secondary" className="mt-2">
                  {FEEDING_GOALS[baby?.feeding_goal as FeedingGoal]?.label}
                </Badge>
              </div>
            </div>
            <Link href="/settings/baby">
              <Button variant="ghost" size="sm">
                Edit
              </Button>
            </Link>
          </div>

          {/* Age-specific tip */}
          {ageInMonths >= 6 && ageInMonths < 12 && (
            <div className="mt-4 p-3 bg-white/70 rounded-lg flex items-start space-x-3">
              <Sparkles className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Age-appropriate tip</p>
                <p className="text-sm text-gray-600">
                  At {ageInMonths} months, focus on single-ingredient purees and watch for any
                  reactions when introducing new foods.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Foods Tried */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Foods Tried</CardTitle>
            <Apple className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{triedFoodsCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Track new foods in the Food Tracker
            </p>
            <Link href="/food-tracker" className="mt-3 inline-block">
              <Button variant="link" className="p-0 h-auto text-rose-600">
                Add foods <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Meal Plans */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plans This Week</CardTitle>
            <CalendarDays className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {typeof plansRemaining === 'number' ? (
                <>
                  {FREE_TIER_LIMITS.plansPerWeek - plansRemaining} /{' '}
                  {FREE_TIER_LIMITS.plansPerWeek}
                </>
              ) : (
                recentPlans?.length || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isPro ? 'Unlimited plans available' : `${plansRemaining} remaining this week`}
            </p>
            {!isPro && plansRemaining === 0 && (
              <Link href="/pricing" className="mt-3 inline-block">
                <Button variant="link" className="p-0 h-auto text-amber-600">
                  Upgrade for unlimited <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Introduction Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.min(Math.round(((triedFoodsCount || 0) / 50) * 100), 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              of recommended first 50 foods
            </p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full"
                style={{ width: `${Math.min(((triedFoodsCount || 0) / 50) * 100, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Meal Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Meal Plans</CardTitle>
          <CardDescription>Your latest generated meal plans</CardDescription>
        </CardHeader>
        <CardContent>
          {recentPlans && recentPlans.length > 0 ? (
            <div className="space-y-4">
              {recentPlans.map((plan) => (
                <Link
                  key={plan.id}
                  href={`/meal-plans/${plan.id}`}
                  className="block p-4 border rounded-lg hover:border-rose-300 hover:bg-rose-50/50 transition-all"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        {plan.days}-Day Plan
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(plan.start_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        -{' '}
                        {new Date(plan.end_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No meal plans yet</p>
              <Link href="/meal-plans/new">
                <Button className="bg-rose-600 hover:bg-rose-700">
                  Generate Your First Plan
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="flex items-start space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
        <div>
          <p className="text-sm text-amber-800">
            <strong>Important:</strong> This app provides general feeding guidance and is not
            a substitute for professional medical advice. Always consult your pediatrician
            about your baby&apos;s specific dietary needs.
          </p>
        </div>
      </div>
    </div>
  );
}
