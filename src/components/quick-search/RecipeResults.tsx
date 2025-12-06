'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ChefHat, Sparkles, Check, AlertTriangle } from 'lucide-react';

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

interface RecipeResultsProps {
  existingRecipes: RecipeMatch[];
  aiSuggestions: AISuggestion[];
  selectedIngredients: string[];
  isLoading?: boolean;
  onRecipeClick?: (recipeId: string) => void;
}

export function RecipeResults({
  existingRecipes,
  aiSuggestions,
  selectedIngredients,
  isLoading = false,
  onRecipeClick,
}: RecipeResultsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (existingRecipes.length === 0 && aiSuggestions.length === 0) {
    return (
      <Card className="bg-gray-50">
        <CardContent className="pt-6 text-center">
          <ChefHat className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 font-medium">No recipes found</p>
          <p className="text-sm text-gray-500 mt-1">
            {selectedIngredients.length === 0
              ? 'Select some ingredients to find matching recipes'
              : 'Try selecting different ingredients or fewer restrictions'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Existing recipes from past meal plans */}
      {existingRecipes.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <ChefHat className="w-4 h-4" />
            From Your Meal Plans ({existingRecipes.length})
          </h3>
          {existingRecipes.map((recipe) => (
            <Card
              key={recipe.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onRecipeClick?.(recipe.id)}
            >
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{recipe.title}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(recipe.matchScore * 100)}% match
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{recipe.summary}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {recipe.prepTimeMinutes} min
                      </span>
                      <span className="capitalize">{recipe.mealType}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {recipe.ingredients.slice(0, 5).map((ing) => (
                        <Badge
                          key={ing}
                          variant="outline"
                          className={`text-xs ${
                            recipe.matchedIngredients.includes(ing.toLowerCase())
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : ''
                          }`}
                        >
                          {recipe.matchedIngredients.includes(ing.toLowerCase()) && (
                            <Check className="w-2 h-2 mr-1" />
                          )}
                          {ing}
                        </Badge>
                      ))}
                      {recipe.ingredients.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{recipe.ingredients.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* AI-generated suggestions */}
      {aiSuggestions.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            AI Suggestions ({aiSuggestions.length})
          </h3>
          {aiSuggestions.map((suggestion, index) => (
            <Card key={index} className="border-amber-200 bg-amber-50/50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                  <Badge className="bg-amber-100 text-amber-700 text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Generated
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{suggestion.summary}</p>

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {suggestion.prepTimeMinutes} min
                  </span>
                  {suggestion.textureNotes && (
                    <span className="text-rose-600">{suggestion.textureNotes}</span>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-1">Ingredients:</p>
                    <div className="flex flex-wrap gap-1">
                      {suggestion.ingredients.map((ing, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {ing}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-1">Instructions:</p>
                    <ol className="text-sm text-gray-600 space-y-1">
                      {suggestion.instructions.map((step, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-rose-600 font-medium">{i + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
