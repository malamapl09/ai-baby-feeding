import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // Default redirect with locale prefix
  const redirect = searchParams.get('redirect') || '/en/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if user has a baby profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: babies } = await supabase
          .from('babies')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        // If no baby profile, redirect to onboarding
        if (!babies || babies.length === 0) {
          return NextResponse.redirect(`${origin}/en/onboarding`);
        }
      }

      return NextResponse.redirect(`${origin}${redirect}`);
    }
  }

  // Return to login page with error
  return NextResponse.redirect(`${origin}/en/login?error=Could not authenticate`);
}
