"use client";

import { useState } from "react";
import styles from "./page.module.css";
import { useTransition } from "react";
import { signOutAction } from "../auth/actions";
import { HomeSidebar } from "@/components/ui/home-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

interface ProfileContentProps {
    userProfile: any,
    children: React.ReactNode,
}

export default function ProfileContent({ userProfile, children}: ProfileContentProps) {

    const [ cardOpen, setCardOpen ] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleSignOut = () => {
        startTransition(async () => {
            await signOutAction();
        })
    }

    const joinDate = new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    }).format(new Date(userProfile.created_at));

    console.log(userProfile.username + "hello1" + joinDate + userProfile.display_name);

    return (
        <SidebarProvider>
            <HomeSidebar />
                <SidebarInset>
                    <div className={styles.page}>
                        <SidebarTrigger className="m-4" />
                        <div className={styles.leftContainer}>
                            <div className={styles.titleCard}> 
                                <div className={styles.profileRing}>
                                    <img src = {userProfile.avatar_url} className={styles.profilePic}/>
                                </div>
                                <h1 className={styles.userName}>{userProfile.username}</h1>
                                <div className={styles.titleButtonBoxOuter}>
                                    <div className={styles.titleButtonBoxInner}>
                                        <a href="/home" className={styles.TitleButton}>Home</a>
                                        <button onClick={handleSignOut} disabled={isPending} className={styles.TitleButton}>Log Out</button>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.contentCard}></div>
                        </div>
                        <div className={styles.rightContainer}>
                            <div className={styles.sideCard}></div>
                        </div>
                    </div>
                </SidebarInset>
        </SidebarProvider>
    )

}