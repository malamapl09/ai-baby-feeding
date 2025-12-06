'use client';

import { useEffect, useState } from 'react';
import { format, parseISO, differenceInMonths } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Loader2,
  AlertCircle,
  Calendar,
  Clock,
  ChefHat,
  Baby,
  Eye,
  ExternalLink,
  UtensilsCrossed,
} from 'lucide-react';
import { MealPlan, Meal, Recipe, MealType, Ingredient, FamilyAdaptation } from '@/types';

interface SharedPlanViewProps {
  token: string;
}

interface SharedPlanData {
  plan: MealPlan & {
    babies: {
      name: string;
      birthdate: string;
      country: string;
    } | null;
    meals: (Meal & { recipes: Recipe | null })[];
  };
  shareInfo: {
    includePdf: boolean;
    viewCount: number;
    createdAt: string;
  };
}

const mealTypeOrder: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

const mealTypeLabels: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

const mealTypeColors: Record<MealType, string> = {
  breakfast: 'bg-amber-100 text-amber-800',
  lunch: 'bg-green-100 text-green-800',
  dinner: 'bg-blue-100 text-blue-800',
  snack: 'bg-purple-100 text-purple-800',
};

export function SharedPlanView({ token }: SharedPlanViewProps) {
  const [data, setData] = useState<SharedPlanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<(Meal & { recipes: Recipe | null }) | null>(null);
  const [showRecipeDialog, setShowRecipeDialog] = useState(false);

  useEffect(() => {
    const fetchSharedPlan = async () => {
      try {
        const response = await fetch(`/api/share/${token}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to load shared plan');
        }

        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load shared plan');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSharedPlan();
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-orange-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-rose-600 mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading meal plan...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-orange-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">Unable to Load Meal Plan</h2>
              <p className="text-muted-foreground">{error || 'Something went wrong'}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => window.location.href = '/'}
              >
                Go to BabyBites
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { plan, shareInfo } = data;
  const baby = plan.babies;
  const babyAgeMonths = baby?.birthdate
    ? differenceInMonths(new Date(), parseISO(baby.birthdate))
    : null;

  // Group meals by day
  const mealsByDay = plan.meals.reduce((acc, meal) => {
    if (!acc[meal.day_index]) {
      acc[meal.day_index] = [];
    }
    acc[meal.day_index].push(meal);
    return acc;
  }, {} as Record<number, (Meal & { recipes: Recipe | null })[]>);

  // Sort meals within each day
  Object.keys(mealsByDay).forEach((day) => {
    mealsByDay[parseInt(day)].sort(
      (a, b) => mealTypeOrder.indexOf(a.meal_type) - mealTypeOrder.indexOf(b.meal_type)
    );
  });

  const handleMealClick = (meal: Meal & { recipes: Recipe | null }) => {
    setSelectedMeal(meal);
    setShowRecipeDialog(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-6 w-6 text-rose-600" />
              <span className="font-bold text-lg">BabyBites</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/'}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Create Your Own
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Plan Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {baby?.name ? `${baby.name}'s` : ''} Meal Plan
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                  {babyAgeMonths !== null && (
                    <span className="flex items-center gap-1">
                      <Baby className="h-4 w-4" />
                      {babyAgeMonths} months old
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(parseISO(plan.start_date), 'MMM d')} -{' '}
                    {format(parseISO(plan.end_date), 'MMM d, yyyy')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {shareInfo.viewCount} views
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-rose-100 text-rose-700">
                  {plan.days} Days
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {plan.goal.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Days Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: plan.days }, (_, i) => i).map((dayIndex) => {
            const dayMeals = mealsByDay[dayIndex] || [];
            const dayDate = new Date(plan.start_date);
            dayDate.setDate(dayDate.getDate() + dayIndex);

            return (
              <Card key={dayIndex} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-rose-500 to-orange-400 text-white py-3">
                  <CardTitle className="text-base">
                    Day {dayIndex + 1} - {format(dayDate, 'EEEE, MMM d')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {dayMeals.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-4">
                      No meals planned
                    </p>
                  ) : (
                    dayMeals.map((meal) => (
                      <button
                        key={meal.id}
                        onClick={() => handleMealClick(meal)}
                        className="w-full text-left p-3 rounded-lg border hover:border-rose-300 hover:bg-rose-50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <Badge
                              variant="secondary"
                              className={`text-xs mb-1 ${mealTypeColors[meal.meal_type]}`}
                            >
                              {mealTypeLabels[meal.meal_type]}
                            </Badge>
                            <h4 className="font-medium text-sm truncate">{meal.title}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {meal.summary}
                            </p>
                          </div>
                          {meal.recipes && (
                            <div className="flex items-center text-xs text-muted-foreground shrink-0">
                              <Clock className="h-3 w-3 mr-1" />
                              {meal.recipes.prep_time_minutes}m
                            </div>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer CTA */}
        <Card className="mt-8 bg-gradient-to-r from-rose-600 to-orange-500 text-white border-0">
          <CardContent className="py-8 text-center">
            <h2 className="text-xl font-bold mb-2">Create Your Baby&apos;s Meal Plan</h2>
            <p className="text-rose-100 mb-4">
              Get personalized, AI-generated meal plans tailored to your baby&apos;s age and preferences.
            </p>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => window.location.href = '/'}
            >
              Get Started Free
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Recipe Dialog */}
      <Dialog open={showRecipeDialog} onOpenChange={setShowRecipeDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedMeal && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={mealTypeColors[selectedMeal.meal_type]}>
                    {mealTypeLabels[selectedMeal.meal_type]}
                  </Badge>
                  {selectedMeal.recipes && (
                    <span className="text-sm text-muted-foreground flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {selectedMeal.recipes.prep_time_minutes} minutes
                    </span>
                  )}
                </div>
                <DialogTitle className="text-xl">{selectedMeal.title}</DialogTitle>
                <p className="text-muted-foreground">{selectedMeal.summary}</p>
              </DialogHeader>

              {selectedMeal.recipes && (
                <div className="space-y-6 pt-4">
                  {/* Ingredients */}
                  <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-3">
                      <ChefHat className="h-5 w-5 text-rose-600" />
                      Ingredients
                    </h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(selectedMeal.recipes.ingredients as Ingredient[]).map((ing, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                          {ing.quantity} {ing.unit} {ing.name}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Instructions */}
                  <div>
                    <h3 className="font-semibold mb-3">Instructions</h3>
                    <ol className="space-y-3">
                      {(selectedMeal.recipes.instructions as string[]).map((step, idx) => (
                        <li key={idx} className="flex gap-3 text-sm">
                          <span className="flex-shrink-0 h-6 w-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-xs font-medium">
                            {idx + 1}
                          </span>
                          <span className="pt-0.5">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Notes */}
                  {selectedMeal.recipes.texture_notes && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-1">Texture Notes</h4>
                      <p className="text-sm text-blue-800">{selectedMeal.recipes.texture_notes}</p>
                    </div>
                  )}

                  {selectedMeal.recipes.choking_hazard_notes && (
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <h4 className="font-medium text-amber-900 mb-1">Safety Notes</h4>
                      <p className="text-sm text-amber-800">{selectedMeal.recipes.choking_hazard_notes}</p>
                    </div>
                  )}

                  {/* Family Version */}
                  {selectedMeal.recipes.family_version && (
                    <FamilyVersionSection familyVersion={selectedMeal.recipes.family_version as FamilyAdaptation} />
                  )}
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FamilyVersionSection({ familyVersion }: { familyVersion: FamilyAdaptation }) {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
      <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
        <UtensilsCrossed className="h-4 w-4" />
        Family Version: {familyVersion.title}
      </h4>
      <p className="text-sm text-purple-800 mb-3">{familyVersion.modifications}</p>

      {familyVersion.seasonings && familyVersion.seasonings.length > 0 && (
        <div className="mb-2">
          <span className="text-xs font-medium text-purple-700">Add seasonings: </span>
          <span className="text-sm text-purple-800">{familyVersion.seasonings.join(', ')}</span>
        </div>
      )}

      {familyVersion.additional_ingredients && familyVersion.additional_ingredients.length > 0 && (
        <div className="mb-2">
          <span className="text-xs font-medium text-purple-700">Additional ingredients: </span>
          <span className="text-sm text-purple-800">{familyVersion.additional_ingredients.join(', ')}</span>
        </div>
      )}

      <div className="text-xs text-purple-600 mt-2">
        Serves {familyVersion.portion_multiplier}x the baby portion
      </div>
    </div>
  );
}
