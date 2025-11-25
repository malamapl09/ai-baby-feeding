'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { FEEDING_GOALS, MEAL_TYPES, FREE_TIER_LIMITS } from '@/config/constants';
import { FeedingGoal, MealType, Baby } from '@/types';
import { Loader2, Calendar, Sparkles, AlertCircle, Crown } from 'lucide-react';
import Link from 'next/link';

export default function NewMealPlanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [baby, setBaby] = useState<Baby | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [plansRemaining, setPlansRemaining] = useState<number>(FREE_TIER_LIMITS.plansPerWeek);

  // Form state
  const [days, setDays] = useState<3 | 7>(7);
  const [mealsPerDay, setMealsPerDay] = useState<MealType[]>(['breakfast', 'lunch', 'dinner']);
  const [goal, setGoal] = useState<FeedingGoal>('balanced_nutrition');
  const [includeNewFoods, setIncludeNewFoods] = useState(true);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Get baby
      const { data: babyData } = await supabase
        .from('babies')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (babyData) {
        setBaby(babyData as Baby);
        setGoal(babyData.feeding_goal as FeedingGoal);
      }

      // Get subscription info
      const { data: userData } = await supabase
        .from('users')
        .select('subscription_plan, plans_generated_this_week')
        .eq('id', user.id)
        .single();

      const userIsPro = userData?.subscription_plan !== 'free';
      setIsPro(userIsPro);
      if (!userIsPro) {
        setPlansRemaining(
          FREE_TIER_LIMITS.plansPerWeek - (userData?.plans_generated_this_week || 0)
        );
      }

      setChecking(false);
    }

    loadData();
  }, [router]);

  const handleMealTypeToggle = (mealType: MealType) => {
    setMealsPerDay((prev) =>
      prev.includes(mealType)
        ? prev.filter((m) => m !== mealType)
        : [...prev, mealType]
    );
  };

  const handleSubmit = async () => {
    if (!baby) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          babyId: baby.id,
          days,
          mealsPerDay,
          goal,
          includeNewFoods,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          setError(data.message || 'Weekly plan limit reached');
        } else {
          throw new Error(data.error || 'Failed to generate meal plan');
        }
        return;
      }

      router.push(`/meal-plans/${data.planId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
      </div>
    );
  }

  const canGenerate = isPro || plansRemaining > 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Generate Meal Plan</h1>
        <p className="text-gray-600 mt-1">
          Create a personalized meal plan for {baby?.name}
        </p>
      </div>

      {!isPro && (
        <Card className={plansRemaining > 0 ? 'border-amber-200 bg-amber-50' : 'border-red-200 bg-red-50'}>
          <CardContent className="pt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {plansRemaining > 0 ? (
                <AlertCircle className="w-5 h-5 text-amber-600" />
              ) : (
                <Crown className="w-5 h-5 text-red-600" />
              )}
              <div>
                <p className="font-medium text-gray-900">
                  {plansRemaining > 0
                    ? `${plansRemaining} free plan${plansRemaining > 1 ? 's' : ''} remaining this week`
                    : 'Weekly limit reached'}
                </p>
                <p className="text-sm text-gray-600">
                  Upgrade to Pro for unlimited plans
                </p>
              </div>
            </div>
            <Link href="/pricing">
              <Button variant="outline" size="sm">
                Upgrade
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Plan Duration
          </CardTitle>
          <CardDescription>How many days should the meal plan cover?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[3, 7].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d as 3 | 7)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  days === d
                    ? 'border-rose-500 bg-rose-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="text-2xl font-bold">{d}</p>
                <p className="text-sm text-gray-600">days</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Meals Per Day</CardTitle>
          <CardDescription>Select which meals to include</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(MEAL_TYPES).map(([key, { label, emoji }]) => (
              <div
                key={key}
                className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  mealsPerDay.includes(key as MealType)
                    ? 'border-rose-500 bg-rose-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleMealTypeToggle(key as MealType)}
              >
                <Checkbox
                  checked={mealsPerDay.includes(key as MealType)}
                  onCheckedChange={() => handleMealTypeToggle(key as MealType)}
                />
                <span className="text-lg">{emoji}</span>
                <Label className="cursor-pointer">{label}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feeding Goal</CardTitle>
          <CardDescription>What&apos;s your main priority?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(FEEDING_GOALS).map(([key, { label, description }]) => (
              <div
                key={key}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  goal === key
                    ? 'border-rose-500 bg-rose-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setGoal(key as FeedingGoal)}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      goal === key ? 'border-rose-500 bg-rose-500' : 'border-gray-300'
                    }`}
                  >
                    {goal === key && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{label}</p>
                    <p className="text-sm text-gray-500">{description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
              includeNewFoods
                ? 'border-rose-500 bg-rose-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setIncludeNewFoods(!includeNewFoods)}
          >
            <Checkbox
              checked={includeNewFoods}
              onCheckedChange={(checked) => setIncludeNewFoods(checked as boolean)}
            />
            <div>
              <Label className="cursor-pointer font-medium">Include new food introductions</Label>
              <p className="text-sm text-gray-500">
                Suggest one new food per day to expand variety
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardFooter className="pt-6">
          <Button
            onClick={handleSubmit}
            disabled={loading || !canGenerate || mealsPerDay.length === 0}
            className="w-full bg-rose-600 hover:bg-rose-700"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating your meal plan...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Meal Plan
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
