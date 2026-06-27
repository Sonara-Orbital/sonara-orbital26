import { createClient } from '@/utils/supabase/server' 
import { cookies } from 'next/headers'
import { redirect } from "next/navigation"
import ProfileContent from './ProfileContent';

export default async function UserProfile({ children }: {children: React.ReactNode}) {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    
    const { data: { user}, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return <p>Not authenticated</p>;
    }

    if (!user) {
      redirect("/login")
    };
    
    const userId = user.id;
    
    const { data: userProfile, error: dbError } = await supabase
    .from('Users')
    .select('id, username, name, avatar_url, created_at')
    .eq('id', userId)
    .single();

    if (dbError || !userProfile) {
        return <p>Profile not found</p>;
    }

  return (
    <ProfileContent userProfile={userProfile}>{children}</ProfileContent>
  );
}
