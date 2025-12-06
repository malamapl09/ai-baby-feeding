'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface AllergenCardProps {
  name: string;
  status: 'pending' | 'introduced' | 'allergic';
  dateIntroduced?: string | null;
  reactionNotes?: string | null;
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

export function AllergenCard({ name, status, dateIntroduced, reactionNotes }: AllergenCardProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'introduced':
        return {
          bgColor: 'bg-green-50 border-green-200',
          badgeVariant: 'default' as const,
          badgeClass: 'bg-green-100 text-green-700 hover:bg-green-100',
          icon: <Check className="w-4 h-4 text-green-600" />,
          label: 'Introduced',
        };
      case 'allergic':
        return {
          bgColor: 'bg-red-50 border-red-200',
          badgeVariant: 'destructive' as const,
          badgeClass: 'bg-red-100 text-red-700 hover:bg-red-100',
          icon: <AlertTriangle className="w-4 h-4 text-red-600" />,
          label: 'Allergic',
        };
      default:
        return {
          bgColor: 'bg-gray-50 border-gray-200',
          badgeVariant: 'secondary' as const,
          badgeClass: 'bg-gray-100 text-gray-600 hover:bg-gray-100',
          icon: <Clock className="w-4 h-4 text-gray-400" />,
          label: 'Pending',
        };
    }
  };

  const config = getStatusConfig();
  const emoji = ALLERGEN_ICONS[name.toLowerCase()] || '🍽️';

  return (
    <Card className={`${config.bgColor} transition-all hover:shadow-md`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{emoji}</span>
            <div>
              <p className="font-medium capitalize">{name}</p>
              {dateIntroduced && (
                <p className="text-xs text-gray-500">
                  {format(new Date(dateIntroduced), 'MMM d, yyyy')}
                </p>
              )}
            </div>
          </div>
          <Badge className={config.badgeClass}>
            {config.icon}
            <span className="ml-1">{config.label}</span>
          </Badge>
        </div>
        {reactionNotes && status === 'allergic' && (
          <p className="text-xs text-red-600 mt-2 p-2 bg-red-100 rounded">
            {reactionNotes}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
