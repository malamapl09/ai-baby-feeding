import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { APP_NAME, SUBSCRIPTION_PLANS } from '@/config/constants';
import {
  Sparkles,
  Calendar,
  Apple,
  ShoppingCart,
  Clock,
  Shield,
  Heart,
  Star,
  Check,
  ArrowRight,
} from 'lucide-react';

const features = [
  {
    icon: Calendar,
    title: 'AI-Powered Meal Plans',
    description: 'Get personalized weekly meal plans tailored to your baby\'s age and preferences',
  },
  {
    icon: Apple,
    title: 'Food Introduction Tracker',
    description: 'Track new foods, reactions, and get suggestions for what to try next',
  },
  {
    icon: ShoppingCart,
    title: 'Smart Grocery Lists',
    description: 'Automatically generate organized shopping lists from your meal plans',
  },
  {
    icon: Shield,
    title: 'Age-Appropriate Safety',
    description: 'All recipes follow pediatric guidelines for textures and ingredients',
  },
  {
    icon: Clock,
    title: 'Quick & Simple Recipes',
    description: 'Easy recipes with 3-7 ingredients that busy parents can make in minutes',
  },
  {
    icon: Heart,
    title: 'Allergen Awareness',
    description: 'Track allergies and safely introduce common allergens following best practices',
  },
];

const testimonials = [
  {
    quote: "Finally, an app that understands baby feeding! The meal plans are exactly what I needed.",
    author: "Sarah M.",
    role: "Mom of 8-month-old",
    rating: 5,
  },
  {
    quote: "The food tracker helped me introduce new foods systematically. My pediatrician was impressed!",
    author: "Michael R.",
    role: "Dad of twins",
    rating: 5,
  },
  {
    quote: "I was so stressed about what to feed my baby. This app removed all that anxiety.",
    author: "Jessica L.",
    role: "First-time mom",
    rating: 5,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍼</span>
              <span className="text-xl font-bold text-rose-600">{APP_NAME}</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Sign in</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-rose-600 hover:bg-rose-700">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-rose-50 via-white to-amber-50">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5">
            <Sparkles className="w-4 h-4 mr-2 text-amber-500" />
            AI-Powered Baby Nutrition
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Smart Meal Plans for Your<br />
            <span className="text-rose-600">Little One</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Personalized, age-appropriate baby meal plans in seconds.
            Track foods, generate recipes, and create grocery lists — all powered by AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-rose-600 hover:bg-rose-700 text-lg px-8">
                Start Free Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="text-lg px-8">
                See How It Works
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            No credit card required • Free plan available
          </p>

          {/* Hero Image Placeholder */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 sm:p-8">
              <div className="bg-gradient-to-br from-rose-100 to-amber-100 rounded-xl p-8 sm:p-12 text-center">
                <div className="text-6xl mb-4">👶🍎🥦🥕</div>
                <p className="text-gray-600">
                  Beautiful dashboard preview coming soon
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Baby Feeding
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From first solids to toddler meals, we&apos;ve got you covered with smart tools and guidance.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-gray-100 hover:border-rose-200 hover:shadow-lg transition-all">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-rose-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in 3 simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Set Up Baby Profile',
                description: 'Add your baby\'s age, allergies, and feeding goals',
                emoji: '👶',
              },
              {
                step: '2',
                title: 'Generate Meal Plan',
                description: 'Get a personalized weekly plan in seconds',
                emoji: '✨',
              },
              {
                step: '3',
                title: 'Cook & Track',
                description: 'Follow simple recipes and log new foods',
                emoji: '🍳',
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-6 text-4xl">
                  {item.emoji}
                </div>
                <div className="text-rose-600 font-semibold mb-2">Step {item.step}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Loved by Parents
            </h2>
            <p className="text-xl text-gray-600">
              See what other parents are saying
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-gray-100">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-gradient-to-br from-gray-50 to-rose-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Start free, upgrade when you&apos;re ready
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <Card className="border-gray-200">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Free</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-gray-500">/forever</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {SUBSCRIPTION_PLANS.free.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-600">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/signup">
                  <Button variant="outline" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Monthly */}
            <Card className="border-rose-300 border-2 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-rose-600">Most Popular</Badge>
              </div>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Pro Monthly</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">${SUBSCRIPTION_PLANS.pro_monthly.price}</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {SUBSCRIPTION_PLANS.pro_monthly.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-600">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/signup">
                  <Button className="w-full bg-rose-600 hover:bg-rose-700">
                    Start Free Trial
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Lifetime */}
            <Card className="border-amber-300 border-2 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-amber-600">Limited Time</Badge>
              </div>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Lifetime</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">${SUBSCRIPTION_PLANS.lifetime.price}</span>
                  <span className="text-gray-500">/once</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {SUBSCRIPTION_PLANS.lifetime.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-600">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/signup">
                  <Button variant="outline" className="w-full border-amber-500 text-amber-700 hover:bg-amber-50">
                    Get Lifetime Access
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-rose-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Simplify Baby Feeding?
          </h2>
          <p className="text-xl text-rose-100 mb-8">
            Join thousands of parents who stress less about mealtime.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Start Your Free Plan
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍼</span>
              <span className="text-xl font-bold text-white">{APP_NAME}</span>
            </div>
            <div className="flex gap-8 text-sm">
              <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white">Terms of Service</Link>
              <Link href="/contact" className="hover:text-white">Contact</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
            <p className="mt-2 text-gray-500">
              Disclaimer: This app provides general feeding guidance and is not a substitute for professional medical advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
