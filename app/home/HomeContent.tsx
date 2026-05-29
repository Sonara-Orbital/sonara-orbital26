"use client";

import { useState } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function HomeContent() {
    const supabase = createClient();

    const [collapsedBar, setCollapsedBar] = useState(false);
    const [collapsedMenu, setCollapsedMenu] = useState(false);

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
                        <a href="/profile">{collapsedBar ? "●" : "Placeholder"}</a>
                        <a href="/profile">{collapsedBar ? "●" : "Placeholder"}</a>
                    </nav>
                </div>
            </aside>

            <main className={styles.main}>
                <h1>Main Content!</h1>
            </main>
        </div>
    )
}
