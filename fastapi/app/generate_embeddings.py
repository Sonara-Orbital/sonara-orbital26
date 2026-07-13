from fastapi import FastAPI
import joblib, os, json
from sklearn.neighbors import NearestNeighbors
from supabase import create_client, Client
from fastapi import FastAPI
import numpy as np
from supabase import create_client, Client
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
print(SUPABASE_URL)
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
print(SUPABASE_SERVICE_ROLE_KEY)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

FEATURES = [
    "danceability",
    "energy",
    "loudness",
    "acousticness",
    "instrumentalness",
    "valence",
    "tempo",
]

PAGE_SIZE = 1000

def min_max_scale(value: float, min_value: float, max_value: float) -> float:
    if max_value == min_value:
        return 0.0
    return (value - min_value) / (max_value - min_value)

tracks = (
    supabase.table("Songs")
    .select("id," + ",".join(FEATURES))
    .execute()
    .data
)

def make_vector(track) -> list[float]:
    return [
        float(track["danceability"]),
        float(track["energy"]),
        min_max_scale(float(track["loudness"]), loudness_min, loudness_max),
        float(track["acousticness"]),
        float(track["instrumentalness"]),
        float(track["valence"]),
        min_max_scale(float(track["tempo"]), loudness_min, loudness_max),
    ]

start = 0
all_rows = []

while True:
    end = start + PAGE_SIZE - 1
    batch = (
        supabase.table("Songs")
        .select("id," + ",".join(FEATURES))
        .order("id").range(start, end)
        .execute().data
    )

    if not batch:
        break

    all_rows.extend(batch)
    print(f"Loaded rows {start} to {end}")
    start += PAGE_SIZE

tempo_values = [float(track["tempo"]) for track in tracks if track["tempo"] is not None]
loudness_values = [float(track["loudness"]) for track in tracks if track["loudness"] is not None]

tempo_min = min(tempo_values)
tempo_max = max(tempo_values)
loudness_min = min(loudness_values)
loudness_max = max(loudness_values)

ids = []
vectors = []
for track in all_rows:
    ids.append(track["id"])
    vectors.append(np.array(make_vector(track)))

nn_model = NearestNeighbors(metric='cosine', algorithm='auto')
training_vectors = np.stack(vectors)
print(training_vectors.shape)
print(type(training_vectors))
nn_model.fit(training_vectors)

joblib.dump(
    {"model": nn_model,
    "ids": ids,
    "vectors": training_vectors},
    "knn_model_joblib"
)


#    if len(rows_to_insert) == PAGE_SIZE:
#        supabase.table("Song_Vectors").upsert(rows_to_insert).execute()
#        print(f"Upserted {len(rows_to_insert)} embeddings")
#        rows_to_insert = []

#if rows_to_insert:
#    supabase.table("Song_Vectors").upsert(rows_to_insert).execute()
#    print(f"Upserted final {len(rows_to_insert)} rows")