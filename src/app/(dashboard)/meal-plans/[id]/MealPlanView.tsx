'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MEAL_TYPES, FOOD_CATEGORIES, FEEDING_GOALS } from '@/config/constants';
import { MealType, FoodCategory, FeedingGoal, GroceryItem } from '@/types';
import { format, addDays } from 'date-fns';
import {
  Calendar,
  Clock,
  ShoppingCart,
  ChefHat,
  AlertTriangle,
  Info,
  ArrowLeft,
  Download,
  Share2,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

interface MealPlanViewProps {
  mealPlan: {
    id: string;
    start_date: string;
    end_date: string;
    goal: string;
    days: number;
  };
  meals: Array<{
    id: string;
    day_index: number;
    meal_type: string;
    title: string;
    summary: string;
    recipe: {
      ingredients: Array<{ name: string; quantity: string; unit: string; category: string }>;
      instructions: string[];
      prep_time_minutes: number;
      texture_notes: string | null;
      choking_hazard_notes: string | null;
    } | null;
  }>;
  groceryList: {
    items: GroceryItem[];
  } | null;
  babyName: string;
}

export function MealPlanView({ mealPlan, meals, groceryList, babyName }: MealPlanViewProps) {
  const router = useRouter();
  const [selectedMeal, setSelectedMeal] = useState<(typeof meals)[0] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [generatingList, setGeneratingList] = useState(false);

  // Group meals by day
  const mealsByDay: Record<number, typeof meals> = {};
  meals.forEach((meal) => {
    if (!mealsByDay[meal.day_index]) {
      mealsByDay[meal.day_index] = [];
    }
    mealsByDay[meal.day_index].push(meal);
  });

  const handleMealClick = (meal: (typeof meals)[0]) => {
    setSelectedMeal(meal);
    setDialogOpen(true);
  };

  const handleGenerateGroceryList = async () => {
    setGeneratingList(true);
    try {
      const response = await fetch('/api/generate-grocery-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: mealPlan.id }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Error generating grocery list:', error);
    } finally {
      setGeneratingList(false);
    }
  };

  const sortMeals = (meals: typeof mealsByDay[0]) => {
    const order: MealType[] = ['breakfast', 'lunch', 'snack', 'dinner'];
    return meals.sort(
      (a, b) =>
        order.indexOf(a.meal_type as MealType) - order.indexOf(b.meal_type as MealType)
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/meal-plans">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {mealPlan.days}-Day Meal Plan
            </h1>
            <p className="text-gray-600">
              {format(new Date(mealPlan.start_date), 'MMM d')} -{' '}
              {format(new Date(mealPlan.end_date), 'MMM d, yyyy')} for {babyName}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Plan Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <Badge variant="secondary" className="text-sm">
              <Calendar className="w-4 h-4 mr-1" />
              {mealPlan.days} days
            </Badge>
            <Badge variant="secondary" className="text-sm capitalize">
              {FEEDING_GOALS[mealPlan.goal as FeedingGoal]?.label}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Daily Tabs */}
      <Tabs defaultValue="0" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
          {Array.from({ length: mealPlan.days }, (_, i) => (
            <TabsTrigger key={i} value={i.toString()} className="flex-shrink-0">
              <span className="hidden sm:inline">
                {format(addDays(new Date(mealPlan.start_date), i), 'EEE, MMM d')}
              </span>
              <span className="sm:hidden">Day {i + 1}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {Array.from({ length: mealPlan.days }, (_, dayIndex) => (
          <TabsContent key={dayIndex} value={dayIndex.toString()} className="mt-4">
            <div className="grid gap-4">
              {mealsByDay[dayIndex] && sortMeals(mealsByDay[dayIndex]).map((meal) => (
                <Card
                  key={meal.id}
                  className="cursor-pointer hover:border-rose-300 hover:shadow-md transition-all"
                  onClick={() => handleMealClick(meal)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="text-2xl">
                          {MEAL_TYPES[meal.meal_type as MealType]?.emoji}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs capitalize">
                              {MEAL_TYPES[meal.meal_type as MealType]?.label}
                            </Badge>
                            {meal.recipe?.prep_time_minutes && (
                              <span className="text-xs text-gray-500 flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {meal.recipe.prep_time_minutes} min
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-gray-900">{meal.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{meal.summary}</p>
                        </div>
                      </div>
                      <ChefHat className="w-5 h-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Grocery List Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Grocery List
          </CardTitle>
          <CardDescription>
            All ingredients needed for this meal plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {groceryList ? (
            <div className="space-y-4">
              {Object.entries(
                groceryList.items.reduce((acc, item) => {
                  const category = item.category || 'other';
                  if (!acc[category]) acc[category] = [];
                  acc[category].push(item);
                  return acc;
                }, {} as Record<string, GroceryItem[]>)
              ).map(([category, items]) => (
                <div key={category}>
                  <h4 className="font-medium text-sm text-gray-700 mb-2 capitalize flex items-center gap-2">
                    {FOOD_CATEGORIES[category as FoodCategory]?.emoji}{' '}
                    {FOOD_CATEGORIES[category as FoodCategory]?.label || category}
                  </h4>
                  <div className="space-y-1">
                    {items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-sm p-2 rounded hover:bg-gray-50"
                      >
                        <span className="capitalize">{item.name}</span>
                        <span className="text-gray-500">
                          - {item.quantity} {item.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <Link href={`/grocery-list?plan=${mealPlan.id}`}>
                <Button variant="outline" className="w-full mt-4">
                  View Full Grocery List
                </Button>
              </Link>
            </div>
          ) : (
            <div className="text-center py-6">
              <ShoppingCart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">
                Generate a grocery list from this meal plan
              </p>
              <Button
                onClick={handleGenerateGroceryList}
                disabled={generatingList}
                className="bg-rose-600 hover:bg-rose-700"
              >
                {generatingList ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Generate Grocery List
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recipe Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedMeal && MEAL_TYPES[selectedMeal.meal_type as MealType]?.emoji}{' '}
              {selectedMeal?.title}
            </DialogTitle>
            <DialogDescription>{selectedMeal?.summary}</DialogDescription>
          </DialogHeader>

          {selectedMeal?.recipe && (
            <div className="space-y-6 pt-4">
              {/* Prep Time */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Prep time: {selectedMeal.recipe.prep_time_minutes} minutes</span>
              </div>

              {/* Texture Notes */}
              {selectedMeal.recipe.texture_notes && (
                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                  <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-700">Texture Guide</p>
                    <p className="text-sm text-blue-600">{selectedMeal.recipe.texture_notes}</p>
                  </div>
                </div>
              )}

              {/* Choking Hazard Notes */}
              {selectedMeal.recipe.choking_hazard_notes && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-700">Safety Note</p>
                    <p className="text-sm text-amber-600">
                      {selectedMeal.recipe.choking_hazard_notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Ingredients */}
              <div>
                <h4 className="font-medium mb-3">Ingredients</h4>
                <ul className="space-y-2">
                  {selectedMeal.recipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                      <span className="capitalize">{ing.name}</span>
                      <span className="text-gray-500">
                        - {ing.quantity} {ing.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              <div>
                <h4 className="font-medium mb-3">Instructions</h4>
                <ol className="space-y-3">
                  {selectedMeal.recipe.instructions.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="w-6 h-6 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium">
                        {i + 1}
                      </span>
                      <span className="pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
