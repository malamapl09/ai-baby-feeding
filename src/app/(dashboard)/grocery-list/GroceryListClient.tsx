'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FOOD_CATEGORIES } from '@/config/constants';
import { FoodCategory, GroceryItem } from '@/types';
import { format } from 'date-fns';
import {
  ShoppingCart,
  Copy,
  Check,
  Download,
  CalendarDays,
} from 'lucide-react';
import Link from 'next/link';

interface GroceryListClientProps {
  groceryLists: Array<{
    id: string;
    plan_id: string;
    items: GroceryItem[];
    created_at: string;
    meal_plan: {
      id: string;
      start_date: string;
      end_date: string;
      days: number;
    };
  }>;
  selectedPlanId?: string;
}

export function GroceryListClient({ groceryLists, selectedPlanId }: GroceryListClientProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  const activeList = selectedPlanId
    ? groceryLists.find((l) => l.plan_id === selectedPlanId)
    : groceryLists[0];

  const handleCheckItem = (itemKey: string) => {
    setCheckedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemKey)) {
        newSet.delete(itemKey);
      } else {
        newSet.add(itemKey);
      }
      return newSet;
    });
  };

  const handleCopyList = async () => {
    if (!activeList) return;

    const text = Object.entries(
      activeList.items.reduce((acc, item) => {
        const category = item.category || 'other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
      }, {} as Record<string, GroceryItem[]>)
    )
      .map(
        ([category, items]) =>
          `${FOOD_CATEGORIES[category as FoodCategory]?.label || category}:\n${items
            .map((item) => `  - ${item.name} (${item.quantity} ${item.unit})`)
            .join('\n')}`
      )
      .join('\n\n');

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!activeList) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grocery List</h1>
          <p className="text-gray-600 mt-1">Your shopping lists from meal plans</p>
        </div>

        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No grocery lists yet</h3>
              <p className="text-gray-500 mb-6">
                Generate a meal plan first, then create a grocery list from it
              </p>
              <Link href="/meal-plans">
                <Button className="bg-rose-600 hover:bg-rose-700">
                  View Meal Plans
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group items by category
  const itemsByCategory = activeList.items.reduce((acc, item) => {
    const category = item.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, GroceryItem[]>);

  const checkedCount = checkedItems.size;
  const totalCount = activeList.items.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grocery List</h1>
          <p className="text-gray-600 mt-1">
            Shopping list for {activeList.meal_plan.days}-day meal plan
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyList}>
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy List
              </>
            )}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Plan Info */}
      <Card className="bg-gray-50">
        <CardContent className="pt-4 flex items-center gap-3">
          <CalendarDays className="w-5 h-5 text-gray-500" />
          <div>
            <p className="font-medium">
              {format(new Date(activeList.meal_plan.start_date), 'MMM d')} -{' '}
              {format(new Date(activeList.meal_plan.end_date), 'MMM d, yyyy')}
            </p>
            <p className="text-sm text-gray-500">
              {checkedCount} of {totalCount} items checked
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Progress Bar */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 rounded-full transition-all duration-300"
          style={{ width: `${(checkedCount / totalCount) * 100}%` }}
        />
      </div>

      {/* Grocery Items by Category */}
      <div className="space-y-6">
        {Object.entries(itemsByCategory).map(([category, items]) => (
          <Card key={category}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <span>{FOOD_CATEGORIES[category as FoodCategory]?.emoji}</span>
                <span>{FOOD_CATEGORIES[category as FoodCategory]?.label || category}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {items.map((item, i) => {
                  const itemKey = `${category}-${item.name}-${i}`;
                  const isChecked = checkedItems.has(itemKey);
                  return (
                    <div
                      key={itemKey}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer ${
                        isChecked ? 'bg-green-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleCheckItem(itemKey)}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => handleCheckItem(itemKey)}
                      />
                      <span
                        className={`flex-1 capitalize ${
                          isChecked ? 'line-through text-gray-400' : ''
                        }`}
                      >
                        {item.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Other Lists */}
      {groceryLists.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Previous Lists</CardTitle>
            <CardDescription>Grocery lists from other meal plans</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {groceryLists
                .filter((l) => l.id !== activeList.id)
                .map((list) => (
                  <Link
                    key={list.id}
                    href={`/grocery-list?plan=${list.plan_id}`}
                    className="block p-3 rounded-lg border hover:border-rose-300 hover:bg-rose-50/50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {list.meal_plan.days}-Day Plan
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(list.meal_plan.start_date), 'MMM d')} -{' '}
                          {format(new Date(list.meal_plan.end_date), 'MMM d')}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500">
                        {list.items.length} items
                      </p>
                    </div>
                  </Link>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
