import re
import httpx
from typing import List, Dict
from dotenv import load_dotenv
from spotify_token import get_spotify_access_token
import asyncio
from custom_vector import extract_features, get_song_url
import uuid
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import supabase

load_dotenv()

app = FastAPI()

class PlaylistInput(BaseModel):
    user_id: str
    playlist_url: str

async def extract_tracks_from_playlist(playlist_url: str, user_id: str) -> List[Dict[str, str]]:
    tracks = []
    
    if "spotify.com" in playlist_url:
        match = re.search(r"playlist/([a-zA-Z0-9]+)", playlist_url)
        if not match:
            raise ValueError("Invalid Spotify Playlist URL")
        
        playlist_id = match.group(1)
        tracks = await fetch_spotify_tracks(playlist_id)
        
    #elif "apple.com" in playlist_url:
        #match = re.search(r"pl\.[a-zA-Z0-9]+", playlist_url)
        #if not match:
        #    raise ValueError("Invalid Apple Music Playlist URL")
            
        #playlist_id = match.group(0)
        #tracks = await fetch_apple_music_tracks(playlist_id)
        
    else:
        raise ValueError("Unsupported provider")

    vector_tracks = []
    for track in tracks:

        track["song_id"] = track["id"]
        track.pop("id")
        track["user_id"] = user_id

    #response1 = supabase.table("Song_Vectors").upsert(vector_tracks, ignore_duplicates=True).execute()
    response2 = supabase.table("User_saved_songs").upsert(tracks, ignore_duplicates=True).execute()

    return tracks

async def fetch_spotify_tracks(playlist_id: str) -> List[Dict[str, str]]:
    SPOTIFY_ACCESS_TOKEN = await get_spotify_access_token()

    async with httpx.AsyncClient() as client:
        try: 
            headers = {"Authorization": f"Bearer {SPOTIFY_ACCESS_TOKEN}"}
            res = await client.get(
                f"https://api.spotify.com/v1/playlists/{playlist_id}/items", 
                headers=headers
            )
            
            if res.status_code != 200:
                print(f"Spotify API Error ({res.status_code}): {res.text}")
                return []

            data = res.json()
            items = data.get("items") or []
            
            extracted = []
            for item in items:
                track = item.get("item") if isinstance(item, dict) else None
                
                if track and track.get("id") and track.get("name") and track.get("artists"):
                    extracted.append({
                        "id": track["id"],
                        "title": track["name"],
                        "artist": track["artists"][0]["name"],
                        "duration": track["duration_ms"]
                    })
                    
            return extracted

        except Exception as e:
            print(f"Error fetching Spotify tracks: {repr(e)}")
            return []

#print(asyncio.run(extract_tracks_from_playlist("https://open.spotify.com/playlist/5Zvp8pfl3jdGelql3KByj1?si=49c9123cb7f84259", "21e4c7f7-7707-4095-8352-18712e6481da")))

@app.post("/api/add-playlist")
async def recommend_song_scroller(inputData: PlaylistInput):
    user_id = inputData.user_id
    url = inputData.playlist_url
    await extract_tracks_from_playlist(url, user_id)

