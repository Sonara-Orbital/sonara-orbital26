"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import React from "react";
import { HomeSidebar } from "@/components/ui/home-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { ButtonGroup } from "@/components/ui/button-group";
import { POST } from "@/app/api/chat/route"
import { MusicCard } from "@/components/ui/music-card";

interface HomeContentProps {
    userMetadata: any;
    children: React.ReactNode;
}

interface Song {
    track_name: string;
    artist_name: string;
    album_name: string;
}

export default function HomeContent({ userMetadata, children }: HomeContentProps) {
    const supabase = createClient();

    const [collapsedBar, setCollapsedBar] = useState(false);
    const [collapsedMenu, setCollapsedMenu] = useState(false);

    const [profileOpen, setProfileOpen] = useState(false);
    const toggleProfile = () => setProfileOpen(!profileOpen);

    const [songs, setSongs] = useState<Song[]>([]);
    const [loaded, setLoaded] = useState(false);
    
    const [inputVal, setInputVal] = useState("");


    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault()
        if (!inputVal.trim()) return;

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {"Content-Type": "application/json" },
                body: JSON.stringify({ userInput: inputVal })
            });

            if (!response.ok) {
                throw new Error("Request Failed");
            }

            const data = await response.json();
            const songName = data.songs[0].songName;
            const artistName = data.songs[0].artistName;
            console.log("gemini", songName)
            const inputSong = songName + " " + artistName

            const res = await fetch("http://localhost:8000/api/process", {
                method: "POST",
                headers: {"Content-Type": "application/json" },
                body: JSON.stringify({ 
                    songName,
                    artistName
                })
            });
            const songData = await res.json();
            const outputSongs: Song[] = songData.data;
            setSongs(outputSongs);
            console.log(songData.data);

            setLoaded(true);
            setInputVal("");

        } catch (e) {
            console.error(e)
        }
    }

    /*
    return (
        <div className={styles.layout}>
            <aside className={`${styles.sidebar} ${collapsedBar ? styles.collapsedBar : ""}`}>
                <div className={`${collapsedBar ? styles.buttonContainer : styles.buttonContainerOpen}`}>
                    <h1 className={collapsedBar ? styles.sidebarTitleClosed : styles.sidebarTitle}>{!collapsedBar && "Sonara"}</h1>
                    <button className={`${collapsedBar ? styles.collapsedToggle : styles.toggle}`} onClick={() => {
                            setCollapsedBar(!collapsedBar);
                            console.log("collapse");
                            }}>
                        {collapsedBar ? "☰": "✕"}
                    </button>
                </div>
                <div className={collapsedBar? "" : styles.navContainer}>
                    <nav className={`${styles.nav} ${ collapsedBar ? styles.navClosed : styles.nav}`}>
                        <a href="/profile">{collapsedBar ? "⍜" : "Vibe Generator"}</a>
                        <Link href="/song-discovery"><button>{collapsedBar ? "●" : "Song Discovery"}</button></Link>
                        <a href="/song-library">{collapsedBar ? "●" : "Song Library"}</a>
                        <a href="/profile">{collapsedBar ? "●" : "Friends"}</a>
                    </nav>
                </div>
                <div className={styles.userContainer}>
                <Link href="/profile">
                    <div className={styles.profilePic}>
                        <Image src={userMetadata.avatar_url == "" ? null : userMetadata.avatar_url } alt="User Profile Picture" className="object-cover h-9 w-9"/>
                    </div>
                </Link>
                <Link href="/profile">
                    <h1 className={`${styles.username} ${ collapsedBar ? styles.usernameClosed: ""}`}>{userMetadata.username}</h1>
                </Link>
                </div>
            </aside>

            <main className={styles.main}>
                <h1>Main Content!</h1>
                <div className="fixed bottom-6 w-full flex gap-4"> +
                    <input placeholder="Enter Prompt..." type="text" className="pl-2 border rounded-xl w-full max-w-240"></input>
                </div>
            </main>
        </div>
    )
    */
   return (
    <SidebarProvider>
        <HomeSidebar />
        <SidebarInset>
            <main className="w-full ">
                <SidebarTrigger className="m-4" />
                {songs.length === 0 ? <p>nothing inside songs</p> : 
                songs.map((song, index) => (
                    <MusicCard key={index}
                    songName={song.track_name}
                    artistName={song.artist_name}
                    albumName={song.album_name}
                    imageUrl="" />
                ))}
                <form onSubmit={handleSubmit}>
                <div className="w-7/10 text-center mt-60 ml-70">
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
