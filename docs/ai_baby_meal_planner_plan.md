# AI Baby Meal Planner — Full Product Blueprint

## 1. Product Vision & Positioning
**Product:** AI Baby Meal Planner
**One-sentence pitch:** “Smart, personalized meal plans for babies, based on age, foods tried, and parents’ goals.”

### Core Promise
- Remove daily stress of deciding baby meals.
- Ensure meals are age-appropriate and safe.
- Introduce new foods strategically.
- Support healthy weight gain when needed.

### Differentiation
- Hyper-focused on babies 0–24 months.
- Food introduction tracking + personalized plans + grocery lists.
- Simple, parent-friendly recipes.

---

## 2. Target Users & Main Use Cases
### Primary User
- New parents (especially first-time moms) with babies 6–18 months.

### Key Use Cases
1. Weekly meal plan generation.
2. Food introduction planning.
3. Recipe suggestions based on available ingredients.
4. Weight-gain–focused meal ideas.

---

## 3. MVP Scope
### 3.1 MVP Features
- User accounts.
- Baby profile creation.
- Food introduction tracker.
- Personalized meal plan generator.
- Recipes with simple instructions.
- Grocery list generator.
- Export (PDF / image / WhatsApp copy).
- Freemium limitations.

### 3.2 Freemium Model
- Free: 1 weekly plan + limited regenerations.
- Pro: unlimited + grocery list + multiple babies.

---

## 4. Post-MVP Features

### Phase 2 (Completed)
- Multi-language support (English + Spanish with locale-based URLs)
- Meal plan rating/feedback system (influences AI suggestions)
- Meal swap suggestions (AI-powered alternatives)
- Family meal adaptation (adult versions of baby meals)
- Social sharing (public links with optional PDF)
- Calendar sync (iCal download + Google Calendar integration)
- Nutrition labels (baby-focused: iron, calcium, vitamins A/C/D + macros)

### Future Phases (Planned)
- Multi-baby profiles
- Pediatrician summary export
- Advanced filters
- Weekly emails/WhatsApp reminders
- Additional languages (Portuguese, French)

---

## 5. Safety Guidelines
- Clear disclaimers.
- Avoid medical claims.
- Optional note for premature/delayed babies.

---

## 6. Technical Architecture
### Frontend
- Next.js
- TailwindCSS

### Backend
- Next.js API routes or Node/Express
- OpenAI API

### Authentication & Database
- Supabase (Auth + Postgres)

### Payments
- Stripe

### Services
1. AI Service (meal plans, recipes, grocery lists)
2. User Service
3. Food Data Service
4. Logging & Analytics

---

## 7. Data Model
### Users
- id, email, stripe_id, plan

### Babies
- id, user_id, name, birthdate, country

### Foods
- id, name, category, age_min_months, choking_risk, prep_notes

### BabyFoods
- id, baby_id, food_id, status, reaction, date

### MealPlans
- id, baby_id, start_date, goal, raw_prompt, response

### Meals
- id, plan_id, day_index, type, title, summary

### Recipes
- id, meal_id, ingredients JSON, instructions, notes

---

## 8. AI Prompting Strategy
### Meal Plan Prompt
- Inputs: age, foods tried, allergies, goal, number of days.
- Output: strict JSON format for meals.

### Recipe Prompt
- Very simple ingredients + instructions.
- Texture guidance based on age.

### Grocery List Prompt
- Consolidate all ingredients + remove duplicates.

---

## 9. UX/UI Concept
### Key Screens
1. Landing page
2. Dashboard
3. Weekly plan view
4. Food tracker
5. Subscription page

### Design Style
- Soft pastel colors.
- Large typography.
- Clean and minimal.

---

## 10. Pricing Strategy
- Free: limited use.
- Pro Monthly: $9.99
- Pro Annual: $79
- Lifetime: $49 (launch only)

---

## 11. Marketing Plan
### Week 1: Validation & Waitlist
- Landing page + feedback group.

### Week 2: Private Beta
- First testers + testimonials.

### Week 3: Content Engine
- TikTok & Reels showing meal plan generation.

### Week 4: Public Launch
- Open signups + referral rewards.

---

## 12. Metrics to Track
- Activation
- Retention
- Conversion
- Engagement