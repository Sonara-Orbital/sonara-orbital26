'client' 

import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { AddToLibraryButton } from "@/components/ui/AddToLibraryButton";
import { addSongFromId } from "@/actions/songs";

interface MusicCardProps {
    songName: string,
    albumName: string,
    artistName: string,
    imageUrl: string,
    className?: string,
    songId: string,
    isAdded: boolean,
    buttonSize: number
}

interface Song {
    track_name: string;
    artist_name: string;
    album_name: string;
    album_image: string;
    track_preview: string;
    spotify_id: string;
}

export function MusicCard({ songName, albumName, artistName, imageUrl, className, songId, isAdded }: MusicCardProps) {
    // 1. Give it a guaranteed initial value so it's never an empty string ""
    const [albumImage, setAlbumImage] = useState(imageUrl || "/fallbackImage.svg");
    const [imgSrc, setImgSrc] = useState(imageUrl ? imageUrl.replace("100x100", "600x600") : "/fallbackImage.svg");

    useEffect(() => {
        async function searchSingleSong() {
            try {
                const response = await fetch("/api/search", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userInput: songName })
                });
                
                if (response.ok) {
                    const data: Song = await response.json();
                    if (data?.album_image) {
                        setAlbumImage(data.album_image);
                        setImgSrc(data.album_image.replace("100x100", "600x600"));
                    }
                }
            } catch (error) {
                console.error("Failed to fetch song details", error);
            }
        }

        searchSingleSong();
    }, [songName]);

    return (
        <Card className={`relative mx-auto my-5 ml-30 w-full max-w-sm shadow ${className} duration-300`}>
            <img 
                src={imgSrc}
                alt="Album Cover not Available"
                className="relative z-20 aspect-square object-cover h-full w-full border-b"
                onError={() => setImgSrc("/fallbackImage.svg")}
            />

            <div className="flex flex-col bg-white dark:bg-neutral-900 p-4 rounded-b-lg relative">
                {/* Add to library button */}
                <div className="absolute -top-1 right-1.5 z-10">
                    <AddToLibraryButton isAdded={isAdded} actionOnAdd={() => addSongFromId(songId)} />
                </div>

                {/* Song info */}
                <div className="flex flex-col gap-3 pr-8 min-w-0 -translate-y-6">
                    <a 
                        href={`https://open.spotify.com/track/${songId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full min-w-0"
                    >
                        <div className="leading-8 cursor-pointer hover:underline decoration-2 text-3xl font-bold tracking-tight text-neutral-900 line-clamp-2"
                            title={songName}>
                            {songName}
                        </div>
                    </a>

                    <div className="flex items-baseline gap-1.5 min-w-0 pl-1 pt-1">
                        <span className="text-neutral-500 shrink-0 text-sm">by</span>
                        <p className="text-sm font-semibold text-neutral-700 truncate">
                            {artistName}
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    );
}