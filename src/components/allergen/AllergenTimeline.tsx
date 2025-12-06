'use client';

import { format, differenceInMonths, addMonths, startOfMonth } from 'date-fns';

interface AllergenIntroduction {
  name: string;
  status: 'pending' | 'introduced' | 'allergic';
  dateIntroduced?: string | null;
}

interface AllergenTimelineProps {
  birthdate: string;
  allergens: AllergenIntroduction[];
}

const ALLERGEN_ICONS: Record<string, string> = {
  milk: '🥛',
  eggs: '🥚',
  peanuts: '🥜',
  'tree nuts': '🌰',
  soy: '🫘',
  wheat: '🌾',
  fish: '🐟',
  shellfish: '🦐',
  sesame: '🫘',
};

export function AllergenTimeline({ birthdate, allergens }: AllergenTimelineProps) {
  const birth = new Date(birthdate);
  const today = new Date();
  const ageMonths = differenceInMonths(today, birth);

  // Show timeline from 6 months to current age + 2 months (or 12 months minimum)
  const startMonth = 6;
  const endMonth = Math.max(12, ageMonths + 2);
  const months = [];

  for (let i = startMonth; i <= endMonth; i++) {
    months.push(i);
  }

  // Group introductions by month
  const introductionsByMonth: Record<number, AllergenIntroduction[]> = {};

  allergens.forEach((allergen) => {
    if (allergen.dateIntroduced && allergen.status !== 'pending') {
      const introDate = new Date(allergen.dateIntroduced);
      const monthsSinceBirth = differenceInMonths(introDate, birth);
      if (!introductionsByMonth[monthsSinceBirth]) {
        introductionsByMonth[monthsSinceBirth] = [];
      }
      introductionsByMonth[monthsSinceBirth].push(allergen);
    }
  });

  return (
    <div className="relative">
      {/* Timeline bar */}
      <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 rounded-full" />

      {/* Progress bar */}
      <div
        className="absolute top-6 left-0 h-1 bg-rose-400 rounded-full transition-all"
        style={{
          width: `${Math.min(100, ((ageMonths - startMonth) / (endMonth - startMonth)) * 100)}%`
        }}
      />

      {/* Month markers */}
      <div className="flex justify-between relative">
        {months.map((month) => {
          const isPast = month <= ageMonths;
          const isCurrent = month === ageMonths;
          const introductions = introductionsByMonth[month] || [];

          return (
            <div key={month} className="flex flex-col items-center relative">
              {/* Marker dot */}
              <div
                className={`w-3 h-3 rounded-full border-2 z-10 ${
                  isCurrent
                    ? 'bg-rose-500 border-rose-500 ring-4 ring-rose-100'
                    : isPast
                      ? 'bg-rose-400 border-rose-400'
                      : 'bg-white border-gray-300'
                }`}
              />

              {/* Month label */}
              <span className={`text-xs mt-2 ${
                isCurrent ? 'font-bold text-rose-600' : isPast ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {month}mo
              </span>

              {/* Allergen introductions at this month */}
              {introductions.length > 0 && (
                <div className="absolute -top-8 flex gap-0.5">
                  {introductions.map((intro) => (
                    <span
                      key={intro.name}
                      className={`text-sm cursor-default ${
                        intro.status === 'allergic' ? 'opacity-50' : ''
                      }`}
                      title={`${intro.name}${intro.status === 'allergic' ? ' (allergic)' : ''}`}
                    >
                      {ALLERGEN_ICONS[intro.name.toLowerCase()] || '🍽️'}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-6 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-rose-400" />
          <span>Introduced</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-gray-300" />
          <span>Future</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-rose-500 ring-2 ring-rose-100" />
          <span>Current age</span>
        </div>
      </div>
    </div>
  );
}
