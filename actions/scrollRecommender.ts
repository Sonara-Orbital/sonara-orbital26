"use server";

import { createClient } from "@/utils/supabase/server"; // Adjust this path to match your Supabase server client helper
import { GeneratedSong } from "@/types/song"; // Adjust this path to match your interface file
import { revalidatePath } from "next/cache";
import { cookies } from  "next/headers"
import { SupabaseClient } from "@supabase/supabase-js";
import { SimpleSong } from "@/types/song";
import { redirect } from "next/navigation";

// No input, output array of SimpleSongs that is the next batch
export function ScrollRecommender() {
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

    const excludeIds = [seenIds..., libraryIds...];

    // Get all user library songs except seen


    const recommenderRes = fetch("http://localhost:8000/api/process", {
        method: "POST",
        headers: {"Content-Type": "application/json" },
        body: JSON.stringify({ 
            .song_id,
            .artist
        })
    });
    const nextSongBatch = await recommenderRes.json();
    const outputSongs: Song[] = nextSongBatch.data;
}