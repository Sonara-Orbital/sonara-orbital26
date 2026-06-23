import joblib, os, dotenv, json
import pandas as pd
from sklearn.neighbors import NearestNeighbors
from supabase import create_client, Client
from fastapi import FastAPI
import numpy as np

dotenv.load_dotenv()

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
        supabase.table("Song_Vectors")
        .select("id")
        .order("id").range(start, end)
        .execute().data
    )

    batch_v = (
        supabase.table("Song_Vectors")
        .select("embedding")
        .order("id").range(start, end)
        .execute().data
    )

    if not batch_v:
        break

    song_idxs.extend(batch_id)
    vectors.extend(batch_v)
    print(f"Loaded rows {start} to {end}")
    start += PAGE_SIZE

training_vectors = []
for dict in vectors:
    v = dict["embedding"]
    v = np.array(json.loads(v))
    training_vectors.append(v)

nn_model = NearestNeighbors(metric='cosine', algorithm='auto')
training_vectors = np.stack(training_vectors)
print(training_vectors.shape)
print(type(training_vectors))
nn_model.fit(training_vectors)

joblib.dump(
    {"model": nn_model,
    "ids": song_idxs,
    "vectors": vectors },
    "knn_model_joblib"
)




