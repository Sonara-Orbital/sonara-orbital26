"use client";

import { useState } from "react";
import styles from "./page.module.css";
import { useTransition } from "react";
import { signOutAction } from "../auth/actions";

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
        <div className={styles.page}>
            <div className={styles.leftContainer}>
                <div className={styles.titleCard}> 
                    <div className={styles.profileRing}>
                        <img src = {userProfile.avatar_url} className={styles.profilePic}/>
                    </div>
                    <h1 className={`${styles.userName} font-semibold `}>{userProfile.username}</h1>
                    <div className={styles.titleButtonBoxOuter}>
                        <div className={styles.titleButtonBoxInner}>
                            <a href="/home" className="bg-[#3B5CCC] hover:bg-[#2f4da8] flex items-center font-semibold text-[#F8FAFC] transition hover:bg-[#2f4da8] rounded-lg bg-[#3B5CCC] px-7 py-3 text-white py-2 px-4 mt-4 mb-3 flex justify-center">Home</a>
                            <button onClick={handleSignOut} disabled={isPending} 
                                className="bg-[#3B5CCC] hover:bg-[#2f4da8] flex items-center font-semibold text-[#F8FAFC] transition hover:bg-[#2f4da8] rounded-lg bg-[#3B5CCC] px-7 py-3 text-white py-2 px-4 mt-4 mb-3 flex justify-center">
                                    Sign Out
                            </button>
                        </div>
                    </div>
                </div>
                <div className={styles.contentCard}></div>
            </div>
            <div className={styles.rightContainer}>
                <div className={styles.sideCard}></div>
            </div>


        </div>
    )

}