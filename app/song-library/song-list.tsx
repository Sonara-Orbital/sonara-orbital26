"use client";

import { addSong } from "@/actions/songs";
import { ArrowUpDown, ArrowUpNarrowWide, ArrowDownWideNarrow } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function SongList({ currUserSongs }: { currUserSongs: any[] }) {
  const [isAscending, setIsAscending] = useState(true);

  const displaySongs = [...(currUserSongs || [])].sort((a, b) => {
    const aTime = new Date(a.created_at || 0).getTime();
    const bTime = new Date(b.created_at || 0).getTime();
    if (aTime == bTime) {
        return -1;
    }
        return (aTime - bTime > 0 && isAscending)  // a added later than b, b should be before a
        ||
        (aTime - bTime < 0 && !isAscending)
    ? 1
    : -1;
  });

  return (
    <main className="w-full mx-auto max-w-5xl p-8 flex flex-col items-center">
      <Link href="/home" className="hover:text-blue-500 top-4 left-4 absolute">
        &lt; <span className="hover:underline"> back </span>
      </Link>
      <button
        onClick={() => {
          setIsAscending(!isAscending);
          console.log("reversed");
        }}
        className="right-10 absolute"
      >
        {isAscending ? "Sort Most Recent" : "Sort Oldest"}
      </button>
      <form
        action={async () => {
          await addSong({
            id: "TRK-0000B8A600FC",
            title: "Chill Song",
            artist: "Pea man",
            duration: "4.4",
            bpm: null,
            genre: "pop",
            prompt: "what song i listen",
            album_art_url: null,
          });
        }}
      >
        <button type="submit" className="bg-blue-500 px-4 py-2 text-white rounded-lg">
          TEST
        </button>
      </form>

      <header className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Your Library</h1>
        <p className="text-gray-400">You have {currUserSongs?.length || 0} songs saved</p>
      </header>

      {/* SEARCH BAR */}
      <input className="border border-black w-3xl rounded-sm mb-4" placeholder="Search for songs...
      "></input>

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
                <h3 className="text-black font-semibold text-base tracking-wide truncate mb-0.5 transition-colors">
                  {song.title}
                </h3>
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
