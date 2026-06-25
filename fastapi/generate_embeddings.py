from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
from supabase import create_client, Client
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

FEATURES = [
    "danceability",
    "energy",
    "loudness",
    "instrumentalness",
    "tempo",
]
PAGE_SIZE = 1000

def min_max_scale(value: float, min_value: float, max_value: float) -> float:
    if max_value == min_value:
        return 0.0
    return (value - min_value) / (max_value - min_value)


tracks = (
    supabase.table("Songs")
    .select("track_id," + ",".join(FEATURES))
    .execute()
    .data
)

def make_vector(track: dict) -> list[float]:
    return [
        float(track["danceability"]),
        float(track["energy"]),
        min_max_scale(float(track["loudness"]), loudness_min, loudness_max),
        float(track["instrumentalness"]),
        min_max_scale(float(track["tempo"]), loudness_min, loudness_max),
    ]

start = 0
all_rows = []

while True:
    end = start + PAGE_SIZE - 1
    batch = (
        supabase.table("Songs")
        .select("track_id," + ",".join(FEATURES))
        .order("track_id").range(start, end)
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

rows_to_insert = []
for track in all_rows:
    rows_to_insert.append({
        "track_id": track["track_id"],
        "embedding": make_vector(track),
        "model": "audio_feature_v1",
    })

    if len(rows_to_insert) == PAGE_SIZE:
        supabase.table("song_vectors").upsert(rows_to_insert).execute()
        print(f"Upserted {len(rows_to_insert)} embdeerings")
        rows_to_insert = []

if rows_to_insert:
    supabase.table("song_vectors").upsert(rows_to_insert).execute()
    print(f"Upserted final {len(rows_to_insert)} rows")

