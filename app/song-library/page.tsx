// server 
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import SongList from "@/app/song-library/song-list";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  // Logout if not signed in
  if (!user) {
    redirect("/login");
  }

  // Get user's songs
  const { data: currUserSongs, error: dbError } = await supabase
    .from("User_saved_songs")
    .select("*")
    .eq("user_id", user.id);

  console.log("here", currUserSongs);

  if (dbError) {
    console.error("❌ Failed to load library data:", dbError);
    return (
      <div className="p-8 text-red-500">
        <h2>Error loading your library</h2>
        <p>{dbError.message}</p>
      </div>
    );
  }

  return (
    <main className="w-full mx-auto max-w-5xl p-8 flex flex-col items-center">
      <SongList currUserSongs={currUserSongs || []} />
    </main>
  );
}
