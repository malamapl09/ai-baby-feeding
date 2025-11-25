# Product Requirements Document (PRD)
# AI Baby Meal Planner

## 1. Overview
The AI Baby Meal Planner is a web-based micro-SaaS that generates personalized, age-appropriate baby meal plans using AI. It helps parents plan meals, introduce new foods safely, track progress, and minimize the stress of daily baby feeding decisions. The product targets parents of babies aged 6–24 months.

---

## 2. Goals & Objectives
### 2.1 Primary Goals
- Provide personalized weekly meal plans for babies 6–24 months.
- Offer simple, safe recipes tailored to age, dietary restrictions, and feeding goals.
- Track foods introduced and recommend new foods.
- Automate grocery list creation based on selected meal plans.

### 2.2 Business Goals
- Launch a profitable micro-SaaS product within weeks.
- Convert free users to paid through value-driven features.
- Maintain low operational costs through efficient AI usage.

### 2.3 Success Metrics
- **Activation:** % of users who generate a meal plan in first session.
- **Retention:** % of users generating weekly plans for 4 consecutive weeks.
- **Conversion:** Free → Paid subscription rate.
- **Engagement:** Foods logged, recipes opened, lists exported.

---

## 3. User Personas
### 3.1 Primary Persona – New Parent
- First-time mother or father with a 6–18 month old baby.
- Pain points: Confusion about food variety, meal planning stress, balancing work with baby feeding.
- Needs: Safe meals, guidance for new foods, quick ideas, structure.

### 3.2 Secondary Persona – Health-Conscious Parent
- Focused on nutrition, variety, healthy weight gain.
- Wants: Balanced plans, weekly structure, simple recipes.

### 3.3 Tertiary Persona – Caregivers
- Babysitters, grandparents, daycare helpers.
- Needs: Clear recipes and straightforward daily plans.

---

## 4. User Stories
### 4.1 Meal Planning
- As a parent, I want to generate a weekly meal plan so I know exactly what to feed my baby.
- As a parent, I want the plan to consider my baby's age and foods they’ve already tried.

### 4.2 Recipes
- As a parent, I want simple recipes with few ingredients and steps.
- As a parent, I want texture guidance appropriate to my baby’s age.

### 4.3 Food Tracker
- As a parent, I want to log foods my baby has tried.
- As a parent, I want recommendations for which food to introduce next.
- As a parent, I want to log any allergy reactions.

### 4.4 Grocery List
- As a parent, I want an auto-generated grocery list so I can shop easily.
- As a parent, I want lists organized by categories.

### 4.5 Sharing & Exporting
- As a parent, I want to export meal plans as PDFs or images.
- As a parent, I want to copy recipes and grocery lists easily.

### 4.6 Subscription & Limits
- As a free user, I can generate 1 plan/week.
- As a paid user, I get unlimited plans and regenerations.
- As a user, I want a clear explanation of the benefits of upgrading.

---

## 5. Scope of MVP
### 5.1 In Scope
- User authentication
- Baby profile onboarding
- Food introduction tracker
- Meal plan generator (3 or 7 days)
- Recipe generator
- Grocery list generator
- Limited free tier logic
- Stripe subscription integration
- Export to PDF (basic) or image

### 5.2 Out of Scope (Post-MVP)
- Multiple baby profiles
- Nutrition macros
- Pediatrician export
- Offline mode
- Mobile app (will be PWA later)

---

## 6. Product Features & Requirements

## 6.1 Onboarding
### Requirements
- Capture baby's name, birthdate, country.
- Compute age dynamically.
- Allow optional settings: allergies, parental goals.

## 6.2 Food Introduction Tracker
### Requirements
- Database of default foods with tags:
  - Food category, age minimum, allergy risk.
- Display tried, not tried, allergy status.
- Allow adding custom foods.
- Suggest next foods.

## 6.3 Meal Plan Generator
### Requirements
- Inputs:
  - Days (3 or 7)
  - Meals per day (B/L/D + snacks)
  - Feeding goal
  - Allergies and avoided foods
  - Foods already tried
- Output:
  - JSON structure with days and meals
  - Each meal includes: title, 1-line summary
- Allow regeneration of entire day or single meal.
- AI must follow age-appropriate texture guidelines.

## 6.4 Recipe Generator
### Requirements
- Generate simple recipe for each meal:
  - 3–7 ingredients
  - 3–5 steps
  - Texture & choking risk notes
- Allow user to mark favorites.

## 6.5 Grocery List Generator
### Requirements
- Consolidate ingredients from selected meal plan.
- Remove duplicates.
- Group into categories.
- Export as text and PDF.

## 6.6 Sharing & Exporting
### Requirements
- Export full weekly plan as PDF.
- Export as image optimized for WhatsApp and IG Stories.
- Copy grocery list to clipboard.

## 6.7 Subscription & Billing
### Requirements
- Stripe Checkout integration.
- Plans:
  - Free
  - Pro Monthly
  - Pro Annual
  - Lifetime (limited-time)
- Subscription status stored in DB.
- Access checks enforced in backend.

---

## 7. UX & UI Requirements
### 7.1 Design Principles
- Clean, minimal, baby-friendly colors.
- Large fonts.
- Zero clutter, easy navigation.

### 7.2 Screens
- Landing page
- Signup/Login
- Dashboard
- Baby profile setup
- Food tracker
- Meal plan view
- Recipe modal
- Grocery list screen
- Subscription screen
- Settings / account

---

## 8. Technical Requirements
### 8.1 Frontend
- Next.js + React
- TailwindCSS
- Responsive mobile-first design

### 8.2 Backend
- Next.js API routes OR Node.js service
- Supabase (Auth + Database)
- AI via OpenAI API
- Stripe for billing

### 8.3 Data Storage
- Postgres via Supabase

### 8.4 Logging & Monitoring
- Log AI requests + costs
- Track user behavior events
- Error monitoring via Sentry (optional)

---

## 9. AI Prompting Requirements
### 9.1 Meal Plan Prompt
- Must incorporate:
  - Baby age
  - Foods tried
  - Allergies
  - Feeding goal
  - Days and meal structure
- Output strictly in JSON.

### 9.2 Recipe Prompt
- Must generate clear, short instructions.
- Ingredient quantities appropriate for babies.
- Include texture guidance.

### 9.3 Grocery List Prompt
- Must combine duplicate ingredients.
- Output in JSON or markdown.

---

## 10. Security & Privacy Requirements
- GDPR-compliant data handling.
- Store minimal baby info.
- No medical data beyond basic allergies.
- Encrypted connections.
- Secure Stripe integration.

---

## 11. Risks & Mitigations
### Risk 1: AI generates unsafe suggestions
- Mitigation: Strict age/textures guidelines baked into system prompts.

### Risk 2: Low retention
- Mitigation: Weekly reminders + fresh meal ideas.

### Risk 3: High AI cost
- Mitigation: Use cached responses and GPT-4o-mini when possible.

### Risk 4: Claims of medical advice
- Mitigation: Clear disclaimers on every recipe + footer.

---

## 12. Release Plan
### Phase 1: MVP Build (3–5 weeks)
- Core features
- Stripe integration
- Meal plan/recipe AI

### Phase 2: Private Beta (1–2 weeks)
- Small user group testing
- Fixing UX and AI quality issues

### Phase 3: Public Launch
- Marketing push
- Referral program

---

## 13. Future Enhancements
- Multi-language support
- More food databases by region
- Pediatrician mode
- Multi-baby profiles
- Mobile app/PWA version

