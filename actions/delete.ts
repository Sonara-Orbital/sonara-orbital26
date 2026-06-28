"use server";

// Delete song from library with song uuid in library (not songid)

import { createClient } from "@/utils/supabase/server"; // Adjust this path to match your Supabase server client helper
import { GeneratedSong } from "@/types/song"; // Adjust this path to match your interface file
import { revalidatePath } from "next/cache";
import { cookies } from  "next/headers"
import { SupabaseClient } from "@supabase/supabase-js";

export async function deleteSong(librarySongid: string) {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const { data: { user: currUser }, error: authError} = await supabase.auth.getUser();
    if (authError || !currUser) {
        return { sucess: false, error: "Unauthorised access"};
    }

    const { error: dbError } = await supabase
        .from("User_saved_songs")
        .delete()
        .eq("user_id", currUser.id)
        .eq("id", librarySongid);
    if (dbError) {
        return { sucess: false, error: "Unable to delete song"};
    }

    revalidatePath("/song-library")
    return { sucess: true }
}