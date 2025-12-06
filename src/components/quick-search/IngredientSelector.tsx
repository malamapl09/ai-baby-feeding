'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Search, Plus } from 'lucide-react';
import { FOOD_CATEGORIES } from '@/config/constants';

interface TriedFood {
  id: string;
  name: string;
  category: string;
}

interface IngredientSelectorProps {
  triedFoods: TriedFood[];
  selectedIngredients: string[];
  onSelectionChange: (ingredients: string[]) => void;
}

export function IngredientSelector({
  triedFoods,
  selectedIngredients,
  onSelectionChange,
}: IngredientSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Group foods by category
  const foodsByCategory = useMemo(() => {
    const grouped: Record<string, TriedFood[]> = {};
    triedFoods.forEach((food) => {
      if (!grouped[food.category]) {
        grouped[food.category] = [];
      }
      grouped[food.category].push(food);
    });
    return grouped;
  }, [triedFoods]);

  // Filter foods by search
  const filteredFoods = useMemo(() => {
    if (!searchQuery.trim()) return foodsByCategory;

    const query = searchQuery.toLowerCase();
    const filtered: Record<string, TriedFood[]> = {};

    Object.entries(foodsByCategory).forEach(([category, foods]) => {
      const matchingFoods = foods.filter((f) =>
        f.name.toLowerCase().includes(query)
      );
      if (matchingFoods.length > 0) {
        filtered[category] = matchingFoods;
      }
    });

    return filtered;
  }, [foodsByCategory, searchQuery]);

  const toggleIngredient = (name: string) => {
    if (selectedIngredients.includes(name)) {
      onSelectionChange(selectedIngredients.filter((i) => i !== name));
    } else {
      onSelectionChange([...selectedIngredients, name]);
    }
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  const selectAll = (category: string) => {
    const categoryFoods = foodsByCategory[category] || [];
    const categoryNames = categoryFoods.map((f) => f.name);
    const newSelection = [...new Set([...selectedIngredients, ...categoryNames])];
    onSelectionChange(newSelection);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search ingredients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Selected ingredients */}
      {selectedIngredients.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Selected ({selectedIngredients.length})
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-gray-500 h-auto py-1"
            >
              Clear all
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedIngredients.map((ingredient) => (
              <Badge
                key={ingredient}
                variant="secondary"
                className="bg-rose-100 text-rose-700 hover:bg-rose-200 cursor-pointer"
                onClick={() => toggleIngredient(ingredient)}
              >
                {ingredient}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="space-y-3">
        {Object.entries(filteredFoods).map(([category, foods]) => {
          const categoryConfig = FOOD_CATEGORIES[category as keyof typeof FOOD_CATEGORIES] || {
            label: category,
            emoji: '🍽️',
          };
          const isExpanded = expandedCategory === category || searchQuery.trim().length > 0;

          return (
            <div key={category} className="border rounded-lg overflow-hidden">
              <button
                onClick={() =>
                  setExpandedCategory(isExpanded && !searchQuery ? null : category)
                }
                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span>{categoryConfig.emoji}</span>
                  <span className="font-medium">{categoryConfig.label}</span>
                  <span className="text-sm text-gray-500">({foods.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectAll(category);
                    }}
                    className="text-xs text-rose-600 h-auto py-1"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add all
                  </Button>
                </div>
              </button>

              {isExpanded && (
                <div className="p-3 flex flex-wrap gap-2">
                  {foods.map((food) => {
                    const isSelected = selectedIngredients.includes(food.name);
                    return (
                      <Badge
                        key={food.id}
                        variant={isSelected ? 'default' : 'outline'}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-rose-600 text-white hover:bg-rose-700'
                            : 'hover:bg-gray-100'
                        }`}
                        onClick={() => toggleIngredient(food.name)}
                      >
                        {food.name}
                        {isSelected && <X className="w-3 h-3 ml-1" />}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {Object.keys(filteredFoods).length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchQuery
            ? 'No ingredients match your search'
            : 'No tried foods yet. Add foods in the Food Tracker first.'}
        </div>
      )}
    </div>
  );
}
