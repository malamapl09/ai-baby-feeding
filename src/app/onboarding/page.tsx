'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { APP_NAME, FEEDING_GOALS, COMMON_ALLERGENS } from '@/config/constants';
import { FeedingGoal } from '@/types';
import { Loader2, Baby, Heart, Sparkles } from 'lucide-react';

const steps = [
  { id: 1, title: 'Baby Info', description: 'Tell us about your little one' },
  { id: 2, title: 'Allergies', description: 'Any food sensitivities?' },
  { id: 3, title: 'Goals', description: 'What are your feeding goals?' },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Form data
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [country, setCountry] = useState('US');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [feedingGoal, setFeedingGoal] = useState<FeedingGoal>('balanced_nutrition');

  const calculateAge = (birthdate: string) => {
    if (!birthdate) return null;
    const birth = new Date(birthdate);
    const today = new Date();
    const months = (today.getFullYear() - birth.getFullYear()) * 12 +
                   (today.getMonth() - birth.getMonth());
    return months;
  };

  const ageMonths = calculateAge(birthdate);

  const handleAllergyToggle = (allergen: string) => {
    setAllergies(prev =>
      prev.includes(allergen)
        ? prev.filter(a => a !== allergen)
        : [...prev, allergen]
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    const { error: insertError } = await supabase
      .from('babies')
      .insert({
        user_id: user.id,
        name,
        birthdate,
        country,
        allergies,
        feeding_goal: feedingGoal,
      });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Baby&apos;s name</Label>
              <Input
                id="name"
                placeholder="Enter baby's name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthdate">Birthdate</Label>
              <Input
                id="birthdate"
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                required
              />
              {ageMonths !== null && (
                <p className="text-sm text-gray-500">
                  {ageMonths} months old
                  {ageMonths < 6 && (
                    <span className="text-amber-600 ml-2">
                      (Solids typically start around 6 months)
                    </span>
                  )}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="UK">United Kingdom</SelectItem>
                  <SelectItem value="AU">Australia</SelectItem>
                  <SelectItem value="MX">Mexico</SelectItem>
                  <SelectItem value="DO">Dominican Republic</SelectItem>
                  <SelectItem value="ES">Spain</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Select any known allergies or foods to avoid. You can update this later.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {COMMON_ALLERGENS.map((allergen) => (
                <div
                  key={allergen}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={allergen}
                    checked={allergies.includes(allergen)}
                    onCheckedChange={() => handleAllergyToggle(allergen)}
                  />
                  <Label
                    htmlFor={allergen}
                    className="text-sm font-normal capitalize cursor-pointer"
                  >
                    {allergen}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Note: If your baby hasn&apos;t been tested for allergies yet, leave these unchecked.
              We&apos;ll guide you through safe food introduction.
            </p>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              What&apos;s your main goal? This helps us personalize meal suggestions.
            </p>
            <div className="space-y-3">
              {Object.entries(FEEDING_GOALS).map(([key, { label, description }]) => (
                <div
                  key={key}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    feedingGoal === key
                      ? 'border-rose-500 bg-rose-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFeedingGoal(key as FeedingGoal)}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${
                        feedingGoal === key
                          ? 'border-rose-500 bg-rose-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {feedingGoal === key && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{label}</p>
                      <p className="text-sm text-gray-500">{description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return name && birthdate;
      case 2:
        return true; // Allergies are optional
      case 3:
        return feedingGoal;
      default:
        return false;
    }
  };

  const stepIcons = [Baby, Heart, Sparkles];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-rose-600">{APP_NAME}</h1>
          <p className="text-gray-600 mt-2">Let&apos;s set up your baby&apos;s profile</p>
        </div>

        {/* Progress steps */}
        <div className="flex justify-between mb-8">
          {steps.map((step, index) => {
            const Icon = stepIcons[index];
            return (
              <div
                key={step.id}
                className={`flex flex-col items-center flex-1 ${
                  index < steps.length - 1 ? 'relative' : ''
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= step.id
                      ? 'bg-rose-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-xs mt-2 ${
                    currentStep >= step.id ? 'text-rose-600' : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`absolute top-5 left-1/2 w-full h-0.5 ${
                      currentStep > step.id ? 'bg-rose-500' : 'bg-gray-200'
                    }`}
                    style={{ transform: 'translateX(50%)' }}
                  />
                )}
              </div>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
                {error}
              </div>
            )}
            {renderStep()}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              disabled={currentStep === 1}
            >
              Back
            </Button>
            {currentStep < steps.length ? (
              <Button
                onClick={() => setCurrentStep((prev) => prev + 1)}
                disabled={!canProceed()}
                className="bg-rose-600 hover:bg-rose-700"
              >
                Continue
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading || !canProceed()}
                className="bg-rose-600 hover:bg-rose-700"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Get Started
              </Button>
            )}
          </CardFooter>
        </Card>

        <p className="text-xs text-center text-gray-500 mt-6">
          By continuing, you agree to our Terms of Service and acknowledge
          that this app provides general guidance, not medical advice.
        </p>
      </div>
    </div>
  );
}
