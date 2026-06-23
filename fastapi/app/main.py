from supabase import create_client, Client
from fastapi import FastAPI
from dotenv import load_dotenv
import numpy as np
from sklearn.neighbors import NearestNeighbors
import json, ast, os, joblib
import musicbrainzngs as mbn
import zstandard as zstd

load_dotenv()

app = FastAPI()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

bundle = joblib.load("knn_model_joblib")
nn_model = bundle["model"]
song_idxs = bundle["ids"]
vectors = bundle["vectors"]

def recommender(song_name: str) -> list[str]:
    song = supabase.table("Songs").select("id").ilike("track_name", song_name).execute().data
    if not song:
        results = ["no song found"]
        return results
    song_id = song[0]
    idx = song_idxs.index(song_id)
    vector = np.array(json.loads(vectors[idx]["embedding"])).reshape(1, -1)

    distances, indices = nn_model.kneighbors(vector, 6)
    print(distances)
    print(indices)
    

    distances = distances.flatten()
    indices = indices.flatten()

    print(distances)
    print(indices)

    results = []
    for i in indices:
        results.append(song_idxs[i])
    
    print(results)

    song_results = []
    for id in results:
        song_results.append((supabase.table("Songs").select("track_name").eq("id", id["id"]).execute().data)[0]["track_name"])
    
    return song_results


#print(recommender("drag me down"))
print(recommender("Illuminate"))

