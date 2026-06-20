"use client";

import { useState } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import React from "react";

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
                        <Link href="/profile"><button>{collapsedBar ? "●" : "Song Discovery"}</button></Link>
                        <a href="/song_library">{collapsedBar ? "●" : "Song Library"}</a>
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
}
