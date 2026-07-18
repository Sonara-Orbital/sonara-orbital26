"use client";

import { useState } from "react";
import styles from "./page.module.css";
import { useTransition } from "react";
import { signOutAction } from "../auth/actions";
import { HomeSidebar } from "@/components/ui/home-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { FriendsCard } from "@/components/ui/friends-card";
import { addFriend } from "../auth/actions";

interface ProfileContentProps {
    userProfile: any,
    children: React.ReactNode,
    friendsList: any,
    requestsList: any,
}

function addAFriend(username: string) {
    addFriend(username)
}

export default function ProfileContent({ userProfile, friendsList, requestsList, children}: ProfileContentProps) {

    const [ cardOpen, setCardOpen ] = useState(false);
    const [isPending, startTransition] = useTransition();


    const username = userProfile.username
    const userId = userProfile.id
    console.log(userProfile)

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

    return (
        <SidebarProvider>
            <HomeSidebar username={username} />
                <SidebarInset>
                    <div className="flex flex-row w-full">
                        <div className="w-[70%]">
                            <p>Other Stuff</p>
                        </div>
                        <div className="w-[30%] h-full p-5">
                            <FriendsCard userId={userId} requestsList={requestsList} onClick={addAFriend} friendsList={friendsList}/>
                        </div>
                    </div>
                </SidebarInset>
        </SidebarProvider>
    )

}