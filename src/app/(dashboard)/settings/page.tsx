import { createClient } from '@/lib/supabase/server';
import { SettingsClient } from './SettingsClient';

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user!.id)
    .single();

  const { data: baby } = await supabase
    .from('babies')
    .select('*')
    .eq('user_id', user!.id)
    .single();

  return (
    <SettingsClient
      user={user!}
      userData={userData}
      baby={baby}
    />
  );
}
