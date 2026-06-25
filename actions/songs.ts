"use server"
// import { addSong } from "@/app/actions/songs"; to use addSong

import { createClient } from "@/utils/supabase/server"; // Adjust this path to match your Supabase server client helper
import { GeneratedSong } from "@/types/song"; // Adjust this path to match your interface file
import { revalidatePath } from "next/cache";
import { cookies } from  "next/headers"
import { SupabaseClient } from "@supabase/supabase-js";

export async function addSong(song: GeneratedSong) {
    try {
        const cookieStore = await cookies()
        const supabase: SupabaseClient = createClient(cookieStore);

        const { data: { user: currUser }, error: authError } = await supabase.auth.getUser();
         
        // User not found, return  error object
        if (authError || !currUser) {
            return {
                success: false,
                error: "Invalid user, error adding songs"
            };
        }

        // Check for song already in library
        const { data: checkSong, error: checkError } = await supabase
            .from("User_saved_songs")
            .select("song_id")
            .eq("user_id", currUser.id)
            .eq("song_id", song.id)
            .maybeSingle()

         if (checkError) {
            console.error("Unable to access database");
            return { sucess: false, error: "Unable to access database" };
         } else if (checkSong) {
            return { sucess: false, error: "Song already in library"};
         }

        // Add song to library
        console.log("USER ID IS ", currUser?.id);
        const {error: dbError } = await supabase
            .from("User_saved_songs")
            .insert({
                user_id: currUser.id,
                song_id: song.id,
                title: song.title,
                artist: song.artist,
                duration: song.duration,
                bpm: song.bpm,
                genre: song.genre,
                prompt: song.prompt,
                album_art_url: song.album_art_url
            });

        if (dbError) {
            console.error("Database error:", dbError.message);
             return {
                success: false, 
                error: "Database error"
             }
        }

        revalidatePath("/song_library");

        return { success: true};
    } catch (error) {
        console.error("Other error")
        return { 
            sucess: false,
            error: "Other error"
        };
    }
}