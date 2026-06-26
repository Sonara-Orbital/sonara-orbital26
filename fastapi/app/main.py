from supabase import create_client, Client
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import numpy as np
from sklearn.neighbors import NearestNeighbors
import json, ast, os, joblib, spotipy
import musicbrainzngs as mbn
import zstandard as zstd
from spotipy.oauth2 import SpotifyClientCredentials

load_dotenv(dotenv_path=".env.local")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DataInput(BaseModel):
    songName: str
    artistName: str

auth_manager = SpotifyClientCredentials()
sp = spotipy.Spotify(auth_manager=auth_manager)

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

bundle = joblib.load("knn_model_joblib")
nn_model = bundle["model"]
song_idxs = bundle["ids"]
vectors = bundle["vectors"]

def recommender(song_name: str, artist_name="") -> list[str]:
    if (artist_name==""):
        song = supabase.table("Songs").select("id").ilike("track_name", song_name).execute().data
    else:
        song = supabase.table("Songs").select("id").ilike("artist_name", artist_name).ilike("track_name", song_name).execute().data

    if not song:
        results = ["no song found"]
        return results
    
    
    song_id = song[0]
    idx = supabase.table("Song_Vectors").select("embedding").eq("id", song_id["id"]).execute().data
    vector = np.array(json.loads(idx[0]["embedding"])).reshape(1, -1)

    distances, indices = nn_model.kneighbors(vector, 6)

    distances = distances.flatten()
    indices = indices.flatten()

    #print(distances)
    #print(indices)

    results = []
    for i in indices:
        results.append(song_idxs[i])
    
    #print(results)
    #print("===========================================")
    results.pop(0)

    song_results = []
    for id in results:
        record = supabase.table("Songs").select("track_name").eq("id", id).execute().data[0]
        song_name = record["track_name"]
        print(song_name)
        song_results.append(song_name)
    
    #print(song_results)
    
    return song_results


#print(recommender("radioactive", "Imagine Dragons"))

@app.post("/api/process")
async def recommend_song(inputData: DataInput):
    result = recommender(inputData.songName, inputData.artistName)
    return {"status": "success", "data": result}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

