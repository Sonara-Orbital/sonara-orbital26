"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function getUserBlacklist() {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return [];
    }

    const { data, error } = await supabase
        .from("user_seen_history")
        .select("song_id")
        .eq("user_id", user.id);

    if (error) {
        console.error("Error fetching initial songs from db", error);
        return [];
    }

    return (data ?? []).map((row) => row.song_id);
}