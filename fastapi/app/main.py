from supabase import create_client, Client
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
from sklearn.neighbors import NearestNeighbors
import json, ast, os, joblib, spotipy
import musicbrainzngs as mbn
import zstandard as zstd
from spotipy.oauth2 import SpotifyClientCredentials
from app.mood_recommender import router as recommend_router
from app.database import supabase  # Client created in database.py
from fastapi import HTTPException
from app.custom_vector import extract_features, get_song_url
import uuid

app = FastAPI()


origins = [
    "http://localhost:3000", 
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(recommend_router, prefix="/api")

class DataInput(BaseModel):
    songName: str
    artistName: str

try:
    auth_manager = SpotifyClientCredentials()
    sp = spotipy.Spotify(auth_manager=auth_manager)
except Exception as exc:
    sp = None
    print(f"Skipped spotify client: {exc}")

bundle = joblib.load("knn_model_joblib")
nn_model = bundle["model"]
song_idxs = bundle["ids"]
vectors = bundle["vectors"]


# MAIN MATH LOGIC returns array of neighbour song_id's, return limit number of recommendations

def get_raw_neighbours(song_id: str, limit: int, blackListedSongIds: list[str]) -> list[str]:
    idx = supabase.table("Song_Vectors").select("embeddings").eq("id", song_id)\
        .not_.in_("id", blackListedSongIds)\
        .execute().data
    
    if not idx:
        return []
    
    vector = np.array(json.loads(idx[0]["embeddings"])).reshape(1, -1)

    distances, indices = nn_model.kneighbors(vector, limit + 1)

    distances = distances.flatten()
    indices = indices.flatten()

    raw_ids = [song_idxs[i] for i in indices if song_idxs[i] != song_id]
    print("done")
    return raw_ids

def get_neighbours_by_vector(song_vector: list) -> list[str]:
    vector = np.array(song_vector).reshape(1, -1)

    distances, indices = nn_model.kneighbors(vector, 5)

    distances = distances.flatten()
    indices = indices.flatten()

    raw_ids = [song_idxs[i] for i in indices]
    print("done")
    return raw_ids


# MAIN RECOMMENDER FUNCTION #
def recommender(song_name: str, artist_name="") -> list[str]:
    if (artist_name==""):
        song = supabase.table("Songs").select("id").ilike("track_name", song_name).execute().data
    else:
        song = supabase.table("Songs").select("id").ilike("artist_name", artist_name).ilike("track_name", song_name).execute().data

    if not song:
        song_url = get_song_url(song_name, artist_name)
        id = str(uuid.uuid4())
        vec = extract_features(song_url, id)
        results = get_neighbours_by_vector(vec)
    else:
        song_id = song[0]["id"]
        results = get_raw_neighbours(song_id, 5, [])

    
    #print(distances)
    #print(indices)
    
    #print(results)
    #print("===========================================")
    # song_results = []
    # for id in results:
    #     record = supabase.table("Songs").select("track_name").eq("id", id).execute().data[0]
    #     song_name = record["track_name"]
    #     print(song_name)
    #     song_results.append(song_name)

    records = supabase.table("Songs").select("track_name", "artist_name").in_("id", results).execute().data
    song_results = [record["track_name"] for record in records]
    
    #print(song_results)
    
    return song_results
#print(recommender("radioactive", "Imagine Dragons"))

@app.post("/api/process")
async def recommend_song(inputData: DataInput):
    result = recommender(inputData.songName, inputData.artistName)
    return {"status": "success", "data": result}




############################################################
# SCROLLER RECOMMENDER LOGIC #




# Scroller pool recommndation logic ... returns list of song_id's
def get_raw_neighbours_from_pool(seed_song_ids: list[str], limit: int, blackListedSongIds: list[str]) -> list[str]:
    # 1. Get embeddings for the input pool of songs
    records = supabase.table("Song_Vectors").select("id", "embeddings")\
        .not_.in_("id", blackListedSongIds).in_("id", seed_song_ids).execute().data
    if not records:
        print("NOT RECORDS")
        return []
    
    # 2. Put embedding into numpy arrray
    vectors = [np.array(json.loads(r["embeddings"])) for r in records]
    
    # 3. Create average vector
    composite_vector = np.mean(vectors, axis=0).reshape(1, -1)

    # 4. Run knn on average vector
    distances, indices = nn_model.kneighbors(composite_vector, limit + len(seed_song_ids))
    indices = indices.flatten()

    # 5. Filter out 5 initial songs from the raw results
    raw_ids = [song_idxs[i] for i in indices if song_idxs[i] not in seed_song_ids]
    print("RAW", raw_ids)
    return raw_ids[:limit]


class SimpleSong(BaseModel):
    song_id: str
    title: str
    artist: str

### SCROLLER RECOMMENDER recommends songs excluding seen and library songs, return list of SimpleSong's
def scroller_recommender(user_id: str, blackListIds: list[str]) -> list[SimpleSong]:
    # Get last 5 added songs
    songResponse = supabase.table("User_saved_songs").select("song_id")\
        .eq("user_id", user_id).order("created_at", desc=True).limit(5).execute().data
    last_five_ids = [row["song_id"] for row in songResponse]
    print(last_five_ids, "LAST FIVE")

    seed_id_set = set(last_five_ids)
    blackListedSongIds = [song_id for song_id in (blackListIds or []) if song_id not in seed_id_set]
    blackListedSongIds = list(dict.fromkeys(blackListedSongIds))
    print("BLACKLIST_EXCLUDING_SEEDS", blackListedSongIds)

    ## OPTION 1 GET ALL CANDIDATES AND RANDOMLY SELECT ##
    # song_candidates =[]
    # # Get neighbours of each of the 5 songs
    # for song_id in last_five_ids:
    #     song_candidates.exrend(get_raw_neighbours(song_id, 5))

    ## OPTION 2 GENERATE AVERAGE VECTOR ## 
    # Query 30 neighbours, filter those in blacklist
    raw_ids = get_raw_neighbours_from_pool(last_five_ids, 30, blackListedSongIds)
    resData = supabase.table("Songs").select("id", "track_name", "artist_name")\
        .in_("id", raw_ids).not_.in_("id", blackListedSongIds)\
        .execute().data
    
    # Format and choose the 5 most accurate
    formatted_res = [
        {
            "song_id": generated_song["id"],
            "title": generated_song["track_name"],
            "artist": generated_song["artist_name"]
        } for generated_song in resData[:5]
    ]
    return formatted_res

class scrollerInput(BaseModel):
    user_id: str
    blackListIds: list[str]

@app.post("/api/scroller-pool")
async def recommend_song_scroller(inputData: scrollerInput):
    result = scroller_recommender(inputData.user_id, inputData.blackListIds)
    print("INPUT", inputData.user_id)
    print("RESULT", result)
    return {"status": "success", "data": result}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

