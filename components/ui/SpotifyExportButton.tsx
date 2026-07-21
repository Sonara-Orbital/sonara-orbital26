"use client"
import { ExternalLink } from "lucide-react";


// Uses song id to export song to spotify 

export function SpotifyExportButton({ songId, className="" }: { songId: string; className?: string }) {
    const spotifyLink = `https://open.spotify.com/track/${songId}`;
    console.log("ID is", songId);
    console.log("SPOTIFY LINK IS", spotifyLink);

    return <a
        href={spotifyLink}
        target="_blank"
        rel="noopener noreferrer"
        className={`${className}`}
    >
        <ExternalLink className="h-5 w-5" />
    </a>
}