import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import { MealPlan, Meal, Recipe, MealType, FeedingGoal } from '@/types';
import { format } from 'date-fns';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#e11d48',
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 3,
  },
  badge: {
    backgroundColor: '#fef2f2',
    color: '#e11d48',
    padding: '4 8',
    borderRadius: 4,
    fontSize: 10,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  dayHeader: {
    backgroundColor: '#f9fafb',
    padding: 10,
    marginBottom: 10,
    borderRadius: 4,
  },
  dayTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  dayDate: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
  },
  mealCard: {
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealType: {
    fontSize: 10,
    color: '#e11d48',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  prepTime: {
    fontSize: 9,
    color: '#6b7280',
  },
  mealTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  mealSummary: {
    fontSize: 10,
    color: '#4b5563',
    marginBottom: 8,
    lineHeight: 1.4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 6,
    marginTop: 8,
  },
  ingredientRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  bullet: {
    fontSize: 10,
    color: '#e11d48',
    marginRight: 6,
  },
  ingredientText: {
    fontSize: 10,
    color: '#4b5563',
    flex: 1,
  },
  instructionRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  stepNumber: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#e11d48',
    marginRight: 6,
    minWidth: 15,
  },
  instructionText: {
    fontSize: 10,
    color: '#4b5563',
    flex: 1,
    lineHeight: 1.4,
  },
  noteBox: {
    backgroundColor: '#eff6ff',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  noteTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1d4ed8',
    marginBottom: 3,
  },
  noteText: {
    fontSize: 9,
    color: '#1e40af',
    lineHeight: 1.3,
  },
  warningBox: {
    backgroundColor: '#fffbeb',
    padding: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  warningTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#b45309',
    marginBottom: 3,
  },
  warningText: {
    fontSize: 9,
    color: '#92400e',
    lineHeight: 1.3,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#9ca3af',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
});

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

const GOAL_LABELS: Record<FeedingGoal, string> = {
  balanced_nutrition: 'Balanced Nutrition',
  weight_gain: 'Healthy Weight Gain',
  food_variety: 'Food Variety',
  picky_eater: 'Picky Eater Support',
};

interface MealPlanPDFProps {
  mealPlan: MealPlan;
  meals: Meal[];
  babyName: string;
  layout: 'compact' | 'detailed';
}

export function MealPlanPDF({ mealPlan, meals, babyName, layout }: MealPlanPDFProps) {
  // Group meals by day
  const mealsByDay = meals.reduce((acc, meal) => {
    const dayIndex = meal.day_index;
    if (!acc[dayIndex]) {
      acc[dayIndex] = [];
    }
    acc[dayIndex].push(meal);
    return acc;
  }, {} as Record<number, Meal[]>);

  const sortedDays = Object.keys(mealsByDay)
    .map(Number)
    .sort((a, b) => a - b);

  if (layout === 'compact') {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>Meal Plan for {babyName}</Text>
            <Text style={styles.subtitle}>
              {format(new Date(mealPlan.start_date), 'MMM d')} - {format(new Date(mealPlan.end_date), 'MMM d, yyyy')}
            </Text>
            <Text style={styles.badge}>{GOAL_LABELS[mealPlan.goal]}</Text>
          </View>

          {sortedDays.map((dayIndex) => {
            const dayMeals = mealsByDay[dayIndex];
            const date = new Date(mealPlan.start_date);
            date.setDate(date.getDate() + dayIndex);

            return (
              <View key={dayIndex} wrap={false}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayTitle}>Day {dayIndex + 1}</Text>
                  <Text style={styles.dayDate}>{format(date, 'EEEE, MMM d')}</Text>
                </View>

                {dayMeals.map((meal) => (
                  <View key={meal.id} style={styles.mealCard}>
                    <View style={styles.mealHeader}>
                      <Text style={styles.mealType}>{MEAL_TYPE_LABELS[meal.meal_type]}</Text>
                      {meal.recipe && (
                        <Text style={styles.prepTime}>{meal.recipe.prep_time_minutes} min</Text>
                      )}
                    </View>
                    <Text style={styles.mealTitle}>{meal.title}</Text>
                    <Text style={styles.mealSummary}>{meal.summary}</Text>
                  </View>
                ))}
              </View>
            );
          })}

          <Text style={styles.footer}>
            Generated by BabyBites - AI-powered meal planning for babies
          </Text>
        </Page>
      </Document>
    );
  }

  // Detailed layout - one day per page with full recipes
  return (
    <Document>
      {sortedDays.map((dayIndex) => {
        const dayMeals = mealsByDay[dayIndex];
        const date = new Date(mealPlan.start_date);
        date.setDate(date.getDate() + dayIndex);

        return (
          <Page key={dayIndex} size="A4" style={styles.page}>
            <View style={styles.header}>
              <Text style={styles.title}>Day {dayIndex + 1} - {format(date, 'EEEE')}</Text>
              <Text style={styles.subtitle}>
                {format(date, 'MMMM d, yyyy')} | {babyName}&apos;s Meal Plan
              </Text>
              <Text style={styles.badge}>{GOAL_LABELS[mealPlan.goal]}</Text>
            </View>

            {dayMeals.map((meal) => (
              <View key={meal.id} style={styles.mealCard} wrap={false}>
                <View style={styles.mealHeader}>
                  <Text style={styles.mealType}>{MEAL_TYPE_LABELS[meal.meal_type]}</Text>
                  {meal.recipe && (
                    <Text style={styles.prepTime}>{meal.recipe.prep_time_minutes} min prep</Text>
                  )}
                </View>
                <Text style={styles.mealTitle}>{meal.title}</Text>
                <Text style={styles.mealSummary}>{meal.summary}</Text>

                {meal.recipe && (
                  <>
                    <Text style={styles.sectionTitle}>Ingredients</Text>
                    {meal.recipe.ingredients.map((ing, idx) => (
                      <View key={idx} style={styles.ingredientRow}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.ingredientText}>
                          {ing.quantity} {ing.unit} {ing.name}
                        </Text>
                      </View>
                    ))}

                    <Text style={styles.sectionTitle}>Instructions</Text>
                    {meal.recipe.instructions.map((step, idx) => (
                      <View key={idx} style={styles.instructionRow}>
                        <Text style={styles.stepNumber}>{idx + 1}.</Text>
                        <Text style={styles.instructionText}>{step}</Text>
                      </View>
                    ))}

                    {meal.recipe.texture_notes && (
                      <View style={styles.noteBox}>
                        <Text style={styles.noteTitle}>Texture Guide</Text>
                        <Text style={styles.noteText}>{meal.recipe.texture_notes}</Text>
                      </View>
                    )}

                    {meal.recipe.choking_hazard_notes && (
                      <View style={styles.warningBox}>
                        <Text style={styles.warningTitle}>Safety Note</Text>
                        <Text style={styles.warningText}>{meal.recipe.choking_hazard_notes}</Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            ))}

            <Text style={styles.footer}>
              Generated by BabyBites - AI-powered meal planning for babies
            </Text>
          </Page>
        );
      })}
    </Document>
  );
}
