"use server";

import { createClient } from "@/utils/supabase/server"; // Adjust this path to match your Supabase server client helper
import { GeneratedSong } from "@/types/song"; // Adjust this path to match your interface file
import { revalidatePath } from "next/cache";
import { cookies } from  "next/headers"
import { SupabaseClient } from "@supabase/supabase-js";
import { SimpleSong } from "@/types/song";
import { redirect } from "next/navigation";

// No input, output array of SimpleSongs that is the next batch
export async function ScrollRecommender() {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Get all seen songs from user
    const { data: userSeenSongs } = await supabase
        .from("user_seen_history")
        .select ("song_id")
        .eq("user_id", user.id)

    const { data: userLibrary } = await supabase
        .from("User_saved_songs")
        .select("song_id")
        .eq("user_id", user.id);
    
    const seenIds = userSeenSongs?.map(song => song.song_id);
    const libraryIds = userLibrary?.map(song => song.song_id);

    const excludeIds = [...seenIds || [], ...libraryIds || []];  // song_id's that shouldn't be recommended again

    // Future speed improvement: modify recommender function to perform recommendation on song list without excluded id's
    try {
        const recommenderRes = await fetch("http://localhost:8000/api/scroller-pool", {
            method: "POST",
            headers: {"Content-Type": "application/json" },
            body: JSON.stringify({ 
                user_id: user.id
            })
        });
        if (!recommenderRes.ok) {
            console.error(" Error fetching result")
        }
        const nextSongBatch = await recommenderRes.json();
        
        if (nextSongBatch.status == "success") {
            const nextSongIds = nextSongBatch.data
            console.log("recommended songs: .....", nextSongIds)
            return nextSongIds;
        } else {
            console.error("BACKEND LOGIC ERROR");
        }
    } catch (error) {
        console.error("Failed to fetch results from backend");
    }
}