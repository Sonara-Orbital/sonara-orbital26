"use client";

import { addSong } from "@/actions/songs";
import { ArrowUpDown, ArrowUpNarrowWide, ArrowDownWideNarrow, Trash , Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { searchLibrary } from "@/actions/search";
import { HomeSidebar } from "@/components/ui/home-sidebar";
import { SidebarProvider, SidebarInset, Sidebar } from "@/components/ui/sidebar";
import { deleteSong } from "@/actions/delete";
import { SpotifyExportButton } from "@/components/ui/SpotifyExportButton";
import { MusicCard } from "@/components/ui/MusicCard";

export default function SongList({ currUserSongs }: { currUserSongs: any[] }) {
  const [isAscending, setIsAscending] = useState(false);

  // Search bar for library
  const [query, setQuery] = useState("");
  const [queryResults, setQueryResults] = useState<any[]>([]);

  const handleInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const userText = event.target.value;
    setQuery(userText);
    // console.log(query);

    // Delay here //

    const searchResults = await searchLibrary(userText);
    console.log(searchResults);
    setQueryResults(searchResults);
  }

  // Display songs in user's library, displaySongs is an array of song objects
  const displaySongs = [...(currUserSongs || [])].sort((a, b) => {
    const aTime = new Date(a.created_at || 0).getTime();
    const bTime = new Date(b.created_at || 0).getTime();
    if (aTime == bTime) {
        return -1;
    }
        return (aTime - bTime > 0 && isAscending)  // a added later th an b, b should be before a
        ||
        (aTime - bTime < 0 && !isAscending)
    ? 1
    : -1;
  });

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
      <form
        action={async () => {
          await addSong({
            id: "TRK-0000B860FC",
            title: "Testing AAAA",
            artist: "Pea man",
            duration: "4.4",
            bpm: null,
            genre: "pop",
            prompt: "what song i listen",
            album_art_url: null,
          });
        }}
      >
      </form>

      <header className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Your Library</h1>
        <p className="text-gray-400">You have {currUserSongs?.length || 0} songs saved</p>
      </header>

      {/* SEARCH BAR */}
      <input className="border border-black rounded-sm mb-4 pl-2 w-full max-w-150" 
        placeholder="Search for songs..."
        value={query}
        onChange={handleInputChange}
      ></input>
      <ul className="w-full max-w-150 flex flex-col">
        {queryResults.map((song) => (
          <li key={song.song_id} className="flex justify-between">
            <span className="font-bold">{song.title}</span>
            <span className=""> {song.artist}</span>
            {/* <span>{song}</span> */}
          </li>
        ))}
      </ul>

      {/* DISPLAY SONGS */}
      {currUserSongs?.length === 0 ? (
        <div className="text-center p-8 rounded-xl border border-black">
          <p className="text-black mb-4">Library is empty... Start adding songs!</p>
        </div>
      ) : (
        
        <div className="grid grid-cols-3 gap-5 w-full justify-items-center">
          {displaySongs.map((song) => (
            <div
              key={song.id}
              className="relative w-full max-w-sm"
              >
              <MusicCard
                songName={song.title}
                albumName=""
                artistName={song.artist}
                imageUrl=""
                songId={song.song_id}
                isAdded={false}
                buttonSize={10}    
              ></MusicCard>

              <div className="relative group">
                {/* Delete button */}
                <div>
                  <button className=" absolute peer cursor-pointer opacity-0 absolute top-4 right-4 hover:text-red-500 duration-200 group-hover:opacity-100 ease-in-out"
                    // Delete using the id in User_saved_songs, not song id 
                    onClick={async () => deleteSong(song.id)}>  
                      <Trash2 className="h-5 w-5"></Trash2>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
