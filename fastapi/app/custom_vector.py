from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import subprocess, os, uuid, requests, json, librosa
import numpy as np
from contextlib import asynccontextmanager
from essentia.standard import MonoLoader, TensorflowPredictMusiCNN, TensorflowPredict2D, RhythmExtractor2013, Danceability, Loudness


class TrackRequest(BaseModel):
    url: str

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(CURRENT_DIR)
EXTRACTOR_PATH = os.path.join(BASE_DIR, "bin", "streaming_extractor_music.exe")
TEMP_DIR = os.path.join(BASE_DIR, "temp")
BIN_DIR = os.path.join(BASE_DIR, "bin")

os.makedirs(TEMP_DIR, exist_ok=True)

LOADED_MODELS = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    embedding_model_path = os.path.join(BIN_DIR, "msd-musicnn-1.pb")

    self_contained_models = {
        "acoustic": "mood_acoustic-musicnn-msd-2.pb",
        "instrumental": "voice_instrumental-musicnn-msd-2.pb"
    }

    for nickname, filename in self_contained_models.items():
        model_path = os.path.join(BIN_DIR, filename)
        if not os.path.exists(model_path):
            print("Model file not found")
            continue
        LOADED_MODELS[nickname] = {
            "type": "direct",
            "algo": TensorflowPredictMusiCNN(graphFilename=model_path, output="model/Sigmoid")
        }
        deam_path = os.path.join(BIN_DIR, "deam-msd-musicnn-1.pb")
        if os.path.exists(embedding_model_path) and os.path.exists(deam_path):
            LOADED_MODELS["deam"] = {
                "type": "embedding",
                "embedding_algo": TensorflowPredictMusiCNN(graphFilename=embedding_model_path, output="model/dense/BiasAdd"),
                "algo": TensorflowPredict2D(graphFilename=deam_path, input="flatten_in_input", output="dense_out")
            }
        
    yield
    LOADED_MODELS.clear()

app = FastAPI(lifespan=lifespan)

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

def run_all_models(audio_path: str) -> dict:
    if not LOADED_MODELS:
        return {}

    highlevels = {}

    try:
        audio = MonoLoader(filename=audio_path, sampleRate=16000, resampleQuality=4)()

        for nickname, model in LOADED_MODELS.items():
            if model["type"] == "direct":
                prediction = model["algo"](audio)
            else: 
                embeddings = model["embedding_algo"](audio)
                prediction = model["algo"](embeddings)
            highlevels[nickname] = [float(x) for x in prediction.mean(axis=0)]

    except Exception as e:
        print(f"batch iterference failed: {str(e)}")
    
    return highlevels

def extract_features (track_url: str, task_id: str):
    
    input_audio = os.path.join(TEMP_DIR, f"{task_id}.m4a")
    output_json = os.path.join(TEMP_DIR, f"{task_id}.json")

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*",
        "Accept-Encoding": "identity"
    }

    try:
        response = requests.get(track_url, headers=headers, stream=True, timeout=15)
        response.raise_for_status()

        with open(input_audio, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        audio_44k = MonoLoader(filename=input_audio, sampleRate=44000)()
        rythm_extractor = RhythmExtractor2013(method="multifeature")
        bpm, beats, beats_confidence, _, beats_intervals = rythm_extractor(audio_44k)

        danceability_extractor = Danceability()
        danceability, dfa = danceability_extractor(audio_44k)

        loudness_extractor = Loudness()
        loudness = loudness_extractor(audio_44k)

        highlevels = run_all_models(input_audio)
        highlevels['acousticness'] = highlevels['acoustic'][0]
        highlevels['instrumentalness'] = highlevels['instrumental'][0]
        highlevels['valence'] = highlevels['deam'][0]
        highlevels['energy'] = highlevels['deam'][1]
        highlevels['tempo'] = bpm
        highlevels['danceability'] = danceability
        highlevels['loudness'] = loudness 
        highlevels.pop('acoustic')
        highlevels.pop('deam')
        highlevels.pop('instrumental')
        print(highlevels)

    except Exception as e:
        print(f"Other Error: {e}")
    finally:
        if os.path.exists(input_audio):
            os.remove(input_audio)
        #if os.path.exists(output_json):
            #os.remove(output_json)

if __name__ == "__main__":
    from fastapi.testclient import TestClient

    id = str(uuid.uuid4())
    song_info = get_song_url("Piano Man", "Billy Joel")
    song_url = song_info.get('previewUrl')
    print(song_url)

    with TestClient(app) as client:
        print("lifespan active ")
        extract_features( song_url, id)


@app.post("/api/extract")
async def get_features (payload: TrackRequest, background_tasks: BackgroundTasks):
    if not payload.url:
        raise HTTPException(status_code=400, detail="Missing Song URL")
    task_id = str(uuid.uuid4())

    background_tasks.add_task(extract_features, payload.url, task_id)

    return {
        "success": True,
        "message": "analysis started",
        "task_id": task_id
    }


