import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import { GroceryList, GroceryItem, FoodCategory } from '@/types';
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
  stats: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 10,
  },
  statBadge: {
    backgroundColor: '#f3f4f6',
    padding: '4 10',
    borderRadius: 4,
    fontSize: 10,
    color: '#374151',
  },
  categorySection: {
    marginBottom: 16,
  },
  categoryHeader: {
    backgroundColor: '#fef2f2',
    padding: '8 12',
    borderRadius: 4,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: 14,
    marginRight: 8,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#e11d48',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  checkbox: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 2,
    marginRight: 10,
  },
  itemName: {
    fontSize: 11,
    color: '#374151',
    flex: 1,
  },
  itemQuantity: {
    fontSize: 10,
    color: '#6b7280',
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
  twoColumn: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  column: {
    width: '48%',
    marginRight: '2%',
  },
});

const CATEGORY_CONFIG: Record<FoodCategory, { label: string; emoji: string }> = {
  fruits: { label: 'Fruits', emoji: '🍎' },
  vegetables: { label: 'Vegetables', emoji: '🥕' },
  proteins: { label: 'Proteins', emoji: '🍗' },
  grains: { label: 'Grains', emoji: '🌾' },
  dairy: { label: 'Dairy', emoji: '🧀' },
  legumes: { label: 'Legumes', emoji: '🫘' },
  other: { label: 'Other', emoji: '🥄' },
};

interface GroceryListPDFProps {
  groceryList: GroceryList;
  planDates?: { start: string; end: string };
  babyName?: string;
}

export function GroceryListPDF({ groceryList, planDates, babyName }: GroceryListPDFProps) {
  // Group items by category
  const itemsByCategory = groceryList.items.reduce((acc, item) => {
    const category = item.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, GroceryItem[]>);

  // Sort categories by predefined order
  const categoryOrder: FoodCategory[] = ['fruits', 'vegetables', 'proteins', 'grains', 'dairy', 'legumes', 'other'];
  const sortedCategories = categoryOrder.filter(cat => itemsByCategory[cat]);

  const totalItems = groceryList.items.length;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Grocery List</Text>
          {babyName && (
            <Text style={styles.subtitle}>For {babyName}&apos;s meal plan</Text>
          )}
          {planDates && (
            <Text style={styles.subtitle}>
              {format(new Date(planDates.start), 'MMM d')} - {format(new Date(planDates.end), 'MMM d, yyyy')}
            </Text>
          )}
          <View style={styles.stats}>
            <Text style={styles.statBadge}>{totalItems} items</Text>
            <Text style={styles.statBadge}>{sortedCategories.length} categories</Text>
          </View>
        </View>

        <View style={styles.twoColumn}>
          {sortedCategories.map((category, catIndex) => {
            const items = itemsByCategory[category];
            const config = CATEGORY_CONFIG[category as FoodCategory] || { label: category, emoji: '📦' };

            return (
              <View
                key={category}
                style={[
                  styles.categorySection,
                  styles.column,
                  catIndex % 2 === 1 ? { marginRight: 0 } : {}
                ]}
                wrap={false}
              >
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryEmoji}>{config.emoji}</Text>
                  <Text style={styles.categoryTitle}>{config.label}</Text>
                </View>

                {items.map((item, idx) => (
                  <View key={idx} style={styles.itemRow}>
                    <View style={styles.checkbox} />
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemQuantity}>
                      {item.quantity} {item.unit}
                    </Text>
                  </View>
                ))}
              </View>
            );
          })}
        </View>

        <Text style={styles.footer}>
          Generated by BabyBites - AI-powered meal planning for babies
        </Text>
      </Page>
    </Document>
  );
}
