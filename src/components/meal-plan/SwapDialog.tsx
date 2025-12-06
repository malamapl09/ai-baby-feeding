'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { MealSwapSuggestion, SwapReason } from '@/types';
import { cn } from '@/lib/utils';
import {
  Loader2,
  RefreshCw,
  Clock,
  Check,
  ShoppingBag,
  Frown,
  Shuffle,
  Apple,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';

interface SwapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealId: string;
  mealTitle: string;
  mealType: string;
  onSwapSelected?: (suggestion: MealSwapSuggestion) => void;
}

const SWAP_REASONS: Array<{ value: SwapReason; label: string; icon: React.ReactNode; description: string }> = [
  {
    value: 'missing_ingredient',
    label: 'Missing ingredients',
    icon: <ShoppingBag className="w-5 h-5" />,
    description: 'I don\'t have some ingredients',
  },
  {
    value: 'dont_like',
    label: 'Baby didn\'t like it',
    icon: <Frown className="w-5 h-5" />,
    description: 'Looking for different flavors',
  },
  {
    value: 'want_variety',
    label: 'Want variety',
    icon: <Shuffle className="w-5 h-5" />,
    description: 'Need something different',
  },
  {
    value: 'dietary',
    label: 'Dietary reasons',
    icon: <Apple className="w-5 h-5" />,
    description: 'Dietary restrictions or preferences',
  },
  {
    value: 'other',
    label: 'Other',
    icon: <HelpCircle className="w-5 h-5" />,
    description: 'Another reason',
  },
];

export function SwapDialog({
  open,
  onOpenChange,
  mealId,
  mealTitle,
  mealType,
  onSwapSelected,
}: SwapDialogProps) {
  const [step, setStep] = useState<'reason' | 'loading' | 'suggestions'>('reason');
  const [selectedReason, setSelectedReason] = useState<SwapReason | null>(null);
  const [customReason, setCustomReason] = useState('');
  const [suggestions, setSuggestions] = useState<MealSwapSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<MealSwapSuggestion | null>(null);

  const handleGetSuggestions = async () => {
    if (!selectedReason) return;

    setStep('loading');
    setError(null);

    try {
      const response = await fetch(`/api/meals/${mealId}/swap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: selectedReason,
          customReason: selectedReason === 'other' ? customReason : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to get suggestions');
      }

      const data = await response.json();
      setSuggestions(data.suggestions);
      setStep('suggestions');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get suggestions');
      setStep('reason');
    }
  };

  const handleSelectSuggestion = (suggestion: MealSwapSuggestion) => {
    setSelectedSuggestion(suggestion);
  };

  const handleConfirmSwap = () => {
    if (selectedSuggestion) {
      onSwapSelected?.(selectedSuggestion);
      handleClose();
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after close animation
    setTimeout(() => {
      setStep('reason');
      setSelectedReason(null);
      setCustomReason('');
      setSuggestions([]);
      setError(null);
      setSelectedSuggestion(null);
    }, 200);
  };

  const handleBack = () => {
    if (step === 'suggestions') {
      setStep('reason');
      setSelectedSuggestion(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-rose-600" />
            Swap Meal
          </DialogTitle>
          <DialogDescription>
            Find an alternative for &quot;{mealTitle}&quot;
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Select Reason */}
        {step === 'reason' && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Why do you want to swap this meal?</Label>
              <div className="grid gap-2">
                {SWAP_REASONS.map((reason) => (
                  <button
                    key={reason.value}
                    type="button"
                    onClick={() => setSelectedReason(reason.value)}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all',
                      selectedReason === reason.value
                        ? 'border-rose-500 bg-rose-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div className={cn(
                      'p-2 rounded-lg',
                      selectedReason === reason.value ? 'bg-rose-100 text-rose-600' : 'bg-gray-100 text-gray-600'
                    )}>
                      {reason.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{reason.label}</p>
                      <p className="text-sm text-gray-500">{reason.description}</p>
                    </div>
                    {selectedReason === reason.value && (
                      <Check className="w-5 h-5 text-rose-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {selectedReason === 'other' && (
              <div className="space-y-2">
                <Label htmlFor="customReason">Tell us more (optional)</Label>
                <Input
                  id="customReason"
                  placeholder="What are you looking for?"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  maxLength={200}
                />
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}

            <Button
              onClick={handleGetSuggestions}
              disabled={!selectedReason}
              className="w-full bg-rose-600 hover:bg-rose-700"
            >
              Get Alternatives
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 2: Loading */}
        {step === 'loading' && (
          <div className="py-12 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-rose-600 mx-auto mb-4" />
            <p className="text-gray-600">Finding alternatives...</p>
            <p className="text-sm text-gray-400 mt-1">This may take a few seconds</p>
          </div>
        )}

        {/* Step 3: Suggestions */}
        {step === 'suggestions' && (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Select an alternative:</p>
              <Button variant="ghost" size="sm" onClick={handleBack}>
                Change reason
              </Button>
            </div>

            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <Card
                  key={index}
                  className={cn(
                    'cursor-pointer transition-all',
                    selectedSuggestion === suggestion
                      ? 'border-rose-500 bg-rose-50'
                      : 'hover:border-rose-300'
                  )}
                  onClick={() => handleSelectSuggestion(suggestion)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{suggestion.title}</h4>
                          {selectedSuggestion === suggestion && (
                            <Check className="w-4 h-4 text-rose-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{suggestion.summary}</p>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {suggestion.prep_time_minutes} min
                          </Badge>
                          <Badge variant="outline" className="text-xs capitalize">
                            {mealType}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">{suggestion.swap_reason}</p>
                      </div>
                    </div>

                    {selectedSuggestion === suggestion && (
                      <div className="mt-3 pt-3 border-t border-rose-200">
                        <p className="text-xs font-medium text-gray-700 mb-1">Ingredients:</p>
                        <p className="text-xs text-gray-600">
                          {suggestion.ingredients.map(i => i.name).join(', ')}
                        </p>
                        <p className="text-xs font-medium text-gray-700 mt-2 mb-1">Nutrition note:</p>
                        <p className="text-xs text-gray-600">{suggestion.nutritional_comparison}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleConfirmSwap}
                disabled={!selectedSuggestion}
                className="flex-1 bg-rose-600 hover:bg-rose-700"
              >
                Use This Meal
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
