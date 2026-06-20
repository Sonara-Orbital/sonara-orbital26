// Song interface stores information of a song
export interface GeneratedSong {
    id: string;  // Song id
    title: string;
    artist: string;
    duration: string;
    bpm: number | null;
    genre: string | null;
    prompt: string | null;  // Prompt used to generate this song recommendation or null if no prompt used
    album_art_url: string | null;
}