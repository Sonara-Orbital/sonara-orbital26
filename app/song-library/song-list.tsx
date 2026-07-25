"use client";

import { addSong } from "@/actions/songs";
import { Plus, ArrowUpDown, ArrowUpNarrowWide, ArrowDownWideNarrow, Trash , Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { searchLibrary } from "@/actions/search";
import { HomeSidebar } from "@/components/ui/home-sidebar";
import { SidebarProvider, SidebarInset, Sidebar } from "@/components/ui/sidebar";
import { deleteSong } from "@/actions/delete";
import { SpotifyExportButton } from "@/components/ui/SpotifyExportButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

interface SongListProps {
  currUserSongs: any,
  userId: string
}

export default function SongList({ currUserSongs, userId }: SongListProps) {
  const router = useRouter();
  const [isAscending, setIsAscending] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false)
  const [inputVal, setInputValue] = useState("")

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
          <button
            className="left-10 absolute bg-neutral-900 text-white hover:bg-neutral-900/70 p-1.5 rounded-md"
            onClick={() => setUploadOpen(!uploadOpen)}
          ><Plus/></button>
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
            <div className="grid grid-cols-3 gap-4 w-full">
              {displaySongs.map((song) => (
                <div
                  key={song.id}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-black shadow-lg duration-400 hover:scale-[1.02] hover:shadow-2xl"
                  >
                  {song.album_art_url ? (
                    <img  
                      src={song.album_art_url}
                      alt={`${song.title} cover`}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-40 bg-blue-100">
                      <span className="text-4xl">🎵</span>
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 p-4 pt-12 flex flex-col justify-end">
                    <h3 className="text-black font-semibold text-base truncate mb-0.5 transition-colors">
                      {song.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-black/50">
                      <span className="truncate font-medium">{song.artist}</span>
                      <span className="text-neutral-500">•</span>
                      <span className="text-gray-500 shrink-0">{song.genre}</span>
                    </div>
                  </div>

                  <div className="relative group">
                    {/* Delete button */}
                    <div>
                      <button className="peer cursor-pointer opacity-0 absolute top-4 right-4 hover:text-red-500 duration-200 group-hover:opacity-100 ease-in-out"
                        // Delete using the id in User_saved_songs, not song id 
                        onClick={async () => deleteSong(song.id)}>  
                          <Trash2 className="h-5 w-5"></Trash2>
                      </button>
                      {/* Export tooltip */}
                      <span className="absolute right-20 top-4 opacity-0 translate-x-9 peer-hover:opacity-100 transition-all duration-300 ease-out bg-neutral-900/90 text-white text-xs font-sm px-2 py-1 rounded shadow-md peer-hover:delay-400">
                        Remove song
                      </span>
                    </div>

                    {/* Spotify export button */}
                    <div className="group/tooltip transition-all relative top-4 left-4 rounded-full">
                      <SpotifyExportButton songId={song.song_id} 
                        iconSize="h-5 w-5"
                        className="peer opacity-0 absolute hover:text-green-500/90 transition-all duration-200 ease-in-out group-hover:opacity-100 hover:scale-110" />
                      {/* Export tooltip */}
                      <span className="absolute right-20 top-4 opacity-0 -translate-y-4 translate-x-1 peer-hover:opacity-100 transition-all duration-300 ease-out bg-neutral-900/90 text-white text-xs font-sm px-2 py-1 rounded shadow-md peer-hover:delay-400">
                        Open in Spotify
                      </span>
                    </div>
                  </div>
                  

                </div>
              ))}
            </div>
          )}
        </main>
  );
}
