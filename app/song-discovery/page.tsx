import Link from "next/link";
import DoomscrollFeed from "./doomscroll-feed";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { POST } from "@/app/api/chat/route";
import { SimpleSong } from "@/types/song";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { HomeSidebar } from "@/components/ui/home-sidebar";

export const dynamic = "force-dynamic";

// Connected to fastAPI function generateFeed
// that takes in list of songID list[str], returns list of songs list[dict] (5-10 songs at once)

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
        .eq("user_id", currUser.id)
        .limit(5);

    console.log("RECENT SONGS", recentSongs);

        return <main className="flex min-h-screen items-center bg-gray-50">
            <SidebarProvider>
            <HomeSidebar username={currUser.user_metadata.username} /> 
                <SidebarInset className="fixed items-center">
                <div className="flex items-center px-4 pt-4 md:hidden">
                    <SidebarTrigger className="absolute left-2 top-2"/>
                </div>

                {/* SCROLLER */}
                <div className="fixed mt-8 h-[85vh] w-full max-w-2xl rounded-2xl bg-neutral-200 p-4">
                    <DoomscrollFeed currentSongs={recentSongs || []}></DoomscrollFeed>
                </div>
                </SidebarInset>
            </SidebarProvider>
        </main>
}