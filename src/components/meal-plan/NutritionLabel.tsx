'use client';

import { NutritionInfo } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Flame, Beef, Droplets, Sun, Pill, Apple, Wheat, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface NutritionLabelProps {
  nutrition: NutritionInfo;
  compact?: boolean;
}

export function NutritionLabel({ nutrition, compact = false }: NutritionLabelProps) {
  const t = useTranslations('nutrition');

  if (compact) {
    return <CompactNutritionLabel nutrition={nutrition} t={t} />;
  }

  return <FullNutritionLabel nutrition={nutrition} t={t} />;
}

interface NutritionLabelInnerProps {
  nutrition: NutritionInfo;
  t: (key: string) => string;
}

function CompactNutritionLabel({ nutrition, t }: NutritionLabelInnerProps) {
  // Highlight good sources of iron and calcium for babies
  const isGoodIronSource = nutrition.iron_mg >= 1.5;
  const isGoodCalciumSource = nutrition.calcium_mg >= 50;

  return (
    <div className="flex flex-wrap gap-1.5">
      <Badge variant="secondary" className="gap-1 text-xs">
        <Flame className="w-3 h-3 text-orange-500" />
        {Math.round(nutrition.calories)} {t('nutrition.cal')}
      </Badge>
      <Badge variant="secondary" className="gap-1 text-xs">
        <Beef className="w-3 h-3 text-red-500" />
        {nutrition.protein_grams}g
      </Badge>
      {isGoodIronSource && (
        <Badge variant="secondary" className="gap-1 text-xs bg-green-50 text-green-700 border-green-200">
          <Droplets className="w-3 h-3" />
          {t('nutrition.goodIron')}
        </Badge>
      )}
      {isGoodCalciumSource && (
        <Badge variant="secondary" className="gap-1 text-xs bg-blue-50 text-blue-700 border-blue-200">
          <Pill className="w-3 h-3" />
          {t('nutrition.goodCalcium')}
        </Badge>
      )}
    </div>
  );
}

function FullNutritionLabel({ nutrition, t }: NutritionLabelInnerProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
        <h4 className="font-semibold text-gray-900">{t('nutrition.title')}</h4>
        <span className="text-sm text-gray-500">
          {t('nutrition.servingSize')}: {nutrition.serving_size}
        </span>
      </div>

      {/* Macronutrients */}
      <div className="space-y-2">
        <h5 className="text-sm font-medium text-gray-700">{t('nutrition.macros')}</h5>
        <div className="grid grid-cols-2 gap-2">
          <NutrientRow
            icon={<Flame className="w-4 h-4 text-orange-500" />}
            label={t('nutrition.calories')}
            value={Math.round(nutrition.calories)}
            unit="kcal"
          />
          <NutrientRow
            icon={<Beef className="w-4 h-4 text-red-500" />}
            label={t('nutrition.protein')}
            value={nutrition.protein_grams}
            unit="g"
          />
          <NutrientRow
            icon={<Wheat className="w-4 h-4 text-amber-600" />}
            label={t('nutrition.carbs')}
            value={nutrition.carbs_grams}
            unit="g"
          />
          <NutrientRow
            icon={<Apple className="w-4 h-4 text-yellow-500" />}
            label={t('nutrition.fat')}
            value={nutrition.fat_grams}
            unit="g"
          />
          <NutrientRow
            icon={<Wheat className="w-4 h-4 text-green-600" />}
            label={t('nutrition.fiber')}
            value={nutrition.fiber_grams}
            unit="g"
          />
        </div>
      </div>

      {/* Baby-focused micronutrients */}
      <div className="space-y-2">
        <h5 className="text-sm font-medium text-gray-700">{t('nutrition.micronutrients')}</h5>
        <div className="grid grid-cols-2 gap-2">
          <NutrientRow
            icon={<Droplets className="w-4 h-4 text-red-600" />}
            label={t('nutrition.iron')}
            value={nutrition.iron_mg}
            unit="mg"
            highlight={nutrition.iron_mg >= 1.5}
            highlightColor="green"
          />
          <NutrientRow
            icon={<Pill className="w-4 h-4 text-blue-500" />}
            label={t('nutrition.calcium')}
            value={nutrition.calcium_mg}
            unit="mg"
            highlight={nutrition.calcium_mg >= 50}
            highlightColor="blue"
          />
          <NutrientRow
            icon={<Sun className="w-4 h-4 text-orange-400" />}
            label={t('nutrition.vitaminA')}
            value={nutrition.vitamin_a_mcg}
            unit="mcg"
          />
          <NutrientRow
            icon={<Sun className="w-4 h-4 text-yellow-400" />}
            label={t('nutrition.vitaminC')}
            value={nutrition.vitamin_c_mg}
            unit="mg"
          />
          <NutrientRow
            icon={<Sun className="w-4 h-4 text-amber-400" />}
            label={t('nutrition.vitaminD')}
            value={nutrition.vitamin_d_mcg}
            unit="mcg"
          />
        </div>
      </div>

      {/* Age-appropriate notes */}
      {nutrition.age_appropriate_notes && (
        <div className="flex items-start gap-2 bg-blue-50 rounded-md p-3 text-sm text-blue-800">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{nutrition.age_appropriate_notes}</span>
        </div>
      )}
    </div>
  );
}

interface NutrientRowProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  highlight?: boolean;
  highlightColor?: 'green' | 'blue';
}

function NutrientRow({
  icon,
  label,
  value,
  unit,
  highlight = false,
  highlightColor = 'green',
}: NutrientRowProps) {
  const highlightClasses = {
    green: 'bg-green-50 border-green-200',
    blue: 'bg-blue-50 border-blue-200',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between p-2 rounded-md border',
        highlight ? highlightClasses[highlightColor] : 'bg-white border-gray-100'
      )}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <span className="text-sm font-medium text-gray-900">
        {value}
        {unit}
      </span>
    </div>
  );
}
