"use client"


// Uses song id to export song to spotify 

const SpotifyExportButton = (songId: string) => {
    const spotifyLink = `https://open.spotify.com/track/${songId}`;

    return <a
        href={spotifyLink}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
    >
        Export to Spotify
    </a>
}