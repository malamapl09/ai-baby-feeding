-- Seed baby-safe foods with age recommendations and allergen info

-- FRUITS
INSERT INTO public.foods (name, category, age_min_months, is_common_allergen, choking_risk, prep_notes) VALUES
('avocado', 'fruits', 6, false, 'low', 'Mash or cut into thin strips'),
('banana', 'fruits', 6, false, 'low', 'Mash or serve as spears'),
('apple', 'fruits', 6, false, 'high', 'Cook until soft, avoid raw pieces'),
('pear', 'fruits', 6, false, 'medium', 'Cook until soft or serve very ripe'),
('peach', 'fruits', 6, false, 'low', 'Serve very ripe and mashed'),
('mango', 'fruits', 6, false, 'low', 'Serve ripe, mashed or in strips'),
('blueberries', 'fruits', 6, false, 'high', 'Smash or quarter for safety'),
('strawberries', 'fruits', 6, false, 'low', 'Cut into small pieces or mash'),
('watermelon', 'fruits', 6, false, 'low', 'Remove seeds, serve soft pieces'),
('cantaloupe', 'fruits', 6, false, 'low', 'Soft ripe pieces'),
('papaya', 'fruits', 6, false, 'low', 'Mash or serve soft pieces'),
('prunes', 'fruits', 6, false, 'low', 'Puree or finely chop'),
('raspberries', 'fruits', 8, false, 'low', 'Mash gently'),
('grapes', 'fruits', 12, false, 'high', 'Quarter lengthwise, never whole'),
('orange', 'fruits', 8, false, 'low', 'Remove membranes, serve segments'),
('kiwi', 'fruits', 8, false, 'low', 'Soft ripe pieces'),
('plum', 'fruits', 6, false, 'medium', 'Cook or serve very ripe');

-- VEGETABLES
INSERT INTO public.foods (name, category, age_min_months, is_common_allergen, choking_risk, prep_notes) VALUES
('sweet potato', 'vegetables', 6, false, 'low', 'Cook until very soft'),
('butternut squash', 'vegetables', 6, false, 'low', 'Roast or steam until soft'),
('carrot', 'vegetables', 6, false, 'high', 'Cook until very soft, avoid raw'),
('peas', 'vegetables', 6, false, 'medium', 'Mash or smash to break skin'),
('green beans', 'vegetables', 6, false, 'medium', 'Steam until very soft'),
('zucchini', 'vegetables', 6, false, 'low', 'Steam or roast until soft'),
('broccoli', 'vegetables', 6, false, 'low', 'Steam florets until very soft'),
('cauliflower', 'vegetables', 6, false, 'low', 'Steam until very soft'),
('spinach', 'vegetables', 6, false, 'low', 'Cook and puree or finely chop'),
('kale', 'vegetables', 8, false, 'low', 'Remove stems, cook well'),
('cucumber', 'vegetables', 9, false, 'medium', 'Peel and cut into thin strips'),
('tomato', 'vegetables', 8, false, 'low', 'Remove skin and seeds'),
('bell pepper', 'vegetables', 8, false, 'medium', 'Roast to soften, remove skin'),
('potato', 'vegetables', 6, false, 'low', 'Mash or serve soft cooked'),
('corn', 'vegetables', 9, false, 'medium', 'Serve as puree initially'),
('beet', 'vegetables', 8, false, 'low', 'Roast until very soft'),
('asparagus', 'vegetables', 8, false, 'medium', 'Steam tips until very soft'),
('eggplant', 'vegetables', 8, false, 'low', 'Roast until very soft'),
('pumpkin', 'vegetables', 6, false, 'low', 'Roast or steam until soft');

-- PROTEINS
INSERT INTO public.foods (name, category, age_min_months, is_common_allergen, choking_risk, prep_notes) VALUES
('chicken', 'proteins', 6, false, 'medium', 'Shred finely or puree'),
('turkey', 'proteins', 6, false, 'medium', 'Shred finely or puree'),
('beef', 'proteins', 6, false, 'medium', 'Slow cook and shred, or puree'),
('pork', 'proteins', 6, false, 'medium', 'Cook until very tender, shred'),
('salmon', 'proteins', 6, true, 'low', 'Check for bones, flake well'),
('cod', 'proteins', 6, true, 'low', 'Check for bones, flake well'),
('tilapia', 'proteins', 6, true, 'low', 'Check for bones, flake well'),
('sardines', 'proteins', 9, true, 'medium', 'Mash well with bones'),
('shrimp', 'proteins', 9, true, 'medium', 'Chop finely'),
('egg', 'proteins', 6, true, 'low', 'Scramble soft or hard boil and mash'),
('tofu', 'proteins', 6, true, 'low', 'Soft or silken, cut into cubes'),
('lamb', 'proteins', 6, false, 'medium', 'Slow cook and shred');

