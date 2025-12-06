'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { IngredientSelector } from '@/components/quick-search/IngredientSelector';
import { RecipeResults } from '@/components/quick-search/RecipeResults';
import { Baby } from '@/types';
import { Search, Sparkles, ChefHat, Info, Crown } from 'lucide-react';
import Link from 'next/link';

interface TriedFood {
  id: string;
  name: string;
  category: string;
}

interface RecipeMatch {
  id: string;
  title: string;
  summary: string;
  prepTimeMinutes: number;
  ingredients: string[];
  matchedIngredients: string[];
  matchScore: number;
  mealType: string;
}

interface AISuggestion {
  title: string;
  summary: string;
  ingredients: string[];
  instructions: string[];
  prepTimeMinutes: number;
  textureNotes?: string;
}

interface QuickSearchClientProps {
  baby: Baby;
  triedFoods: TriedFood[];
  isPro: boolean;
}

export function QuickSearchClient({ baby, triedFoods, isPro }: QuickSearchClientProps) {
  const router = useRouter();
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [includeAiSuggestions, setIncludeAiSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<{
    existingRecipes: RecipeMatch[];
    aiSuggestions: AISuggestion[];
  }>({
    existingRecipes: [],
    aiSuggestions: [],
  });
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (selectedIngredients.length === 0) return;

    setIsSearching(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch('/api/quick-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          babyId: baby.id,
          ingredients: selectedIngredients,
          filterByTriedFoods: true,
          includeAiSuggestions,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setResults({
        existingRecipes: data.existingRecipes,
        aiSuggestions: data.aiSuggestions,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSearching(false);
    }
  };

  const handleRecipeClick = (recipeId: string) => {
    // Navigate to meal plan view or show recipe details
    // For now, we'll just log it since recipes are tied to meal plans
    console.log('View recipe:', recipeId);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">What Can I Make?</h1>
        <p className="text-gray-600 mt-1">
          Find recipes using ingredients you have on hand
        </p>
      </div>

      {/* Info card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800">
              Select ingredients from {baby.name}&apos;s tried foods list. We&apos;ll match them
              against recipes from your meal plans and optionally generate new ideas.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Ingredient Selection */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="w-5 h-5" />
                Select Ingredients
              </CardTitle>
              <CardDescription>
                Choose what you have available ({triedFoods.length} tried foods)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IngredientSelector
                triedFoods={triedFoods}
                selectedIngredients={selectedIngredients}
                onSelectionChange={setSelectedIngredients}
              />
            </CardContent>
          </Card>

          {/* Options */}
          <Card>
            <CardHeader>
              <CardTitle>Search Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  includeAiSuggestions
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setIncludeAiSuggestions(!includeAiSuggestions)}
              >
                <Checkbox
                  checked={includeAiSuggestions}
                  onCheckedChange={(checked) => setIncludeAiSuggestions(checked as boolean)}
                />
                <div className="flex-1">
                  <Label className="cursor-pointer font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Include AI suggestions
                  </Label>
                  <p className="text-sm text-gray-500">
                    Generate new recipe ideas using your selected ingredients
                  </p>
                </div>
                {!isPro && (
                  <Link href="/pricing">
                    <Button variant="outline" size="sm" className="text-amber-600 border-amber-300">
                      <Crown className="w-3 h-3 mr-1" />
                      Pro
                    </Button>
                  </Link>
                )}
              </div>

              <Button
                onClick={handleSearch}
                disabled={selectedIngredients.length === 0 || isSearching}
                className="w-full bg-rose-600 hover:bg-rose-700"
                size="lg"
              >
                <Search className="w-4 h-4 mr-2" />
                {isSearching ? 'Searching...' : 'Find Recipes'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Results
              </CardTitle>
              <CardDescription>
                {hasSearched
                  ? `Found ${results.existingRecipes.length} matching recipes`
                  : 'Select ingredients and search to see results'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="p-3 mb-4 bg-red-50 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <RecipeResults
                existingRecipes={results.existingRecipes}
                aiSuggestions={results.aiSuggestions}
                selectedIngredients={selectedIngredients}
                isLoading={isSearching}
                onRecipeClick={handleRecipeClick}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* No tried foods CTA */}
      {triedFoods.length === 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">No tried foods yet</p>
                <p className="text-sm text-gray-600">
                  Add foods to {baby.name}&apos;s profile to use this feature
                </p>
              </div>
              <Link href="/food-tracker">
                <Button className="bg-rose-600 hover:bg-rose-700">
                  Go to Food Tracker
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
