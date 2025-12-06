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
import { MealType, FoodCategory, FeedingGoal, GroceryItem, MealRating as MealRatingType, FamilyAdaptation, NutritionInfo } from '@/types';
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
  Snowflake,
  Flame,
  Package,
  Star,
  RefreshCw,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { ExportDialog } from '@/components/export/ExportDialog';
import { ShareDialog } from '@/components/share/ShareDialog';
import { CalendarSyncDialog } from '@/components/calendar/CalendarSyncDialog';
import { toPng } from 'html-to-image';
import { MealRating } from '@/components/meal-plan/MealRating';
import { RatingDialog } from '@/components/meal-plan/RatingDialog';
import { SwapDialog } from '@/components/meal-plan/SwapDialog';
import { NutritionLabel } from '@/components/meal-plan/NutritionLabel';
import { MealSwapSuggestion } from '@/types';

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
      batch_info?: {
        makeAheadNotes: string | null;
        storageInstructions: string | null;
        freezable: boolean;
        reheatInstructions: string | null;
        prepDayTasks: string[];
      } | null;
      family_version?: FamilyAdaptation | null;
      nutrition_info?: NutritionInfo | null;
    } | null;
  }>;
  groceryList: {
    items: GroceryItem[];
  } | null;
  babyId: string;
  babyName: string;
  ratingsMap: Record<string, MealRatingType>;
}

