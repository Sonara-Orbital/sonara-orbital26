"use client"


// Uses song id to export song to spotify 

export function SpotifyExportButton({ songId, className="" }: { songId: string; className?: string }) {
    const spotifyLink = `https://open.spotify.com/track/${songId}`;

    return <a
        href={spotifyLink}
        target="_blank"
        rel="noopener noreferrer"
        className={`p-2 ${className}`}
    >
        Export to Spotify
    </a>
}