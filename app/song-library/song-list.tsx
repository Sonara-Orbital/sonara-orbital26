"use client";

import { addSong } from "@/actions/songs";
import { Plus, ArrowUpDown, ArrowUpNarrowWide, ArrowDownWideNarrow, Trash , Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { searchLibrary } from "@/actions/search";
import { SidebarProvider, SidebarInset, Sidebar, SidebarTrigger } from "@/components/ui/sidebar";
import { deleteSong } from "@/actions/delete";
import { SpotifyExportButton } from "@/components/ui/SpotifyExportButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { MusicCard } from "@/components/ui/MusicCard";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SongListProps {
  currUserSongs: any,
  userId: string
}

export default function SongList({ currUserSongs, userId }: SongListProps) {
  const router = useRouter();
  const [isAscending, setIsAscending] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false)
  const [inputVal, setInputValue] = useState("")

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
  
  async function handleUpload() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    console.log(API_URL)
    try {
      const res = await fetch(`${API_URL}/api/add-playlist`, {
          method: "POST",
          headers: {"Content-Type": "application/json" },
          body: JSON.stringify({ 
              user_id: userId,
              playlist_url: inputVal
          })
      });
      if (!res.ok) {
        console.error(`upload failed with status ${res.status}`, await res.text());
        return;
      }
      const data = await res.json()
      console.log("playlist added")
      setInputValue("")
      setUploadOpen(false);
      router.refresh();
    } catch (err) {
      console.error("Network or server error", err)
    }

  }

  return (
        <main className="w-full mx-auto max-w-5xl p-8 flex flex-col items-center">
          

          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="left-10 absolute bg-neutral-900 text-white hover:bg-neutral-900/70 p-1.5 rounded-md"
                  onClick={() => setUploadOpen(!uploadOpen)}
                ><Plus/>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                Add songs from Spotify
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Playlist Upload</DialogTitle>
                <DialogDescription>
                  Add in the spotify share URL of the public playlist you wish to upload
                </DialogDescription>
              </DialogHeader>

              {/* Form Content */}
              <div className="py-4">
                <Input
                  placeholder="https://open.spotify.com/playlist/..."
                  value={inputVal}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </div>

              <DialogFooter>
                <Button type="button" onClick={handleUpload}>
                  Upload
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
            {/* <button type="submit" className="bg-blue-500 px-4 py-2 text-white rounded-lg">
              TEST
            </button> */}
          </form>

          <header className="mb-4">
            <h1 className="text-3xl font-bold tracking-tight">Your Library</h1>
            <p className="text-gray-400">You have {currUserSongs?.length || 0} {currUserSongs?.length == 1 ? "song" : "songs"} saved</p>
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
      ) : sortedUserSongs.length === 0 ? (
        <div className="text-center p-8 rounded-xl border border-black w-full">
          <p className="text-black mb-4">No songs found matching "{query}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 min-[2000px]:grid-cols-3 gap-7 w-full justify-items-center">
          {displaySongs.map((song) => {
            // Map only search results
            const uniqueId = song.id || song.song_id;
            const trackId = song.song_id;

            return (
              <div
                key={uniqueId}
                className="relative w-full max-w-sm pb-2"
              >
                <div className="hover:scale-110 transition ease-in-out duration-300">
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
                        className="z-20 absolute peer cursor-pointer opacity-100 right-4 -top-10 hover:scale-110 hover:text-red-500 duration-200 group-hover:opacity-100 ease-in-out"
                        onClick={async () => deleteSong(uniqueId)}
                      >  
                        <Trash2 className="h-6 w-6" />
                      </button>
                    </div>
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