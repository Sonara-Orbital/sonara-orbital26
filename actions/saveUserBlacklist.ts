"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function saveUserBlacklist(songIds: string[]) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !songIds?.length) {
    return;
  }

  const uniqueSongIds = [...new Set(songIds)];

  const { error } = await supabase.from("user_seen_history").upsert(
    uniqueSongIds.map((songId) => ({
      user_id: user.id,
      song_id: songId,
    })),
    { onConflict: "user_id,song_id" }
  );

  if (error) {
    console.error("Failed to save user blacklist", error);
  }
}
