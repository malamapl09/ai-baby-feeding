export const APP_NAME = 'BabyBites'; // We can change this later

export const FEEDING_GOALS = {
  balanced_nutrition: {
    label: 'Balanced Nutrition',
    description: 'Well-rounded meals with variety',
  },
  weight_gain: {
    label: 'Healthy Weight Gain',
    description: 'Calorie-dense, nutritious meals',
  },
  food_variety: {
    label: 'Food Variety & Introduction',
    description: 'Focus on trying new foods safely',
  },
  picky_eater: {
    label: 'Picky Eater Support',
    description: 'Gentle food exposure strategies',
  },
} as const;

export const FOOD_CATEGORIES = {
  fruits: { label: 'Fruits', emoji: '🍎' },
  vegetables: { label: 'Vegetables', emoji: '🥕' },
  proteins: { label: 'Proteins', emoji: '🍗' },
  grains: { label: 'Grains', emoji: '🌾' },
  dairy: { label: 'Dairy', emoji: '🧀' },
  legumes: { label: 'Legumes', emoji: '🫘' },
  other: { label: 'Other', emoji: '🥄' },
} as const;

export const MEAL_TYPES = {
  breakfast: { label: 'Breakfast', emoji: '🌅' },
  lunch: { label: 'Lunch', emoji: '☀️' },
  dinner: { label: 'Dinner', emoji: '🌙' },
  snack: { label: 'Snack', emoji: '🍪' },
} as const;

export const AGE_TEXTURE_GUIDELINES = {
  '6-7': 'Smooth purees, very soft mashed foods',
  '8-9': 'Thicker purees, soft lumps, finger foods that dissolve',
  '10-12': 'Soft, small pieces, more texture variety',
  '12-18': 'Soft table foods, small pieces, wider variety',
  '18-24': 'Modified family foods, small pieces, most textures',
} as const;

export const FREE_TIER_LIMITS = {
  plansPerWeek: 1,
  regenerationsPerPlan: 2,
  maxBabies: 1,
} as const;

export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      '1 meal plan per week',
      'Basic recipes',
      'Food tracker',
    ],
  },
  pro_monthly: {
    name: 'Pro Monthly',
    price: 9.99,
    priceId: '', // Will be filled with Stripe price ID
    features: [
      'Unlimited meal plans',
      'Unlimited regenerations',
      'Grocery lists',
      'PDF & image export',
      'Priority support',
    ],
  },
  pro_annual: {
    name: 'Pro Annual',
    price: 79,
    priceId: '', // Will be filled with Stripe price ID
    features: [
      'Everything in Pro Monthly',
      'Save 34% annually',
    ],
  },
  lifetime: {
    name: 'Lifetime',
    price: 49,
    priceId: '', // Will be filled with Stripe price ID
    features: [
      'All Pro features forever',
      'Limited-time offer',
    ],
  },
} as const;

export const COMMON_ALLERGENS = [
  'milk',
  'eggs',
  'peanuts',
  'tree nuts',
  'soy',
  'wheat',
  'fish',
  'shellfish',
  'sesame',
] as const;
