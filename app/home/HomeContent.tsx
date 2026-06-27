"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import React from "react";
import { HomeSidebar } from "@/components/ui/home-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { FieldDescription, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { ButtonGroup } from "@/components/ui/button-group";
import { POST } from "@/app/api/chat/route"
import { MusicCard } from "@/components/ui/music-card";
import { ChatCard } from "@/components/ui/text-chat-card";
import { addSong, addSongFromTitleArtist } from "@/actions/songs";

interface HomeContentProps {    
    userMetadata: any;
    children: React.ReactNode;
}

interface Song {
    track_name: string;
    artist_name: string;
    album_name: string;
    album_image: string;
    track_preview: string;
}

interface Turn {
    userInput: string;
    songs: Song[] | null;
    isLoading: boolean;
}

export default function HomeContent({ userMetadata, children }: HomeContentProps) {
    const [profileOpen, setProfileOpen] = useState(false);
    const toggleProfile = () => setProfileOpen(!profileOpen);

    const [songs, setSongs] = useState<Song[]>([]);
    const [loaded, setLoaded] = useState(false);
    
    const [inputVal, setInputVal] = useState("");

    const [turns, setTurns] = useState<Turn[]>([]);

    async function searchSingleSong(songName: string): Promise<Song> {
        const response = await fetch("/api/search", {
            method: "POST",
            headers: {"Content-Type": "application/json" },
            body: JSON.stringify({ userInput: songName})
        });

        if (!response.ok) {
            throw new Error(`Request Failed ${response.status}`);
        }

        const data: Song = await response.json();
        return data;
    }


    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault()
        if (!inputVal.trim()) return;

        try {
            
            const newTurn = { userInput: inputVal, songs: null, isLoading: true};
            setTurns(prev => [...prev, newTurn]);
            setInputVal("");
            const turnIndex = turns.length;

            const track = await searchSingleSong(inputVal);
            const songName = track.track_name;
            const artistName = track.artist_name
            console.log(songName, artistName);
            console.log("gemini", songName)

            const res = await fetch("http://localhost:8000/api/process", {
                method: "POST",
                headers: {"Content-Type": "application/json" },
                body: JSON.stringify({ 
                    songName,
                    artistName
                })
            });

            if (!res.ok) {console.log("not ok")}

            const songData = await res.json();
            const fetchPromises = await songData.data.map((songNamer: string) => searchSingleSong(songNamer));
            const results: Song[] = await Promise.all(fetchPromises);

            setTurns(prev => prev.map((turn, i) => 
                i === turnIndex 
                ? {...turn, songs: results, isLoading: false}
                : turn));

            setInputVal("");

        } catch (e) {
            console.error("Error fetching here!!! ", e)
        }
    }

    // Js object stores key songkey and value boolean
    const [edgeCaseErrors, setEdgeCaseErrors] = useState<{[key: string]: boolean}>({});
    const [addedSongs, setAddedSongs] = useState<{[key: string]: boolean}>({});
    const [alreadyAdded, setAlreadyAdded] = useState<{[key: string]: boolean}>({});
    
    const handleAdd = async (song: Song) => {
        const songKey = `${song.track_name}-${song.artist_name}`;
        const {success, error: e} = await addSongFromTitleArtist(song.track_name, song.artist_name);
        console.log("THE ERROR IS", e, success);
        if (e == "Song already in library") {
            setAlreadyAdded(prev => ({...prev, [songKey]: true}));
        }
        else if (e) {
            setEdgeCaseErrors(prev => ({...prev, [songKey]: true}));
        } else {
            setAddedSongs(prev => ({...prev, [songKey]: true}));
        }
    }

   return (
    <SidebarProvider>
        <HomeSidebar />
        <SidebarInset>
            <div className="w-full h-10 my-5" />
            <main className="w-full ">
                {turns.map((turn, index) => (
                    <div key={index}>
                        <ChatCard value={turn.userInput} />
                        {turn.isLoading ? <Loader2 className="animate-spin ml-10"/> :
                        (turn.songs ?? []).map((song, i) => {
                            const songKey = `${song.track_name}-${song.artist_name}`;
                            const thisSongError = !!edgeCaseErrors[songKey];
                            const thisSongAdded = !!addedSongs[songKey];
                            const thisSongAlreadyAdded = !!alreadyAdded[songKey];

                            return <React.Fragment key={i}>
                                      <form className="relative"
                                        action={async () => {
                                            console.log("clicked");
                                            handleAdd(song);
                                        }}
                                      >
                                        <button type="submit" className="font-sm px-4 py-2 text-black border border-black rounded-sm absolute left-140 top-6">
                                        {thisSongAlreadyAdded
                                        ? <span>"Song already in library</span>
                                        : thisSongError
                                            ? <span className="font-semibold text-red-500">
                                                "Edge case song... cannot be added to library"
                                            </span>
                                            : thisSongAdded 
                                                ? <span>
                                                    Song successfully added!
                                                </span>
                                                : <span>
                                                    + add {song.track_name} to library
                                                </span>
                                            
                                        }
                                        </button>
                                      </form>
                                <MusicCard
                                songName={song.track_name}
                                artistName={song.artist_name}
                                albumName={song.album_name}
                                imageUrl={song.album_image} 
                                />
                            </React.Fragment>
                        }
                        )}
                    </div>
                ))}
                <form className="mb-auto mt-1" onSubmit={handleSubmit}>
                <div className="w-7/10 text-center mt-60 ml-70 mb-10">
                    <FieldLabel className="pt-5 pb-2"></FieldLabel>
                        <ButtonGroup className="w-full">
                            <InputGroup className="w-6/10">
                                <InputGroupInput value={inputVal} onChange={(e) => setInputVal(e.target.value)} className="w-full" placeholder="Piano Man by Billy Joel..." />
                            </InputGroup>
                            <ButtonGroup>
                                <Button type="submit">Go</Button>
                            </ButtonGroup>
                        </ButtonGroup>
                        <FieldDescription className="pl-1 pt-2">Enter the song and or artist you want to search for</FieldDescription>
                </div>
                </form>
                {children}
            </main>
        </SidebarInset>
    </SidebarProvider>
   )
}
