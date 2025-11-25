# BabyBites

AI-powered meal planning for babies aged 6-24 months. Generate personalized, age-appropriate meal plans based on your baby's developmental stage, tried foods, and nutritional goals.

## Features

- **AI Meal Plan Generation** - GPT-4o-mini powered meal plans customized for your baby
- **Food Introduction Tracker** - Track which foods your baby has tried, liked, or reacted to
- **Age-Appropriate Recipes** - Simple recipes with texture guidelines and choking hazard notes
- **Grocery List Generation** - Auto-generated shopping lists from meal plans
- **Allergen Awareness** - Tracks common allergens and avoids known sensitivities
- **Freemium Model** - Free tier with 1 plan/week, Pro for unlimited access

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS v4 + shadcn/ui
- **Database**: Supabase (PostgreSQL + Auth)
- **AI**: OpenAI GPT-4o-mini
- **Payments**: Stripe (subscriptions + one-time)
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- OpenAI API key
- Stripe account

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ai-baby-meal-planner

# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local
```

### Environment Variables

Create a `.env.local` file with the following:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=sk-your_openai_key

# Stripe
STRIPE_SECRET_KEY=sk_test_your_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxx
STRIPE_PRO_ANNUAL_PRICE_ID=price_xxx
STRIPE_LIFETIME_PRICE_ID=price_xxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Setup

1. Create a new Supabase project
2. Run the migrations in order:

```bash
# In Supabase SQL Editor, run:
# 1. supabase/migrations/001_initial_schema.sql
# 2. supabase/migrations/002_seed_foods.sql
# 3. supabase/migrations/003_add_indexes_and_policies.sql
```

3. Enable Google OAuth in Supabase Authentication settings (optional)

### Running Locally

```bash
# Development server
npm run dev

# Production build
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (login, signup)
│   ├── (dashboard)/       # Protected dashboard pages
│   ├── api/               # API routes
│   └── page.tsx           # Landing page
├── components/
│   └── ui/                # shadcn/ui components
├── config/
│   └── constants.ts       # App constants and configuration
├── lib/
│   ├── openai/            # OpenAI client and prompts
│   ├── stripe/            # Stripe client
│   ├── supabase/          # Supabase clients (server/client)
│   ├── validations/       # Zod schemas
│   ├── env.ts             # Environment validation
│   └── rate-limit.ts      # Rate limiting utility
├── types/
│   └── index.ts           # TypeScript type definitions
└── middleware.ts          # Auth middleware

supabase/
└── migrations/            # Database migrations
    ├── 001_initial_schema.sql
    ├── 002_seed_foods.sql
    └── 003_add_indexes_and_policies.sql

docs/
├── ai_baby_meal_planner_plan.md   # Technical planning doc
└── ai_baby_meal_planner_prd.md    # Product requirements doc
```

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/generate-meal-plan` | POST | Generate AI meal plan |
| `/api/generate-grocery-list` | POST | Generate grocery list from plan |
| `/api/stripe/create-checkout` | POST | Create Stripe checkout session |
| `/api/stripe/webhook` | POST | Handle Stripe webhooks |

## Security Features

- **Input Validation**: All API inputs validated with Zod
- **Rate Limiting**: 10 requests/minute on AI endpoints
- **Webhook Idempotency**: Stripe events processed once only
- **Security Headers**: HSTS, CSP, X-Frame-Options, etc.
- **Row Level Security**: Database-level access control

## Subscription Plans

| Plan | Price | Features |
|------|-------|----------|
| Free | $0 | 1 plan/week, basic recipes, food tracker |
| Pro Monthly | $9.99/mo | Unlimited plans, grocery lists, exports |
| Pro Annual | $79/year | Same as monthly, save 34% |
| Lifetime | $49 once | All Pro features forever (launch special) |

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

### Stripe Webhook Setup

1. Create webhook endpoint in Stripe Dashboard
2. Point to `https://your-domain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`

## Development Status

### Completed
- [x] User authentication (email + Google OAuth)
- [x] Baby profile management
- [x] Food introduction tracker
- [x] AI meal plan generation
- [x] Recipe display with instructions
- [x] Grocery list generation
- [x] Stripe subscription integration
- [x] Landing page with pricing
- [x] Security hardening (validation, rate limiting, headers)

### Pending (Nice-to-Have)
- [ ] PDF/Image export for meal plans
- [ ] "What can I make now?" quick search
- [ ] Allergen introduction schedule view
- [ ] Batch cooking/meal prep mode
- [ ] Multi-language support
- [ ] Push notifications

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

Private - All rights reserved

---

Built with love for parents everywhere.