-- GRAINS
INSERT INTO public.foods (name, category, age_min_months, is_common_allergen, choking_risk, prep_notes) VALUES
('oatmeal', 'grains', 6, false, 'low', 'Cook until soft and creamy'),
('rice', 'grains', 6, false, 'low', 'Cook well, can puree'),
('quinoa', 'grains', 8, false, 'low', 'Cook until very soft'),
('barley', 'grains', 6, false, 'low', 'Cook until very soft'),
('pasta', 'grains', 8, true, 'medium', 'Cook very soft, cut small'),
('bread', 'grains', 8, true, 'high', 'Toast and cut into strips, remove crust'),
('couscous', 'grains', 8, true, 'low', 'Cook until soft'),
('millet', 'grains', 6, false, 'low', 'Cook until creamy'),
('buckwheat', 'grains', 8, false, 'low', 'Cook until soft'),
('polenta', 'grains', 6, false, 'low', 'Serve soft and creamy'),
('pancakes', 'grains', 9, true, 'medium', 'Cut into small strips');

-- DAIRY
INSERT INTO public.foods (name, category, age_min_months, is_common_allergen, choking_risk, prep_notes) VALUES
('yogurt', 'dairy', 6, true, 'low', 'Plain, full-fat, unsweetened'),
('cheese', 'dairy', 6, true, 'medium', 'Soft varieties, shredded or thin slices'),
('cottage cheese', 'dairy', 9, true, 'low', 'Full-fat varieties'),
('ricotta', 'dairy', 9, true, 'low', 'Can mix into foods'),
('cream cheese', 'dairy', 9, true, 'low', 'Spread thin on toast'),
('butter', 'dairy', 6, true, 'low', 'Use for cooking'),
('milk', 'dairy', 12, true, 'low', 'Whole milk only, not as main drink until 12mo');

-- LEGUMES
INSERT INTO public.foods (name, category, age_min_months, is_common_allergen, choking_risk, prep_notes) VALUES
('lentils', 'legumes', 6, false, 'low', 'Cook until very soft, can mash'),
('black beans', 'legumes', 6, false, 'low', 'Mash or smash'),
('chickpeas', 'legumes', 6, false, 'medium', 'Mash well or make hummus'),
('kidney beans', 'legumes', 8, false, 'medium', 'Mash well'),
('white beans', 'legumes', 6, false, 'low', 'Mash or puree'),
('peanut butter', 'legumes', 6, true, 'low', 'Thin with milk, never serve thick'),
('almond butter', 'legumes', 6, true, 'low', 'Thin with milk, never serve thick'),
('edamame', 'legumes', 9, true, 'high', 'Mash well, avoid whole'),
('hummus', 'legumes', 6, false, 'low', 'Spread thin or mix into foods');

-- OTHER
INSERT INTO public.foods (name, category, age_min_months, is_common_allergen, choking_risk, prep_notes) VALUES
('olive oil', 'other', 6, false, 'low', 'Use for cooking and adding calories'),
('coconut oil', 'other', 6, false, 'low', 'Use for cooking'),
('tahini', 'other', 6, true, 'low', 'Thin and mix into foods'),
('chia seeds', 'other', 6, false, 'low', 'Soak until gel-like'),
('flax seeds', 'other', 6, false, 'low', 'Ground only'),
('hemp seeds', 'other', 6, false, 'low', 'Sprinkle on foods'),
('nutritional yeast', 'other', 8, false, 'low', 'Sprinkle on foods'),
('bone broth', 'other', 6, false, 'low', 'Low sodium, use for cooking'),
('cinnamon', 'other', 6, false, 'low', 'Small amounts for flavor'),
('ginger', 'other', 8, false, 'low', 'Small amounts, grated'),
('garlic', 'other', 8, false, 'low', 'Small amounts, cooked'),
('turmeric', 'other', 8, false, 'low', 'Small amounts');
