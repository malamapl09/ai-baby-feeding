'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SUBSCRIPTION_PLANS } from '@/config/constants';
import { Check, Crown, Loader2, AlertCircle } from 'lucide-react';

function PricingContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const canceled = searchParams.get('canceled');

  const handleSubscribe = async (plan: string) => {
    setLoading(plan);

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error:', error);
      setLoading(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 mb-4">
          <Crown className="w-8 h-8 text-amber-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Upgrade to Pro
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Unlock unlimited meal plans, grocery lists, and all premium features to make feeding your baby even easier.
        </p>
      </div>

      {canceled && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <p className="text-amber-800">
              Checkout was canceled. No worries - you can upgrade anytime!
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Pro Monthly */}
        <Card className="border-rose-300 border-2 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-rose-600">Most Popular</Badge>
          </div>
          <CardHeader>
            <CardTitle>Pro Monthly</CardTitle>
            <CardDescription>Perfect for trying out all features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
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
            <Button
              onClick={() => handleSubscribe('pro_monthly')}
              disabled={loading !== null}
              className="w-full bg-rose-600 hover:bg-rose-700"
            >
              {loading === 'pro_monthly' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Subscribe Monthly'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Pro Annual */}
        <Card className="border-green-300 border-2 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-green-600">Save 34%</Badge>
          </div>
          <CardHeader>
            <CardTitle>Pro Annual</CardTitle>
            <CardDescription>Best value for committed parents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <span className="text-4xl font-bold">${SUBSCRIPTION_PLANS.pro_annual.price}</span>
              <span className="text-gray-500">/year</span>
              <p className="text-sm text-green-600 mt-1">
                $6.58/month - Save $40/year
              </p>
            </div>
            <ul className="space-y-3 mb-6">
              {SUBSCRIPTION_PLANS.pro_annual.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-600">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              onClick={() => handleSubscribe('pro_annual')}
              disabled={loading !== null}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading === 'pro_annual' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Subscribe Annually'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Lifetime */}
        <Card className="border-amber-300 border-2 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-amber-600">Limited Time</Badge>
          </div>
          <CardHeader>
            <CardTitle>Lifetime</CardTitle>
            <CardDescription>One-time payment, forever access</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <span className="text-4xl font-bold">${SUBSCRIPTION_PLANS.lifetime.price}</span>
              <span className="text-gray-500">/once</span>
              <p className="text-sm text-amber-600 mt-1">
                Launch special - Price will increase
              </p>
            </div>
            <ul className="space-y-3 mb-6">
              {SUBSCRIPTION_PLANS.lifetime.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-600">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              onClick={() => handleSubscribe('lifetime')}
              disabled={loading !== null}
              variant="outline"
              className="w-full border-amber-500 text-amber-700 hover:bg-amber-50"
            >
              {loading === 'lifetime' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Get Lifetime Access'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-1">Can I cancel anytime?</h4>
            <p className="text-gray-600 text-sm">
              Yes! Monthly and annual subscriptions can be canceled at any time. You&apos;ll keep access until the end of your billing period.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">What payment methods do you accept?</h4>
            <p className="text-gray-600 text-sm">
              We accept all major credit cards, debit cards, and Apple Pay through Stripe&apos;s secure payment system.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Is there a refund policy?</h4>
            <p className="text-gray-600 text-sm">
              We offer a 7-day money-back guarantee. If you&apos;re not satisfied, contact us for a full refund.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Will the lifetime price increase?</h4>
            <p className="text-gray-600 text-sm">
              Yes, the $49 lifetime deal is a launch special. Once we reach our target users, the price will increase to $99.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-rose-600" /></div>}>
      <PricingContent />
    </Suspense>
  );
}
