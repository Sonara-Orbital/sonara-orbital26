# app/spotify.py
import os
import base64
import httpx
from dotenv import load_dotenv

load_dotenv()

CLIENT_ID = os.getenv("SPOTIPY_CLIENT_ID")
CLIENT_SECRET = os.getenv("SPOTIPY_CLIENT_SECRET")
REFRESH_TOKEN = os.getenv("SPOTIPY_REFRESH_TOKEN")  

async def get_spotify_access_token() -> str:
    """Exchanges your saved refresh token for a fresh user access token."""
    url = "https://accounts.spotify.com/api/token"
    
    auth_bytes = f"{CLIENT_ID}:{CLIENT_SECRET}".encode("utf-8")
    auth_header = base64.b64encode(auth_bytes).decode("utf-8")

    headers = {
        "Authorization": f"Basic {auth_header}",
        "Content-Type": "application/x-www-form-urlencoded",
    }
    
    payload = {
        "grant_type": "refresh_token",
        "refresh_token": REFRESH_TOKEN,
    }

    async with httpx.AsyncClient() as client:
        res = await client.post(url, headers=headers, data=payload)
        
        if res.status_code != 200:
            raise Exception(f"Failed to refresh user token: {res.text}")
            
        data = res.json()
        return data["access_token"]