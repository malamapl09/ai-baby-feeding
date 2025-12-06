'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AllergenCard } from '@/components/allergen/AllergenCard';
import { AllergenTimeline } from '@/components/allergen/AllergenTimeline';
import { COMMON_ALLERGENS } from '@/config/constants';
import { Baby } from '@/types';
import { AlertTriangle, Calendar, Check, Clock, Info, Shield } from 'lucide-react';
import Link from 'next/link';
import { differenceInMonths } from 'date-fns';

interface AllergenFood {
  id: string;
  name: string;
}

interface AllergenRecord {
  food_id: string;
  status: 'tried' | 'allergic' | 'pending';
  date_introduced: string | null;
  reaction_notes: string | null;
  food: { name: string; is_common_allergen: boolean } | { name: string; is_common_allergen: boolean }[] | null;
}

interface AllergenScheduleClientProps {
  baby: Baby;
  allergenFoods: AllergenFood[];
  allergenRecords: AllergenRecord[];
}

export function AllergenScheduleClient({
  baby,
  allergenFoods,
  allergenRecords,
}: AllergenScheduleClientProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'introduced' | 'allergic'>('all');

  const birthdate = new Date(baby.birthdate);
  const ageMonths = differenceInMonths(new Date(), birthdate);

  // Build allergen status map
  const allergenStatusMap = new Map<string, {
    status: 'pending' | 'introduced' | 'allergic';
    dateIntroduced: string | null;
    reactionNotes: string | null;
  }>();

  allergenRecords.forEach((record) => {
    const food = Array.isArray(record.food) ? record.food[0] : record.food;
    if (food) {
      const normalizedName = food.name.toLowerCase();
      allergenStatusMap.set(normalizedName, {
        status: record.status === 'tried' ? 'introduced' : record.status === 'allergic' ? 'allergic' : 'pending',
        dateIntroduced: record.date_introduced,
        reactionNotes: record.reaction_notes,
      });
    }
  });

  // Build full allergen list with status
  const allergens = COMMON_ALLERGENS.map((allergenName) => {
    const existing = allergenStatusMap.get(allergenName);
    return {
      name: allergenName,
      status: existing?.status || 'pending',
      dateIntroduced: existing?.dateIntroduced || null,
      reactionNotes: existing?.reactionNotes || null,
    };
  });

  // Filter allergens
  const filteredAllergens = allergens.filter((a) => {
    if (filter === 'all') return true;
    return a.status === filter;
  });

  // Stats
  const stats = {
    total: allergens.length,
    introduced: allergens.filter((a) => a.status === 'introduced').length,
    pending: allergens.filter((a) => a.status === 'pending').length,
    allergic: allergens.filter((a) => a.status === 'allergic').length,
  };

  const progressPercentage = Math.round((stats.introduced / stats.total) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Allergen Introduction Schedule</h1>
        <p className="text-gray-600 mt-1">
          Track the 9 major allergens for {baby.name}
        </p>
      </div>

      {/* Age Notice */}
      {ageMonths < 6 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Too early for solids</p>
              <p className="text-sm text-amber-700">
                Most pediatricians recommend starting solids around 6 months of age.
                {baby.name} is currently {ageMonths} months old.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Introduction Progress
          </CardTitle>
          <CardDescription>
            Early allergen introduction (between 6-12 months) may reduce allergy risk
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">
                  {stats.introduced} of {stats.total} allergens introduced
                </span>
                <span className="font-medium text-rose-600">{progressPercentage}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Stats badges */}
            <div className="flex flex-wrap gap-3">
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                <Check className="w-3 h-3 mr-1" />
                {stats.introduced} Introduced
              </Badge>
              <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                <Clock className="w-3 h-3 mr-1" />
                {stats.pending} Pending
              </Badge>
              {stats.allergic > 0 && (
                <Badge variant="secondary" className="bg-red-100 text-red-700">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {stats.allergic} Allergic
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Introduction Timeline
          </CardTitle>
          <CardDescription>
            Visual overview of when allergens were introduced
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AllergenTimeline
            birthdate={baby.birthdate}
            allergens={allergens.map((a) => ({
              name: a.name,
              status: a.status,
              dateIntroduced: a.dateIntroduced,
            }))}
          />
        </CardContent>
      </Card>

      {/* Allergen Cards */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Major Allergens</CardTitle>
              <CardDescription>
                The 9 most common food allergens
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('pending')}
              >
                Pending
              </Button>
              <Button
                variant={filter === 'introduced' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('introduced')}
              >
                Introduced
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAllergens.map((allergen) => (
              <AllergenCard
                key={allergen.name}
                name={allergen.name}
                status={allergen.status}
                dateIntroduced={allergen.dateIntroduced}
                reactionNotes={allergen.reactionNotes}
              />
            ))}
          </div>

          {filteredAllergens.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No allergens match this filter
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <Info className="w-5 h-5" />
            Allergen Introduction Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-blue-700">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
              Introduce one new allergen at a time, waiting 2-3 days before the next
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
              Offer new allergens in the morning so you can monitor for reactions
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
              Start with small amounts and gradually increase if tolerated
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
              Once introduced, continue offering the allergen regularly (2-3 times/week)
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
              Contact your pediatrician if you notice hives, swelling, vomiting, or difficulty breathing
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Ready to track a new allergen?</p>
              <p className="text-sm text-gray-600">
                Log allergen introductions in the Food Tracker
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
    </div>
  );
}
