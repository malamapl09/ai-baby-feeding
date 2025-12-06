import ical, { ICalCalendar, ICalAlarmType, ICalEventRepeatingFreq } from 'ical-generator';
import { addHours, parseISO, setHours, setMinutes } from 'date-fns';

interface MealEvent {
  id: string;
  title: string;
  summary: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: Date;
  ingredients?: Array<{ name: string; quantity: string; unit: string }>;
  prepTimeMinutes?: number;
}

interface CalendarOptions {
  babyName: string;
  planId: string;
  reminderMinutes?: number;
}

// Meal time defaults (24-hour format)
const MEAL_TIMES: Record<string, { hour: number; minute: number }> = {
  breakfast: { hour: 8, minute: 0 },
  lunch: { hour: 12, minute: 0 },
  dinner: { hour: 18, minute: 0 },
  snack: { hour: 15, minute: 0 },
};

export function generateMealCalendar(
  meals: MealEvent[],
  options: CalendarOptions
): ICalCalendar {
  const { babyName, planId, reminderMinutes = 30 } = options;

  const calendar = ical({
    name: `${babyName}'s Meal Plan - BabyBites`,
    description: `Meal plan created with BabyBites for ${babyName}`,
    prodId: {
      company: 'BabyBites',
      product: 'Meal Planner',
      language: 'EN',
    },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  });

  meals.forEach((meal) => {
    const mealTime = MEAL_TIMES[meal.mealType];
    const startDate = setMinutes(setHours(meal.date, mealTime.hour), mealTime.minute);
    const endDate = addHours(startDate, 1);

    // Build description with ingredients
    let description = meal.summary;
    if (meal.ingredients && meal.ingredients.length > 0) {
      description += '\n\nIngredients:\n';
      meal.ingredients.forEach((ing) => {
        description += `- ${ing.quantity} ${ing.unit} ${ing.name}\n`;
      });
    }
    if (meal.prepTimeMinutes) {
      description += `\nPrep time: ${meal.prepTimeMinutes} minutes`;
    }
    description += '\n\nCreated with BabyBites - AI Baby Meal Planner';

    const event = calendar.createEvent({
      id: `meal-${meal.id}@babybites.app`,
      start: startDate,
      end: endDate,
      summary: `${getMealEmoji(meal.mealType)} ${meal.title}`,
      description,
      categories: [{ name: 'Baby Food' }, { name: capitalizeFirst(meal.mealType) }],
      url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/meal-plans/${planId}`,
    });

    // Add reminder alarm
    if (reminderMinutes > 0) {
      event.createAlarm({
        type: ICalAlarmType.display,
        trigger: reminderMinutes * 60, // seconds before
        description: `Time to prepare ${meal.title} for ${babyName}!`,
      });
    }
  });

  return calendar;
}

export function generateRecurringMealReminder(
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  babyName: string
): ICalCalendar {
  const calendar = ical({
    name: `${babyName}'s ${capitalizeFirst(mealType)} Reminder - BabyBites`,
  });

  const mealTime = MEAL_TIMES[mealType];
  const startDate = setMinutes(setHours(new Date(), mealTime.hour), mealTime.minute);

  calendar.createEvent({
    id: `reminder-${mealType}@babybites.app`,
    start: startDate,
    end: addHours(startDate, 1),
    summary: `${getMealEmoji(mealType)} ${capitalizeFirst(mealType)} time for ${babyName}`,
    description: `Daily ${mealType} reminder for ${babyName}`,
    repeating: {
      freq: ICalEventRepeatingFreq.DAILY,
    },
  });

  return calendar;
}

function getMealEmoji(mealType: string): string {
  const emojis: Record<string, string> = {
    breakfast: '🍳',
    lunch: '🥗',
    dinner: '🍽️',
    snack: '🍌',
  };
  return emojis[mealType] || '🍼';
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
