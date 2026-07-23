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
import { addSong, addSongFromId } from "@/actions/songs";
import { SpotifyExportButton } from "@/components/ui/SpotifyExportButton";
import { Bookmark } from "lucide-react";

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
    spotify_id: string;
}

interface Turn {
    userInput: string;
    songs: Song[] | null;
    isLoading: boolean;
    error?: string | null;
}

// Song object returned by recommender backend on fastAPI
interface PartialSong {
    spotify_id: string;
    track_name: string;
    artist_name: string;
}


export default function HomeContent({ userMetadata, children }: HomeContentProps) {
    const [profileOpen, setProfileOpen] = useState(false);
    const toggleProfile = () => setProfileOpen(!profileOpen);

    const [songs, setSongs] = useState<Song[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const username = userMetadata.username 

    // Search mode is either "song" or "mood"
    const [searchMode, setSearchMode] = useState("song");
    
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

        const turnIndex = turns.length;
        try {
            setIsLoading(true);
            const newTurn = { userInput: inputVal, songs: null, isLoading: true};
            setTurns(prev => [...prev, newTurn]);
            setInputVal("");

            let res;
            // SEARCH IN SONG MODE
            if (searchMode == "song") {
                const track = await searchSingleSong(inputVal);  // searchSingleSong to get artist and track name
                const songName = track.track_name;
                const artistName = track.artist_name
                console.log(songName, artistName);
                console.log("gemini", songName)
                
                
                res = await fetch("http://localhost:8000/api/process", {
                    method: "POST",
                    headers: {"Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        songName,
                        artistName
                    })
                });
                console.log("RES", res)
            // SEARCH IN MOOD MODE
            } else if (searchMode == "mood") {
                console.log("FETCHING MOOD")
                res = await fetch("http://localhost:8000/api/mood", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ moodPrompt: inputVal })
                });
            } else {
                console.error("Mode not found");
                return;
            }

            if (!res?.ok) {console.log("not ok")}

            const rawData = await res?.json();
            const songData: PartialSong[] = Array.isArray(rawData) ? rawData : (rawData?.data || []);
            console.log("SONG DATA", rawData);

            // const fetchPromises = await songData.data?.map((songNamer: string) => searchSingleSong(songNamer));

            // searchSingleSong to get the album_image (need it to display image)
            const fetchPromises = songData.map(async (partialSong): Promise<Song> => {
                try {
                    const itunesData = await searchSingleSong(partialSong.track_name)
                    console.log("SONG", partialSong)
                    // Preserve partialSong's spotify id and track name
                    return {
                        spotify_id: partialSong.spotify_id,
                        track_name: partialSong.track_name,
                        artist_name: partialSong.artist_name,
                        album_name: itunesData.album_name || "",
                        album_image: itunesData.album_image || "",
                        track_preview: itunesData.track_preview || "",
                    };
                } catch (error) {
                    console.error(`Failed to fetch song: ${partialSong.track_name}`)
                    return {
                        spotify_id: partialSong.spotify_id,
                        track_name: partialSong.track_name,
                        artist_name: partialSong.artist_name,
                        album_name: "",
                        album_image: "",
                        track_preview: "",
                    };
                }
            })

            const results: Song[] = await Promise.all(fetchPromises);

            setTurns(prev => prev.map((turn, i) => 
                i === turnIndex 
                ? {...turn, songs: results, isLoading: false}
                : turn));

            setInputVal("");

        } catch (e) {
            console.error("Error fetching here!!! ", e);
            setTurns(prev => prev.map((turn, i) => 
                i === turnIndex 
                ? {...turn, songs: [], isLoading: false, error: "Failed to generate song"}
                : turn
            ));
        } finally {
            setIsLoading(false);
        }
    }

    // Js object stores key songkey and value boolean
    const [edgeCaseErrors, setEdgeCaseErrors] = useState<{[key: string]: boolean}>({});
    const [addedSongs, setAddedSongs] = useState<{[key: string]: boolean}>({});
    const [alreadyAdded, setAlreadyAdded] = useState<{[key: string]: boolean}>({});
    
    const handleAdd = async (song: Song) => {
        const songKey = `${song.track_name}-${song.artist_name}`;
        const {success, error: e} = await addSongFromId(song.spotify_id);
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
    <SidebarProvider >
        <HomeSidebar username={username} className="z-20"/>
        <SidebarInset>
            <div className="w-full h-10 my-5" />

            {/* SONGS DISPLAY */}
            <main className="w-full flex flex-col z-5 mb-20">
                {turns.map((turn, index) => (
                    <div key={index}>
                        <ChatCard value={turn.userInput} />
                        {/* Display error message if db error */}
                        {turn.error && (<div className="bg-red-100 bg-destructive/15 w-fit p-2 mb-8 border !border-black border-destructive/15">{turn.error}</div>)}
                        {turn.isLoading ? <div className="flex items-center gap-2 pb-8"><Loader2 className="animate-spin ml-10"/>Recommending...</div> :
                        (turn.songs ?? []).map((song, i) => {
                            const songKey = `${song.track_name}-${song.artist_name}`;
                            const thisSongError = !!edgeCaseErrors[songKey];
                            const thisSongAdded = !!addedSongs[songKey];
                            const thisSongAlreadyAdded = !!alreadyAdded[songKey];

                            return <div className="relative mb-2" key={i}>
                                <form className="relative"
                                action={async () => {
                                    console.log("clicked");
                                    handleAdd(song);
                                    }}
                                    >
                                    {/* Bookmark icon AND HANDLE ERROR */}
                                    <button type="submit" className="font-sm px-4 py-2 text-black absolute left-140 top-6">
                                    {thisSongAlreadyAdded
                                    ? <span>"Song already in library</span>
                                    : thisSongError
                                        ? <span className="font-semibold text-red-500">
                                            "Edge case song... error be added to library"
                                        </span>
                                        : 
                                        <Bookmark 
                                            strokeWidth={1.5}
                                            className={`${thisSongAdded ? "fill-yellow-500" : "none"} -translate-y-3 h-10 w-10 text-medium hover:fill-yellow-500 hover:scale-110 transition ease-in-out duration-100`}/>  
                                    }
                                    </button>
                                </form>
                                <MusicCard
                                songName={song.track_name}
                                artistName={song.artist_name}
                                albumName={song.album_name}
                                imageUrl={song.album_image} 
                                className="relative"
                                />
                                {/* Spotify export icon + tooltip */}
                                <div className="group absolute top-4 left-4 rounded-full bg-neutral-200 h-10 w-10">
                                    <SpotifyExportButton songId={song.spotify_id}
                                        iconSize="h-10 w-10"
                                        className="-translate-y-4 hover:scale-110 top-4 peer opacity-100 absolute hover:text-green-500/90 transition-all duration-100 ease-in-out group-hover:opacity-100" />
                                    {/* Export tooltip */}
                                    <span className="absolute right-20 top-4 opacity-0 -translate-y-4 translate-x-1 peer-hover:opacity-100 transition-all duration-300 ease-out bg-neutral-900/90 text-white text-xs font-sm px-2 py-1 rounded shadow-md peer-hover:delay-400">
                                        Open in Spotify
                                    </span>
                                </div>
                            </div>
                        }
                    )}
                    </div>
                ))}
            </main>

            {/* SEARCH BAR AND MODE SWITCHER*/}
            <footer className="fixed bottom-0 right-0 z-10 left-0 md:left-[var(--sidebar-width)] border-t shadow-lg bg-white p-3">
                <div className="flex flex-col md:flex-row items-center gap-2 max-w-5xl mx-auto w-full px-4">
                    
                    {/* Mode Switcher buttons */}
                    <ButtonGroup className="shrink-0">
                        <Button type="button"
                            onClick={() => setSearchMode("song")}
                            variant={searchMode == "song" ? "default" : "secondary"}
                            size="sm"
                        >Similar Song Mode</Button>
                        <Button type="button" 
                            onClick={() => setSearchMode("mood")}
                            variant={searchMode == "mood" ? "default" : "secondary"}
                            size="sm"
                        >Mood Mode</Button>
                    </ButtonGroup>

                    {/* Search bar and go button */}
                    <form className="w-full flex-1 flex justify-center" onSubmit={handleSubmit}>
                        <ButtonGroup className="w-full flex justify-center max-w-xl">
                            <InputGroup className="flex-1">
                                <InputGroupInput 
                                    value={inputVal} 
                                    onChange={(e) => setInputVal(e.target.value)} 
                                    className="w-full placeholder:text-neutral-900/80 shadow-md" 
                                    placeholder={searchMode=="song" 
                                        ? "Piano Man by Billy Joel..." 
                                        : "Late night drive through the city..."}
                                />
                            </InputGroup>
                            <Button type="submit" disabled={isLoading} className="hover:bg-neutral-700/70">
                                {isLoading ? (<Loader2 className="animate-spin"/>) : "Go"}
                            </Button>
                        </ButtonGroup>
                    </form>

                </div>
            </footer>
            {children}
        </SidebarInset>
    </SidebarProvider>
   )
}