export function MealPlanView({ mealPlan, meals, groceryList, babyId, babyName, ratingsMap: initialRatingsMap }: MealPlanViewProps) {
  const router = useRouter();
  const [selectedMeal, setSelectedMeal] = useState<(typeof meals)[0] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [generatingList, setGeneratingList] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [mealToRate, setMealToRate] = useState<(typeof meals)[0] | null>(null);
  const [ratingsMap, setRatingsMap] = useState<Record<string, MealRatingType>>(initialRatingsMap);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);

  const handleRatingClick = (meal: (typeof meals)[0], e?: React.MouseEvent) => {
    e?.stopPropagation();
    setMealToRate(meal);
    setRatingDialogOpen(true);
  };

  const handleRatingSaved = (rating: MealRatingType) => {
    setRatingsMap((prev) => ({
      ...prev,
      [rating.meal_id]: rating,
    }));
  };

  // Swap functionality
  const [swapDialogOpen, setSwapDialogOpen] = useState(false);
  const [mealToSwap, setMealToSwap] = useState<(typeof meals)[0] | null>(null);
  const [swappedMeals, setSwappedMeals] = useState<Record<string, MealSwapSuggestion>>({});

  const handleSwapClick = (meal: (typeof meals)[0], e?: React.MouseEvent) => {
    e?.stopPropagation();
    setMealToSwap(meal);
    setSwapDialogOpen(true);
  };

  const handleSwapSelected = (suggestion: MealSwapSuggestion) => {
    if (mealToSwap) {
      setSwappedMeals((prev) => ({
        ...prev,
        [mealToSwap.id]: suggestion,
      }));
    }
  };

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

  const handleExport = async (format: 'pdf' | 'png', layout?: 'compact' | 'detailed') => {
    if (format === 'pdf') {
      const response = await fetch('/api/export/meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: mealPlan.id, format, layout }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `meal-plan-${babyName.toLowerCase().replace(/\s+/g, '-')}-${mealPlan.start_date}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } else if (format === 'png') {
      // For PNG, capture the current view
      const element = document.getElementById('meal-plan-content');
      if (element) {
        const dataUrl = await toPng(element, { quality: 0.95, backgroundColor: '#ffffff' });
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `meal-plan-${babyName.toLowerCase().replace(/\s+/g, '-')}-${mealPlan.start_date}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    }
  };

  const handleShare = () => {
    setShareDialogOpen(true);
  };

  return (
    <div className="space-y-6" id="meal-plan-content">
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
          <Button variant="outline" size="sm" onClick={() => setCalendarDialogOpen(true)}>
            <Calendar className="w-4 h-4 mr-2" />
            Calendar
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={() => setExportDialogOpen(true)}>
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
                          {/* Rating display */}
                          <div className="mt-2">
                            <MealRating
                              rating={ratingsMap[meal.id]?.rating}
                              tasteFeedback={ratingsMap[meal.id]?.taste_feedback}
                              onRatingClick={() => handleRatingClick(meal)}
                            />
                          </div>
                          {/* Compact nutrition display */}
                          {meal.recipe?.nutrition_info && (
                            <div className="mt-2">
                              <NutritionLabel nutrition={meal.recipe.nutrition_info} compact />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <ChefHat className="w-5 h-5 text-gray-400" />
                        <div className="flex gap-1">
                          {/* Quick swap button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-gray-500 hover:text-blue-600 p-1 h-auto"
                            onClick={(e) => handleSwapClick(meal, e)}
                          >
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Swap
                          </Button>
                          {/* Quick rate button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-gray-500 hover:text-rose-600 p-1 h-auto"
                            onClick={(e) => handleRatingClick(meal, e)}
                          >
                            <Star className="w-4 h-4 mr-1" />
                            Rate
                          </Button>
                        </div>
                        {/* Show if meal has been swapped */}
                        {swappedMeals[meal.id] && (
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                            Swapped
                          </Badge>
                        )}
                      </div>
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

              {/* Nutrition Info */}
              {selectedMeal.recipe.nutrition_info && (
                <div className="pt-4 border-t">
                  <NutritionLabel nutrition={selectedMeal.recipe.nutrition_info} />
                </div>
              )}

              {/* Batch Cooking Info */}
              {selectedMeal.recipe.batch_info && (
                <div className="space-y-3 pt-4 border-t">
                  <h4 className="font-medium flex items-center gap-2">
                    <Package className="w-4 h-4 text-rose-600" />
                    Meal Prep Info
                  </h4>

                  {selectedMeal.recipe.batch_info.makeAheadNotes && (
                    <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                      <Clock className="w-4 h-4 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-700">Make Ahead</p>
                        <p className="text-sm text-green-600">{selectedMeal.recipe.batch_info.makeAheadNotes}</p>
                      </div>
                    </div>
                  )}

                  {selectedMeal.recipe.batch_info.storageInstructions && (
                    <div className="flex items-start gap-2 p-3 bg-purple-50 rounded-lg">
                      <Snowflake className="w-4 h-4 text-purple-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-purple-700">
                          Storage {selectedMeal.recipe.batch_info.freezable && '(Freezable)'}
                        </p>
                        <p className="text-sm text-purple-600">{selectedMeal.recipe.batch_info.storageInstructions}</p>
                      </div>
                    </div>
                  )}

                  {selectedMeal.recipe.batch_info.reheatInstructions && (
                    <div className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg">
                      <Flame className="w-4 h-4 text-orange-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-orange-700">Reheating</p>
                        <p className="text-sm text-orange-600">{selectedMeal.recipe.batch_info.reheatInstructions}</p>
                      </div>
                    </div>
                  )}

                  {selectedMeal.recipe.batch_info.prepDayTasks && selectedMeal.recipe.batch_info.prepDayTasks.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Prep Day Tasks:</p>
                      <ul className="space-y-1">
                        {selectedMeal.recipe.batch_info.prepDayTasks.map((task, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="w-1.5 h-1.5 bg-rose-400 rounded-full" />
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Family Version */}
              {selectedMeal.recipe.family_version && (
                <div className="space-y-3 pt-4 border-t">
                  <h4 className="font-medium flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    Family Version: {selectedMeal.recipe.family_version.title}
                  </h4>

                  <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-700">How to Adapt</p>
                      <p className="text-sm text-blue-600">{selectedMeal.recipe.family_version.modifications}</p>
                    </div>
                  </div>

                  {selectedMeal.recipe.family_version.seasonings && selectedMeal.recipe.family_version.seasonings.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Suggested Seasonings:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedMeal.recipe.family_version.seasonings.map((seasoning, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {seasoning}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedMeal.recipe.family_version.additional_ingredients && selectedMeal.recipe.family_version.additional_ingredients.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Optional Add-ons:</p>
                      <ul className="space-y-1">
                        {selectedMeal.recipe.family_version.additional_ingredients.map((ingredient, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                            {ingredient}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Serves: {selectedMeal.recipe.family_version.portion_multiplier}x baby portion
                    </span>
                  </div>

                  {selectedMeal.recipe.family_version.cooking_adjustments && (
                    <p className="text-sm text-gray-500 italic">
                      Tip: {selectedMeal.recipe.family_version.cooking_adjustments}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        type="meal-plan"
        onExport={handleExport}
      />

      {/* Rating Dialog */}
      {mealToRate && (
        <RatingDialog
          open={ratingDialogOpen}
          onOpenChange={setRatingDialogOpen}
          mealId={mealToRate.id}
          mealTitle={mealToRate.title}
          babyId={babyId}
          existingRating={ratingsMap[mealToRate.id]}
          onSaved={handleRatingSaved}
        />
      )}

      {/* Swap Dialog */}
      {mealToSwap && (
        <SwapDialog
          open={swapDialogOpen}
          onOpenChange={setSwapDialogOpen}
          mealId={mealToSwap.id}
          mealTitle={swappedMeals[mealToSwap.id]?.title || mealToSwap.title}
          mealType={mealToSwap.meal_type}
          onSwapSelected={handleSwapSelected}
        />
      )}

      {/* Share Dialog */}
      <ShareDialog
        planId={mealPlan.id}
        planTitle={`${mealPlan.days}-Day Meal Plan for ${babyName}`}
        isOpen={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
      />

      {/* Calendar Sync Dialog */}
      <CalendarSyncDialog
        planId={mealPlan.id}
        planTitle={`${mealPlan.days}-Day Meal Plan for ${babyName}`}
        startDate={mealPlan.start_date}
        isOpen={calendarDialogOpen}
        onClose={() => setCalendarDialogOpen(false)}
      />
    </div>
  );
}
