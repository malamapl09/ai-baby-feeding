'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FOOD_CATEGORIES } from '@/config/constants';
import { Food, BabyFood, FoodCategory, Baby } from '@/types';
import {
  Search,
  Plus,
  Check,
  Heart,
  ThumbsDown,
  AlertTriangle,
  Info,
  Loader2,
  Sparkles,
} from 'lucide-react';

interface FoodTrackerClientProps {
  baby: Baby | null;
  allFoods: Food[];
  babyFoods: BabyFood[];
  ageInMonths: number;
}

type FoodStatus = 'tried' | 'liked' | 'disliked' | 'allergic';

export function FoodTrackerClient({
  baby,
  allFoods,
  babyFoods,
  ageInMonths,
}: FoodTrackerClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<FoodStatus>('tried');
  const [notes, setNotes] = useState('');

  // Create a map of tried foods for quick lookup
  const triedFoodsMap = new Map(
    babyFoods.map((bf) => [bf.food_id, bf])
  );

  // Filter foods
  const filteredFoods = allFoods.filter((food) => {
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || food.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Separate tried and untried
  const triedFoods = filteredFoods.filter((f) => triedFoodsMap.has(f.id));
  const untriedFoods = filteredFoods.filter((f) => !triedFoodsMap.has(f.id));

  // Get foods appropriate for baby's age
  const ageAppropriateFoods = untriedFoods.filter(
    (f) => f.age_min_months <= ageInMonths
  );

  // Suggested next foods (allergens first if not yet tried)
  const suggestedFoods = ageAppropriateFoods
    .filter((f) => f.is_common_allergen)
    .slice(0, 3);

  const handleFoodClick = (food: Food) => {
    const existing = triedFoodsMap.get(food.id);
    setSelectedFood(food);
    if (existing) {
      setStatus(existing.status as FoodStatus);
      setNotes(existing.reaction_notes || '');
    } else {
      setStatus('tried');
      setNotes('');
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedFood || !baby) return;

    setLoading(true);
    const supabase = createClient();

    const existing = triedFoodsMap.get(selectedFood.id);

    if (existing) {
      // Update existing
      await supabase
        .from('baby_foods')
        .update({
          status,
          reaction_notes: notes || null,
        })
        .eq('id', existing.id);
    } else {
      // Insert new
      await supabase.from('baby_foods').insert({
        baby_id: baby.id,
        food_id: selectedFood.id,
        status,
        reaction_notes: notes || null,
        date_introduced: new Date().toISOString().split('T')[0],
      });
    }

    setLoading(false);
    setDialogOpen(false);
    router.refresh();
  };

  const handleRemove = async () => {
    if (!selectedFood || !baby) return;

    const existing = triedFoodsMap.get(selectedFood.id);
    if (!existing) return;

    setLoading(true);
    const supabase = createClient();

    await supabase.from('baby_foods').delete().eq('id', existing.id);

    setLoading(false);
    setDialogOpen(false);
    router.refresh();
  };

  const getStatusIcon = (status: FoodStatus) => {
    switch (status) {
      case 'liked':
        return <Heart className="w-3 h-3 text-pink-500 fill-pink-500" />;
      case 'disliked':
        return <ThumbsDown className="w-3 h-3 text-gray-500" />;
      case 'allergic':
        return <AlertTriangle className="w-3 h-3 text-red-500" />;
      default:
        return <Check className="w-3 h-3 text-green-500" />;
    }
  };

  const getStatusColor = (status: FoodStatus) => {
    switch (status) {
      case 'liked':
        return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'disliked':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'allergic':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Food Tracker</h1>
        <p className="text-gray-600 mt-1">
          Track which foods {baby?.name} has tried and their reactions
        </p>
      </div>

      {/* Suggested Foods */}
      {suggestedFoods.length > 0 && (
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Suggested Next Foods
            </CardTitle>
            <CardDescription>
              These allergens are recommended to introduce early
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {suggestedFoods.map((food) => (
                <Button
                  key={food.id}
                  variant="outline"
                  className="bg-white border-amber-300 hover:bg-amber-50"
                  onClick={() => handleFoodClick(food)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {food.name}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Allergen
                  </Badge>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search foods..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
            className={selectedCategory === 'all' ? 'bg-rose-600 hover:bg-rose-700' : ''}
          >
            All
          </Button>
          {Object.entries(FOOD_CATEGORIES).map(([key, { label, emoji }]) => (
            <Button
              key={key}
              variant={selectedCategory === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(key)}
              className={selectedCategory === key ? 'bg-rose-600 hover:bg-rose-700' : ''}
            >
              {emoji} {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Food Lists */}
      <Tabs defaultValue="untried" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="untried">
            Not Tried ({untriedFoods.length})
          </TabsTrigger>
          <TabsTrigger value="tried">
            Tried ({triedFoods.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="untried" className="mt-4">
          {untriedFoods.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {untriedFoods.map((food) => (
                <button
                  key={food.id}
                  onClick={() => handleFoodClick(food)}
                  className={`p-4 rounded-lg border-2 text-left transition-all hover:border-rose-300 hover:bg-rose-50 ${
                    food.age_min_months > ageInMonths
                      ? 'opacity-50 border-dashed'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-lg">
                      {FOOD_CATEGORIES[food.category as FoodCategory]?.emoji}
                    </span>
                    {food.is_common_allergen && (
                      <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                        Allergen
                      </Badge>
                    )}
                  </div>
                  <p className="font-medium text-sm capitalize">{food.name}</p>
                  {food.age_min_months > ageInMonths && (
                    <p className="text-xs text-gray-500 mt-1">
                      From {food.age_min_months}mo+
                    </p>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No foods found matching your search</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="tried" className="mt-4">
          {triedFoods.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {triedFoods.map((food) => {
                const babyFood = triedFoodsMap.get(food.id);
                return (
                  <button
                    key={food.id}
                    onClick={() => handleFoodClick(food)}
                    className={`p-4 rounded-lg border-2 text-left transition-all hover:opacity-80 ${getStatusColor(
                      babyFood?.status as FoodStatus
                    )}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-lg">
                        {FOOD_CATEGORIES[food.category as FoodCategory]?.emoji}
                      </span>
                      {getStatusIcon(babyFood?.status as FoodStatus)}
                    </div>
                    <p className="font-medium text-sm capitalize">{food.name}</p>
                    <p className="text-xs mt-1 capitalize">{babyFood?.status}</p>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchTerm || selectedCategory !== 'all'
                  ? 'No tried foods match your filters'
                  : 'No foods logged yet. Start adding foods!'}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Food Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 capitalize">
              {selectedFood && FOOD_CATEGORIES[selectedFood.category as FoodCategory]?.emoji}{' '}
              {selectedFood?.name}
            </DialogTitle>
            <DialogDescription>
              Track {baby?.name}&apos;s experience with this food
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Prep Notes */}
            {selectedFood?.prep_notes && (
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                <p className="text-sm text-blue-700">{selectedFood.prep_notes}</p>
              </div>
            )}

            {/* Choking Risk Warning */}
            {selectedFood?.choking_risk === 'high' && (
              <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                <p className="text-sm text-red-700">
                  High choking risk - prepare carefully following safety guidelines
                </p>
              </div>
            )}

            {/* Status Selection */}
            <div className="space-y-2">
              <Label>How did it go?</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'tried', label: 'Just tried', icon: Check, color: 'green' },
                  { value: 'liked', label: 'Loved it!', icon: Heart, color: 'pink' },
                  { value: 'disliked', label: "Didn't like", icon: ThumbsDown, color: 'gray' },
                  { value: 'allergic', label: 'Had reaction', icon: AlertTriangle, color: 'red' },
                ].map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setStatus(option.value as FoodStatus)}
                      className={`p-3 rounded-lg border-2 flex items-center gap-2 transition-all ${
                        status === option.value
                          ? `border-${option.color}-500 bg-${option.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`w-4 h-4 text-${option.color}-500`} />
                      <span className="text-sm">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any observations, reactions, or preferences..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            {triedFoodsMap.has(selectedFood?.id || '') && (
              <Button variant="outline" onClick={handleRemove} disabled={loading}>
                Remove
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
