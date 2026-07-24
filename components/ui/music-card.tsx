import { Card, CardDescription, CardTitle, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { SpotifyExportButton } from "@/components/ui/SpotifyExportButton";
import { AddToLibraryButton } from "@/components/ui/AddToLibraryButton";

interface MusicCardProps {
    songName: string,
    albumName: string,
    artistName: string,
    imageUrl: string,
    className?: string,
    songId: string
    isAdded: boolean
    buttonSize: number
}

export function MusicCard({ songName, albumName, artistName, imageUrl, className, songId, isAdded, buttonSize }: MusicCardProps) {
    const upscaledImage = imageUrl ? imageUrl.replace("100x100", "600x600") : "/fallbackImage.svg";
    const [imgSrc, setImgSrc] = useState(upscaledImage);

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
                    <AddToLibraryButton isAdded={isAdded} actionOnAdd={()=>{}} />
                </div>

                {/* Text content */}
                <div className="flex flex-col gap-2 pr-8 min-w-0 -translate-y-6">
                    <a 
                        href={`https://open.spotify.com/track/${songId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full min-w-0"
                    >
                        {/* SONG NAME */}
                        <div className="cursor-pointer hover:underline decoration-2 text-3xl font-bold tracking-tight text-neutral-900 truncate">
                            {songName}
                        </div>
                    </a>

                    {/* ARTIST NAME */}
                    <div className="flex items-baseline gap-1.5 min-w-0 pl-1">
                        <span className="text-neutral-500 shrink-0 text-sm">by</span>
                        <p className="text-sm font-semibold text-neutral-700 truncate">
                            {artistName}
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    )
}