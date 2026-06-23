"use server";

// Search bar for songs, string -> array[object]

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function searchLibrary(query: string) {
    if (!query || query.trim() == "") {
        return [];
    }
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    // Get current user
      const { data: { user } } = await supabase.auth.getUser();
    
      // Logout if not signed in
      if (!user) {
        redirect("/login")
      }
    
      // Get user's songs
      const { data: queriedSongs, error: dbError } = await supabase
        .from("User_saved_songs")
        .select("song_id, title, artist, album_art_url")
        .eq("user_id", user.id);
    
      if (dbError) {
        console.error("Unable to load library data:", dbError);
        return [];
      }

      console.log(queriedSongs.map(x => x.title));

      return queriedSongs;

}