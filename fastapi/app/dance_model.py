from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import subprocess, os, uuid, requests, json, librosa
import joblib
import numpy as np
import pandas as pd
from contextlib import asynccontextmanager
from essentia.standard import MonoLoader, TensorflowPredictMusiCNN, TensorflowPredict2D, RhythmExtractor2013, Danceability, LoudnessEBUR128, MusicExtractor, AudioLoader
from supabase import create_client, Client
from dotenv import load_dotenv
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score

load_dotenv()

app = FastAPI()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

PAGE_SIZE = 100

start = 0
tracks = []

while True:
    end = start + PAGE_SIZE - 1
    batch = (
        supabase.table("Songs")
        .select("id, track_name, artist_name, danceability")
        .order("id").range(start, end)
        .execute().data
    )

    if end > 400:
        break

    tracks.extend(batch)
    print(f"Loaded rows {start} to {end}")
    start += PAGE_SIZE

def get_song_url(track_name: str, artist_name=""):
    endpoint = "https://itunes.apple.com/search"
    term = f"{artist_name} {track_name}".strip()
    params = {
        "term": term,
        "media": "music",
        "entity": "song",
        "limit": 1
    }

    try:
        response = requests.get(endpoint, params=params)
        response.raise_for_status()
        data = response.json()

        if data["resultCount"] > 0:
            return data['results'][0]
        else: 
            return "No matching Song Found"
    except requests.exceptions.RequestException as e:
        return f"Error: {e}"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "*/*",
    "Accept-Encoding": "identity"
}

final_dict = []
feature_columns = [
    'rhythm.bpm', 
    'rhythm.onset_rate', 
    'rhythm.beats_loudness.mean',
    'lowlevel.dynamic_complexity', 
    'lowlevel.spectral_energyband_low.mean',
    'lowlevel.spectral_energyband_high.mean', 
    'tonal.chords_changes_rate',
    'lowlevel.spectral_flux.mean'
]

count = 0
for track in tracks:
    print(count)
    song_info = get_song_url(track['track_name'], track['artist_name'])
    if type(song_info) is not str:
        song_url = song_info['previewUrl']
    else: 
        continue
    temp_id = str(uuid.uuid4())
    audiopath = f"/home/aarav/sonara-orbital26/fastapi/temp/{temp_id}.m4a"
    response = requests.get(song_url, headers=headers, stream=True, timeout=15)
    response.raise_for_status()

    with open(audiopath, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    
    features, feature_frames = MusicExtractor(lowlevelStats=['mean', 'stdev'], rhythmStats=['mean', 'stdev'], tonalStats=['mean', 'stdev'])(audiopath)
    dict = {} 
    for feat in feature_columns:
        dict[feat] = features[feat]
    dict['danceability_target'] = track['danceability']
    final_dict.append(dict)

    if os.path.exists(audiopath):
        os.remove(audiopath)
    
    count += 1


df = pd.DataFrame(final_dict)

df['raw_groove'] = df.get('rhythm.beats_loudness.mean', 0.0) / (df.get('lowlevel.dynamic_complexity', 0.0) + 1e-5)
df['bass_drive'] = df.get('lowlevel.spectral_energyband_low.mean', 0.0) / (df.get('lowlevel.spectral_energyband_high.mean', 0.0) + 1e-5)
df['bpm_closeness'] = np.exp(-((df['rhythm.bpm'] - 124.0) ** 2) / (2 * (22.0 ** 2)))

feature_columns.extend(['raw_groove', 'bass_drive', 'bpm_closeness'])
df = df.dropna(subset=feature_columns + ['danceability_target'])

X = df[feature_columns]
y = df['danceability_target']
print(f"X shape: {X.shape}, y shape: {y.shape}")

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestRegressor(
    n_estimators=100,
    max_depth=7,
    min_samples_leaf=3,
    random_state=42,
    n_jobs=1
)

print("starting training")
model.fit(X_train, y_train)
print("done training")

predictions = model.predict(X_test)

mse = mean_squared_error(y_test, predictions)
r2 = r2_score(y_test, predictions)

print(f"\n--- Evaluation Metrics ---")
print(f"Mean Squared Error (MSE): {mse:.4f}") 
print(f"R² Score (Variance Explained): {r2:.2f}")
print("\n--- Feature Importances ---")
importances = model.feature_importances_
for name, importance in sorted(zip(feature_columns, importances), key=lambda x: x[1], reverse=True):
    print(f"{name}: {importance:.2%}")

joblib.dump(
    {"model": model},
    "dance_model"
)