from supabase import create_client, Client
from fastapi import FastAPI
from dotenv import load_dotenv
import os
import numpy as np
from sklearn.neighbors import NearestNeighbors
import json
import ast

load_dotenv()

app = FastAPI()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

PAGE_SIZE = 1000 

start = 0
vectors = []
song_idxs = []

while True:
    end = start + PAGE_SIZE - 1
    batch_id = (
        supabase.table("song_vectors")
        .select("track_id")
        .order("track_id").range(start, end)
        .execute().data
    )

    batch_v = (
        supabase.table("song_vectors")
        .select("embedding")
        .order("track_id").range(start, end)
        .execute().data
    )

    if not batch_v:
        break

    song_idxs.extend(batch_id)
    vectors.extend(batch_v)
    print(f"Loaded rows {start} to {end}")
    start += PAGE_SIZE

print(f"vectors - {len(vectors)}")
print(f"idxs - {len(song_idxs)}")

training_vectors = []
for dict in vectors:
    training_vectors.append(json.loads(dict["embedding"]))

nn_model = NearestNeighbors(metric='cosine', algorithm='auto')
nn_model.fit(training_vectors)

def recommender(song_name: str) -> list[str]:
    song = supabase.table("Songs").select("track_id").ilike("track_name", song_name).execute().data
    if not song:
        results = ["no song found"]
        return results
    song_id = song[0]
    idx = song_idxs.index(song_id)
    vector = np.array(ast.literal_eval(vectors[idx]["embedding"])).reshape(1, -1)

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
        song_results.append(supabase.table("Songs").select("track_name").eq("track_id", id["track_id"]).execute().data)
    
    return song_results


#print(recommender("drag me down"))
print(recommender("practice phone"))

