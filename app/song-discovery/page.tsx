import Link from "next/link";
import DoomscrollFeed from "./doomscroll-feed";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { POST } from "@/app/api/chat/route";
import { SimpleSong } from "@/types/song";


export const dynamic = "force-dynamic";

// Connected to fastAPI function generateFeed
// takes in list of songID list[str], returns list of songs list[dict] (5-10 songs at once)

export default async function SongDiscoveryPage() {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const { data: { user: currUser } } = await supabase.auth.getUser();

    // Logout if not signed in
    if (!currUser) {
        redirect("/login");
    }

    // Get recent songs from user library
    const { data: recentSongs } = await supabase
        .from("User_saved_songs")
        .select("song_id, title, artist")
        .eq("user", currUser)
        .limit(5);

    return <main>
        <Link href="/home" className="hover:text-blue-500 top-4 left-4 relative">  
            &lt; <span className="hover:underline"> back </span>
        </Link>
        
        <DoomscrollFeed currentSongs={recentSongs || []}></DoomscrollFeed>
        
    </main>
}