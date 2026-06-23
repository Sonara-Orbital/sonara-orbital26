"use client"

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { addSong } from "@/actions/songs"
import { searchLibrary } from "@/actions/search"
import { useState } from "react";
export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const [query, setQuery] = useState("");
  // Create cllient and get current user
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  // Logout if not signed in
  if (!user) {
    redirect("/login")
  }

  // Get user's songs
  const { data: currUserSongs, error: dbError } = await supabase
    .from("User_saved_songs")
    .select("*")
    .eq("user_id", user.id);

    console.log("here", currUserSongs)

  if (dbError) {
    console.error("Unable to load library data:", dbError);
    return (
      <div className="p-8 text-red-500">
        <h2>Error loading your library</h2>
        <p>{dbError.message}</p>
      </div>
    );
  }

  return (
    // TEST ADD SONGS
    <main className="w-full mx-auto max-w-5xl p-8 flex flex-col items-center">
        <form action={async () => {
            "use server"
            await addSong({
                id: "TRK-0000B8A600FC", 
                title: "Chill Song",
                artist: "Pea man",
                duration: "4.4",
                bpm: null,
                genre: "pop",    
                prompt: "what song i listen",  
                album_art_url: null
            })
        }}>
            <button type="submit" className="bg-blue-500"> TEST </button>
        </form>
    {/* // TEST ADD SONGS */}

    
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Your Library</h1>
        <p className="text-gray-400">You have {currUserSongs?.length || 0} songs saved</p>
      </header>

      {/* Search bar */}
      <input></input>

      {/* Empty library display */}
      {currUserSongs?.length === 0 ? (
        <div className="text-center p-8 rounded-xl border border-black">
          <p className="text-black mb-4"> Library is empty... Start adding songs! </p>
        </div>
      ) : (
        /* Library with songs display */
        <div className="grid grid-cols-3 gap-4 w-full">
          {currUserSongs.reverse()?.map((song) => (
            <div 
      key={song.id}
      className="group relative aspect-square overflow-hidden rounded-xl border border-black shadow-lg duration-400 hover:scale-[1.02] hover:shadow-2xl"
    > 
        {/* 1. Album Cover */}
        {song.album_art_url ? (
          <img 
            src={song.album_art_url} 
            alt={`${song.title} cover`}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          /* No album cover fallback */
          <div className="absolute inset-0 flex items-center justify-center opacity-40 bg-blue-100">
            <span className="text-4xl">🎵</span>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 p-4 pt-12 flex flex-col justify-end">
            
            {/* Title*/}
            <h3 className="text-black font-semibold text-base tracking-wide truncate mb-0.5 transition-colors">
              {song.title}
            </h3>
            
            {/* Artist and genre */}
            <div className="flex items-center gap-1.5 text-xs text-neutral-300">
              <span className="truncate font-medium">{song.artist}</span>
              <span className="text-neutral-500">•</span>
              <span className="text-neutral-400 shrink-0">{song.genre}</span>
            </div>

        </div>
    </div>
          ))}
        </div>
      )}
    </main>
  );
}