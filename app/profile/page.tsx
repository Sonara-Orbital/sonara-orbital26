import { createClient } from '@/utils/supabase/server' 
import { cookies } from 'next/headers'
import { redirect } from "next/navigation"
import ProfileContent from './ProfileContent';
import { findFriends, getFriendRequests } from '../auth/actions';

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

    const friendsList = await findFriends(userId)
    const requestsList = await getFriendRequests(userId)
    
    console.log("friends list", friendsList)
    console.log("requests list", requestsList)
  

  return (
    <ProfileContent friendsList={friendsList} requestsList={requestsList} userProfile={userProfile}>{children}</ProfileContent>
  );
}
