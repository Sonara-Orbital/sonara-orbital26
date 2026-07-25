import re
import httpx
from typing import List, Dict
from dotenv import load_dotenv
from spotify_token import get_spotify_access_token

load_dotenv()


async def extract_tracks_from_playlist(playlist_url: str) -> List[Dict[str, str]]:
    tracks = []
    
    if "spotify.com" in playlist_url:
        print("here")
        match = re.search(r"playlist/([a-zA-Z0-9]+)", playlist_url)
        if not match:
            raise ValueError("Invalid Spotify Playlist URL")
        
        playlist_id = match.group(1)
        print(playlist_id)
        tracks = await fetch_spotify_tracks(playlist_id)
        
    #elif "apple.com" in playlist_url:
        #match = re.search(r"pl\.[a-zA-Z0-9]+", playlist_url)
        #if not match:
        #    raise ValueError("Invalid Apple Music Playlist URL")
            
        #playlist_id = match.group(0)
        #tracks = await fetch_apple_music_tracks(playlist_id)
        
    else:
        raise ValueError("Unsupported provider")
        
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
                
                if track and track.get("name") and track.get("artists"):
                    extracted.append({
                        "title": track["name"],
                        "artist": track["artists"][0]["name"]
                    })
                    
            return extracted

        except Exception as e:
            print(f"Error fetching Spotify tracks: {repr(e)}")
            return []

