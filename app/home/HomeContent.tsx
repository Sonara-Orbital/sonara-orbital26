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
                <button className={styles.toggle} onClick={() => {
                        setCollapsedBar(!collapsedBar);
                        console.log("collapse");
                        }}>
                    {collapsedBar ? ">" : "<"}
                </button>

                <nav className={styles.nav}>
                <Link href="/profile"><button>Profile</button></Link>
                    <a>Button</a>
                    <a>Home</a>
                </nav>
            </aside>

            <main className={styles.main}>
                <h1>Main Content</h1>
            </main>
        </div>
    )
}
