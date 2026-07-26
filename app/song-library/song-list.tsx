"use client";

import { addSong } from "@/actions/songs";
import { ArrowUpDown, ArrowUpNarrowWide, ArrowDownWideNarrow, Trash, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { searchLibrary } from "@/actions/search";
import { HomeSidebar } from "@/components/ui/home-sidebar";
import { SidebarProvider, SidebarInset, Sidebar, SidebarTrigger } from "@/components/ui/sidebar";
import { deleteSong } from "@/actions/delete";
import { SpotifyExportButton } from "@/components/ui/SpotifyExportButton";
import { MusicCard } from "@/components/ui/MusicCard";

export default function SongList({ currUserSongs }: { currUserSongs: any[] }) {
  const [isAscending, setIsAscending] = useState(false);

  // Search state
  const [query, setQuery] = useState("");
  const [queryResults, setQueryResults] = useState<any[] | null>(null);

  const handleInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const userText = event.target.value;
    setQuery(userText);

    if (!userText.trim()) {
      setQueryResults(null); // Clear results if search is empty
      return;
    }

    const searchResults = await searchLibrary(userText);
    setQueryResults(searchResults);
  };

  // Sort full user library songs
  const sortedUserSongs = [...(currUserSongs || [])].sort((a, b) => {
    const aTime = new Date(a.created_at || 0).getTime();
    const bTime = new Date(b.created_at || 0).getTime();
    if (aTime == bTime) {
        return -1;
    }
    return (aTime - bTime > 0 && isAscending) || (aTime - bTime < 0 && !isAscending) ? 1 : -1;
  });

  const displaySongs = queryResults !== null ? queryResults : sortedUserSongs;

  return (
    <main className="w-full mx-auto max-w-5xl p-8 flex flex-col items-center">
      <button
        onClick={() => {
          setIsAscending(!isAscending);
          console.log("reversed");
        }}
        className="right-10 absolute bg-neutral-900 text-white hover:bg-neutral-900/70 p-1.5 rounded-md"
      >
        {isAscending ? "Sort Most Recent" : "Sort Oldest"}
      </button>

      <header className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Your Library</h1>
        <p className="text-gray-400">You have {currUserSongs?.length || 0} songs saved</p>
      </header>

      {/* SEARCH BAR */}
      <input 
        className="border border-black rounded-sm mb-8 pl-2 w-full max-w-150 h-10" 
        placeholder="Search for songs..."
        value={query}
        onChange={handleInputChange}
      />

      {/* DISPLAY SONGS / SEARCH RESULTS */}
      {currUserSongs?.length === 0 ? (
        <div className="text-center p-8 rounded-xl border border-black w-full">
          <p className="text-black mb-4">Library is empty... Start adding songs!</p>
        </div>
      ) : displaySongs.length === 0 ? (
        <div className="text-center p-8 rounded-xl border border-black w-full">
          <p className="text-black mb-4">No songs found matching "{query}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 min-[2000px]:grid-cols-3 gap-5 w-full justify-items-center">
          {displaySongs.map((song) => {
            // Map only search results
            const uniqueId = song.id || song.song_id;
            const trackId = song.song_id;

            return (
              <div
                key={uniqueId}
                className="relative w-full max-w-sm"
              >
                <MusicCard
                  songName={song.title}
                  albumName=""
                  artistName={song.artist}
                  imageUrl=""
                  songId={trackId}
                  isAdded={false}
                  buttonSize={10}    
                />

                <div className="relative group">
                  <div>
                    <button 
                      className="absolute peer cursor-pointer opacity-0 top-4 right-4 hover:text-red-500 duration-200 group-hover:opacity-100 ease-in-out"
                      onClick={async () => deleteSong(uniqueId)}
                    >  
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}