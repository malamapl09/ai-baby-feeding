'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TasteFeedback } from '@/types';

interface MealRatingProps {
  rating?: number | null;
  tasteFeedback?: TasteFeedback | null;
  onRatingClick?: () => void;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

const TASTE_LABELS: Record<TasteFeedback, { emoji: string; label: string }> = {
  loved: { emoji: '😍', label: 'Loved it!' },
  liked: { emoji: '😊', label: 'Liked it' },
  neutral: { emoji: '😐', label: 'Neutral' },
  disliked: { emoji: '😕', label: 'Disliked' },
  rejected: { emoji: '😣', label: 'Rejected' },
};

export function MealRating({
  rating,
  tasteFeedback,
  onRatingClick,
  size = 'sm',
  showLabel = false,
}: MealRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const starSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRatingClick?.();
  };

  // If no rating and clickable, show empty stars
  if (!rating && !tasteFeedback) {
    return (
      <button
        onClick={handleClick}
        className="flex items-center gap-1 text-gray-400 hover:text-amber-400 transition-colors"
        title="Rate this meal"
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              starSize,
              hoverRating && star <= hoverRating ? 'fill-amber-400 text-amber-400' : ''
            )}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(null)}
          />
        ))}
      </button>
    );
  }

  // Show rated state
  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      title="Update rating"
    >
      {/* Stars */}
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              starSize,
              star <= (rating || 0)
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-300'
            )}
          />
        ))}
      </div>

      {/* Taste feedback emoji */}
      {tasteFeedback && (
        <span className="text-sm">
          {TASTE_LABELS[tasteFeedback].emoji}
        </span>
      )}

      {/* Label */}
      {showLabel && tasteFeedback && (
        <span className="text-xs text-gray-500">
          {TASTE_LABELS[tasteFeedback].label}
        </span>
      )}
    </button>
  );
}

// Star rating input component for forms
interface StarRatingInputProps {
  value: number | null;
  onChange: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function StarRatingInput({ value, onChange, size = 'md' }: StarRatingInputProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const sizeClass = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
  }[size];

  const displayRating = hoverRating || value || 0;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(null)}
          className="focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 rounded"
        >
          <Star
            className={cn(
              sizeClass,
              'transition-colors cursor-pointer',
              star <= displayRating
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-300 hover:text-amber-300'
            )}
          />
        </button>
      ))}
    </div>
  );
}
