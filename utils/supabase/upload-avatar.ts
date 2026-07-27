// utils/supabase/upload-avatar.ts
"use client";

import { createClient } from "@/utils/supabase/client"; // your browser client helper

export async function uploadAvatar(userId: string, file: File) {
    const supabase = createClient();

    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

    if (uploadError) {
        return { success: false, error: uploadError.message };
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

    return { success: true, url: data.publicUrl };
}