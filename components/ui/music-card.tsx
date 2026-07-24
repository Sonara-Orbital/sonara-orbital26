import { Card, CardDescription, CardTitle, CardContent } from "@/components/ui/card";
import { useState } from "react";

interface MusicCardProps {
    songName: string,
    albumName: string,
    artistName: string,
    imageUrl: string,
    className?: string,
}

export function MusicCard({ songName, albumName, artistName, imageUrl, className }: MusicCardProps) {
    const upscaledImage = imageUrl ? imageUrl.replace("100x100", "600x600") : "/fallbackImage.svg";
    const [imgSrc, setImgSrc] = useState(upscaledImage);

    return (
        <Card className={`relative mx-auto my-5 ml-30 w-full max-w-sm shadow ${className}`}>
                <img 
                    src={imgSrc}
                    alt="Album Cover not Available"
                    className="relative z-20 aspect-square object-cover h-full w-full"
                    onError={() => setImgSrc("/fallbackImage.svg")}
                />

                {/* Song and artist name */}
                <div className="flex flex-col gap-1.5">
                    <CardTitle className="pl-4 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 truncate">{songName}</CardTitle>
                    {/* Artist name */}
                    <div className="pt-2 pb-2 flex pl-5 gap-1.5 items-baseline">
                        <span className="text-neutral-500">by </span>
                        <div className="text-base font-semibold text-neutral-700 truncate">{artistName}</div>
                    </div>
                    {/* <div className="pl-6 text-sm font-normal text-neutral-500 truncate">{albumName}</div> */}
                </div>
        </Card>
    )
}