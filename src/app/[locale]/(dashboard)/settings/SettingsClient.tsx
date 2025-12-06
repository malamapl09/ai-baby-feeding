'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FEEDING_GOALS, COMMON_ALLERGENS, SUBSCRIPTION_PLANS } from '@/config/constants';
import { Baby, FeedingGoal, User as UserType } from '@/types';
import { User } from '@supabase/supabase-js';
import { formatAge } from '@/lib/utils/age';
import { Loader2, Save, Crown, User as UserIcon, Baby as BabyIcon, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface SettingsClientProps {
  user: User;
  userData: UserType | null;
  baby: Baby | null;
}

export function SettingsClient({ user, userData, baby }: SettingsClientProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Baby form state
  const [babyName, setBabyName] = useState(baby?.name || '');
  const [birthdate, setBirthdate] = useState(baby?.birthdate || '');
  const [country, setCountry] = useState(baby?.country || 'US');
  const [allergies, setAllergies] = useState<string[]>(baby?.allergies || []);
  const [feedingGoal, setFeedingGoal] = useState<FeedingGoal>(
    (baby?.feeding_goal as FeedingGoal) || 'balanced_nutrition'
  );

  const isPro = userData?.subscription_plan !== 'free';

  const handleAllergyToggle = (allergen: string) => {
    setAllergies((prev) =>
      prev.includes(allergen) ? prev.filter((a) => a !== allergen) : [...prev, allergen]
    );
  };

  const handleSaveBaby = async () => {
    if (!baby) return;

    setSaving(true);
    const supabase = createClient();

    const { error } = await supabase
      .from('babies')
      .update({
        name: babyName,
        birthdate,
        country,
        allergies,
        feeding_goal: feedingGoal,
      })
      .eq('id', baby.id);

    if (error) {
      toast.error('Failed to save changes');
    } else {
      toast.success('Changes saved successfully');
      router.refresh();
    }

    setSaving(false);
  };

  const handleManageSubscription = async () => {
    // In production, this would redirect to Stripe Customer Portal
    toast.info('Redirecting to subscription management...');
    // const response = await fetch('/api/stripe/create-portal-session');
    // const { url } = await response.json();
    // window.location.href = url;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and baby profile</p>
      </div>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-gray-500">Email</Label>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <Label className="text-gray-500">Member since</Label>
            <p className="font-medium">
              {new Date(user.created_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium capitalize">
                {userData?.subscription_plan?.replace('_', ' ') || 'Free'}
              </p>
              {userData?.subscription_status && (
                <Badge
                  variant={userData.subscription_status === 'active' ? 'default' : 'destructive'}
                  className="mt-1"
                >
                  {userData.subscription_status}
                </Badge>
              )}
            </div>
            {isPro ? (
              <Button variant="outline" onClick={handleManageSubscription}>
                Manage Subscription
              </Button>
            ) : (
              <Link href="/pricing">
                <Button className="bg-amber-500 hover:bg-amber-600">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Pro
                </Button>
              </Link>
            )}
          </div>
          {!isPro && (
            <p className="text-sm text-gray-500">
              Upgrade to Pro for unlimited meal plans, grocery lists, and more!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Baby Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BabyIcon className="w-5 h-5" />
            Baby Profile
          </CardTitle>
          <CardDescription>
            {baby && `${baby.name} • ${formatAge(baby.birthdate)}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="babyName">Name</Label>
            <Input
              id="babyName"
              value={babyName}
              onChange={(e) => setBabyName(e.target.value)}
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger>
                <SelectValue />
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

          <div className="space-y-2">
            <Label>Feeding Goal</Label>
            <Select value={feedingGoal} onValueChange={(v) => setFeedingGoal(v as FeedingGoal)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FEEDING_GOALS).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Known Allergies</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COMMON_ALLERGENS.map((allergen) => (
                <div key={allergen} className="flex items-center space-x-2">
                  <Checkbox
                    id={`allergy-${allergen}`}
                    checked={allergies.includes(allergen)}
                    onCheckedChange={() => handleAllergyToggle(allergen)}
                  />
                  <Label
                    htmlFor={`allergy-${allergen}`}
                    className="text-sm font-normal capitalize cursor-pointer"
                  >
                    {allergen}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleSaveBaby}
            disabled={saving}
            className="bg-rose-600 hover:bg-rose-700"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </CardFooter>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-gray-500">
                Permanently delete your account and all data
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
