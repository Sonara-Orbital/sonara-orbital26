"use client"
import { ExternalLink } from "lucide-react";
import { FaSpotify } from "react-icons/fa";


// Uses song id to export song to spotify 
// iconSize input is a string "h-x w-y", x and y are horizontal and vertical dimensions
export function SpotifyExportButton({ songId, className="", iconSize }: { songId: string; className?: string; iconSize: string }) {
    const spotifyLink = `https://open.spotify.com/track/${songId}`;
    console.log("ID is", songId);
    console.log("SPOTIFY LINK IS", spotifyLink);

    return <a
        href={spotifyLink}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-block transition-transform duration-100 ${className}`}
    >
        {/* <ExternalLink className={iconSize} /> */}
        <FaSpotify className={iconSize} />

    </a>
}