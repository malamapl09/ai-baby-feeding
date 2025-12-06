import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/Navbar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user has a baby profile
  const { data: babies } = await supabase
    .from('babies')
    .select('id')
    .eq('user_id', user.id)
    .limit(1);

  if (!babies || babies.length === 0) {
    redirect('/onboarding');
  }

  // Get user subscription status
  const { data: userData } = await supabase
    .from('users')
    .select('subscription_plan')
    .eq('id', user.id)
    .single();

  const isPro = userData?.subscription_plan !== 'free';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} isPro={isPro} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
