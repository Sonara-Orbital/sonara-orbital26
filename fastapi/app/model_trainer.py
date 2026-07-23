import joblib, os, dotenv, json
import pandas as pd
from sklearn.neighbors import NearestNeighbors
from supabase import create_client, Client
from fastapi import FastAPI
import numpy as np
from app.database import supabase

app = FastAPI()

PAGE_SIZE = 1000 

start = 0
songs = []

while True:
    end = start + PAGE_SIZE - 1
    batch = (
        supabase.table("Song_Vectors")
        .select("id, embedding")
        .order("id").range(start, end)
        .execute().data
    )
    if not batch:
        break

    songs.extend(batch)
    print(f"Loaded rows {start} to {end}")
    start += PAGE_SIZE

ids = []
vectors = []
for dict in songs:
    v = dict["embedding"]
    v = np.array(json.loads(v))
    i = dict["id"]
    ids.append(i)
    vectors.append(v)

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




