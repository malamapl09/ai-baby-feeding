'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { StarRatingInput } from './MealRating';
import { TasteFeedback, MealRating } from '@/types';
import { cn } from '@/lib/utils';
import { Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';

interface RatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealId: string;
  mealTitle: string;
  babyId: string;
  existingRating?: MealRating | null;
  onSaved?: (rating: MealRating) => void;
}

const TASTE_OPTIONS: Array<{ value: TasteFeedback; emoji: string; label: string }> = [
  { value: 'loved', emoji: '😍', label: 'Loved it!' },
  { value: 'liked', emoji: '😊', label: 'Liked' },
  { value: 'neutral', emoji: '😐', label: 'Neutral' },
  { value: 'disliked', emoji: '😕', label: 'Disliked' },
  { value: 'rejected', emoji: '😣', label: 'Rejected' },
];

export function RatingDialog({
  open,
  onOpenChange,
  mealId,
  mealTitle,
  babyId,
  existingRating,
  onSaved,
}: RatingDialogProps) {
  const [rating, setRating] = useState<number | null>(existingRating?.rating ?? null);
  const [tasteFeedback, setTasteFeedback] = useState<TasteFeedback | null>(
    existingRating?.taste_feedback ?? null
  );
  const [wouldMakeAgain, setWouldMakeAgain] = useState<boolean | null>(
    existingRating?.would_make_again ?? null
  );
  const [notes, setNotes] = useState(existingRating?.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when dialog opens with new data
  useEffect(() => {
    if (open) {
      setRating(existingRating?.rating ?? null);
      setTasteFeedback(existingRating?.taste_feedback ?? null);
      setWouldMakeAgain(existingRating?.would_make_again ?? null);
      setNotes(existingRating?.notes ?? '');
      setError(null);
    }
  }, [open, existingRating]);

  const handleSave = async () => {
    if (!rating && !tasteFeedback && wouldMakeAgain === null && !notes) {
      setError('Please provide at least one form of feedback');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/meals/${mealId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          babyId,
          rating,
          tasteFeedback,
          wouldMakeAgain,
          notes: notes.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save rating');
      }

      const data = await response.json();
      onSaved?.(data.rating);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save rating');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Meal</DialogTitle>
          <DialogDescription>
            How did your baby like &quot;{mealTitle}&quot;?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label>Overall Rating</Label>
            <div className="flex justify-center py-2">
              <StarRatingInput
                value={rating}
                onChange={setRating}
                size="lg"
              />
            </div>
          </div>

          {/* Taste Feedback */}
          <div className="space-y-2">
            <Label>Baby&apos;s Reaction</Label>
            <div className="grid grid-cols-5 gap-2">
              {TASTE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTasteFeedback(option.value)}
                  className={cn(
                    'flex flex-col items-center p-2 rounded-lg border-2 transition-all',
                    tasteFeedback === option.value
                      ? 'border-rose-500 bg-rose-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <span className="text-xs mt-1 text-gray-600">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Would Make Again */}
          <div className="space-y-2">
            <Label>Would you make this again?</Label>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={wouldMakeAgain === true ? 'default' : 'outline'}
                className={cn(
                  'flex-1',
                  wouldMakeAgain === true && 'bg-green-600 hover:bg-green-700'
                )}
                onClick={() => setWouldMakeAgain(true)}
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                Yes
              </Button>
              <Button
                type="button"
                variant={wouldMakeAgain === false ? 'default' : 'outline'}
                className={cn(
                  'flex-1',
                  wouldMakeAgain === false && 'bg-red-600 hover:bg-red-700'
                )}
                onClick={() => setWouldMakeAgain(false)}
              >
                <ThumbsDown className="w-4 h-4 mr-2" />
                No
              </Button>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes about this meal..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 text-right">{notes.length}/500</p>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-rose-600 hover:bg-rose-700"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Rating'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
