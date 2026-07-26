import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const body = await request.json();
    const query = body.userInput;

    if (!query) return NextResponse.json({ error: "No Query Found"}, {status: 400});
    
    const cleanQuery = query.replace(/\s+(by|-)\s+/gi, ' ').trim();

    try {
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=musicTrack&limit=1`);
        if (!res.ok) {throw new Error(`itunes error: ${res.status}`)}
        const data = await res.json();
        if (!query || typeof query !== "string" || !query.trim()) {
            return NextResponse.json({ error: "No valid query provided" }, { status: 400 });
        }

        if (data.results && data.results.length > 0) {
            const track = data.results[0];
            return NextResponse.json({
                track_name: track.trackName,
                artist_name: track.artistName,
                album_name: track.collectionName,
                album_image: track.artworkUrl100,
                track_preview: track.previewUrl,
            });
        }

        return NextResponse.json({songName: query, artistName: null});
    } catch (e) {
        return NextResponse.json({songName: query, artistName: null, error: e instanceof Error ? e.message : String(e) }, {status: 500});
    }
}