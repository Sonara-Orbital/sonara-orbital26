"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import React from "react";
import { HomeSidebar } from "@/components/ui/home-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { ButtonGroup } from "@/components/ui/button-group";
import { POST } from "@/app/api/chat/route"

interface HomeContentProps {
    userMetadata: any;
    children: React.ReactNode;
}

export default function HomeContent({ userMetadata, children }: HomeContentProps) {
    const supabase = createClient();

    const [collapsedBar, setCollapsedBar] = useState(false);
    const [collapsedMenu, setCollapsedMenu] = useState(false);

    const [profileOpen, setProfileOpen] = useState(false);
    const toggleProfile = () => setProfileOpen(!profileOpen);

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
            console.log(songData);



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
                        <a href="/profile">{collapsedBar ? "⍜" : "Profile"}</a>
                        <Link href="/profile"><button>{collapsedBar ? "●" : "Placeholder"}</button></Link>
                        <a href="/profile">{collapsedBar ? "●" : "Placeholder"}</a>
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
            </main>
        </div>
    )
    */
   return (
    <SidebarProvider>
        <HomeSidebar />
        <main className="w-full ">
            <SidebarTrigger className="m-4" />
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
    </SidebarProvider>
   )
}
