"use server";

import { createClient } from "@/utils/supabase/server"; 

import { revalidatePath } from "next/cache";
import { cookies } from  "next/headers"
import { SupabaseClient } from "@supabase/supabase-js";
import { SimpleSong } from "@/types/song";
import { redirect } from "next/navigation";

// No input, output array of SimpleSongs that is the next batch
export async function ScrollRecommender(blackListIds: string[], seedSongIds: string[] = []) {
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
                user_id: user.id,
                blackListIds: excludeIds,
                seedSongIds: seedSongIds
            })
        });
        
        if (!recommenderRes.ok) {
            console.error(" Error fetching result");
            return { sucess: false, error: "Error fetching result"};
        }

        // nextSongBatch is an array of SimpleSongs's
        const nextSongBatch = await recommenderRes.json();
        
        // Return res
        if (nextSongBatch.status == "success") {
            console.log("recommended songs: .....", nextSongBatch);
            return nextSongBatch;
        } else {
            console.error("BACKEND LOGIC ERROR");
            return { sucess: false, error: "Backend logic error"};
        }
    } catch (error) {
        console.error("Failed to fetch results from backend");
        return { sucess: false, error: "Failed to fetch"};
    }
}