"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function getUserBlacklist() {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login")
    }
    
    const {data: allSeenSongs, error} = await supabase.from("Users")
        .select("seen_songs")
        .eq("id", user.id)
        .single();
        
    if (error) {
        console.error("Error fetching initial songs from db");
        return;
    }
    
    const res = allSeenSongs?.seen_songs ?? [];
    return res;
}