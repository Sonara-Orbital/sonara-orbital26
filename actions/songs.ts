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
            return { success: false, error: "Unable to access database" };
         } else if (checkSong) {
            return { success: true};
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

        revalidatePath("/song-library");

        return { success: true };
    } catch (error) {
        console.error("Other error")
        return { 
            success: false,
            error: "Other error"
        };
    }
}

export async function addSongFromId(song_id: string) {
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

    const { data: songData, error } = await supabase.from("Songs")
        .select("track_name, artist_name, duration_ms, tempo")
        .eq("id", song_id);

    if (error) {
        console.error(("db error"));
        return { 
            success: false,
            error: "db error"
        };
    }

    const song = songData[0];

    const songAdding: GeneratedSong = {
                id: song_id,
                title: song.track_name,
                artist: song.artist_name,
                duration: song.duration_ms,
                bpm: null,
                genre: null, 
                prompt: null, 
                album_art_url: null
            };
    addSong(songAdding)
    
    return { success: true };        

    } catch (error) {
        console.error("Other error")
        return { 
            success: false,
            error: "Other error"
        };
    }
}

export async function addSongFromTitleArtist(uncleanTitle: string, uncleanArtist: string) {
    console.log("adding");
    const title = uncleanTitle.trim();
    const artist = uncleanArtist.trim();

    const cookieStore = await cookies()
    const supabase: SupabaseClient = createClient(cookieStore);

    const { data: { user: currUser }, error: authError } = await supabase.auth.getUser();
        
    // User not found, return  error object
    if (authError || !currUser || !currUser.id) {
        console.log("error");
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
        .ilike("title", title)
        .ilike("artist", artist)
        .limit(1);
    
    console.log("IN LIBRARY", checkSong);

    if (checkError) {
        console.error("error checking")
        return { success: false, error: "db er"};
    } else if (checkSong && checkSong.length > 0) {  // Song already in library
        return { success: true};
    }

    console.log("TITLE", title, artist);
    let { data: song, error: fetchError } = await supabase
        .from("Songs")
        .select("*")
        .ilike("track_name", `${title}`)
        .ilike("artist_name", `${artist}`)
        .limit(1);
        
        let finalTitle = song?.[0]?.track_name ?? null;
        
        // FALLBACK SONG CHECK
        if (!song || song.length == 0) {
            // Fallback if no song found
            console.log("FALLBACK CHECK");
            // dash check
            let baseTitle = title;
            if (baseTitle.includes("-")) {
                baseTitle = baseTitle.split("-")[0];
            }
            // baseTitle: the song title that is returned by recommender
            baseTitle = baseTitle.replace(/\s*[\(\[][^)]*[\)\]]\s*/g, "").trim();
            
            console.log("CURRENT CLEANED QUERY IS ", baseTitle);
            
            const { data: fallbackSong, error: fallbackError} = await supabase
            .from("Songs")
            .select("*")
            .ilike("track_name", `%${baseTitle}%`) 
            .ilike("artist_name", artist) 
            .limit(1);
            
            if (fallbackError) {
                console.error("SONG CANT BE FOUNDDD final");
                return { success: false, error: "SONG CANT BE FOUNDDD"};
            }
            song = fallbackSong
            
            try {
                // CHECK IF IN LIBRARY AGAIN
                const { data: checkSong, error: checkError } = await supabase
                .from("User_saved_songs")
                .select("song_id")
                .eq("user_id", currUser.id)
                .ilike("title", song[0].track_name)
                .ilike("artist", song[0].artist_name)
                .limit(1);
            } catch (error) {
                console.log(error, "PAUSE");
            }


            if (checkError) {
                console.error("error checking")
                return { success: false, error: "db er"};
            } else if (checkSong && checkSong.length > 0) {  // Song already in library
                return { success: true };
            } 
            console.log("SECOND CHECKSONG", checkSong);
            
        }
        
        
        if (fetchError || !song) {
            console.log("error db");
            return {
                success: false, 
                error: "Database error"
            }
        }
        
        const foundSong = song[0];
        if (!foundSong) {
            console.error("Problem adding song to library...");
            return {
                success: false, 
                error: "Database error"
            }
    }
    console.log("song is", foundSong, song, title, " ", artist);
    finalTitle = foundSong.track_name;

    const {error: dbError } = await supabase
            .from("User_saved_songs")
            .insert({
                user_id: currUser.id,
                song_id: foundSong.id,
                title: finalTitle,
                artist: foundSong.artist_name,
                duration: foundSong.duration_ms ?? foundSong.duraction ?? 0,
                bpm: foundSong.bpm ?? null,
                genre: foundSong.genre ?? null,
                prompt: foundSong.prompt ?? null,
                album_art_url: foundSong.album_art_url ?? null
            });

        if (dbError) {
            console.log("db error");
            console.error("Database error:", dbError.message);
            return {
                success: false, 
                error: "Database error"
            };
        }

        revalidatePath("/song-library");
        console.log("added", foundSong.track_name);
        return { success: true };
    }