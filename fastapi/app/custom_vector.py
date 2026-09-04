from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import joblib, os, uuid, requests, json, librosa
import numpy as np
from contextlib import asynccontextmanager
from essentia.standard import MonoLoader, TensorflowPredictMusiCNN, TensorflowPredict2D, RhythmExtractor2013, Danceability, LoudnessEBUR128, MusicExtractor, AudioLoader


class TrackRequest(BaseModel):
    url: str

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(CURRENT_DIR)
EXTRACTOR_PATH = os.path.join(BASE_DIR, "bin", "streaming_extractor_music.exe")
TEMP_DIR = os.path.join(BASE_DIR, "temp")
BIN_DIR = os.path.join(BASE_DIR, "bin")

os.makedirs(TEMP_DIR, exist_ok=True)

LOADED_MODELS = {}

def init_models():
    global LOADED_MODELS
    if LOADED_MODELS:
        return

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

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_models()
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
            url = data['results'][0]['previewUrl']
            return url
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

def calc_danceability(features: dict) -> float:
    bpm = features['rhythm.bpm']
    bpm_score = np.exp(-((bpm - 124.0) ** 2) / (2 * (22.0 ** 2)))
    dyn_comp = max(features['lowlevel.dynamic_complexity'], 0.5)
    beat_loudness = features['rhythm.beats_loudness.mean']
    raw_groove = dyn_comp / beat_loudness
    groove_score = 1 / (1 + np.exp(-(raw_groove - 0.1) * 5))
    low_energy = features['lowlevel.spectral_energyband_low.mean']
    high_energy = features['lowlevel.spectral_energyband_high.mean']

    raw_bass_drive = np.log1p(low_energy) / (np.log1p(high_energy) + 1e-5)
    bass_score = 1 / (1 + np.exp(-(raw_bass_drive - 1.2) * 3))

    onset_rate = features['rhythm.onset_rate']
    onset_score = np.exp(-((onset_rate - 4.0) ** 2) / (2 * (1.5 ** 2)))

    chord_changes = features["tonal.chords_changes_rate"]
    harmony_modifier = 1.0 - min(chord_changes * 0.5, 0.3)

    final_score = (
        (bpm_score * 0.25) + 
        (groove_score * 0.35) + 
        (bass_score * 0.2) +
        (onset_score * 0.2)
    ) * harmony_modifier

    return final_score.item()

def min_max_scale(value: float, min_value: float, max_value: float) -> float:
    if max_value == min_value:
        return 0.0
    return (value - min_value) / (max_value - min_value)

artifacts = joblib.load("dance_model")
dance_model = artifacts["model"]

def extract_features (track_url: str, task_id: str):

    init_models()
    
    print("STARTING FEATURE EXTRACTION")
    input_audio = os.path.join(TEMP_DIR, f"{task_id}.m4a")
    print("Input Audio: ", input_audio)

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*",
        "Accept-Encoding": "identity"
    }

    try:
        response = requests.get(track_url, headers=headers, stream=True, timeout=15)
        response.raise_for_status()

        with open(input_audio,   'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        audio_44k = MonoLoader(filename=input_audio, sampleRate=44100)()
        bpm, beats, beats_confidence, _, beats_intervals = RhythmExtractor2013(method="multifeature")(audio_44k)
        features, feature_frames = MusicExtractor(lowlevelStats=['mean', 'stdev'], rhythmStats=['mean', 'stdev'], tonalStats=['mean', 'stdev'])(input_audio)

        dance_feat = {}
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

        for feat in feature_columns:
            dance_feat[feat] = features[feat]

        dance_feat['raw_groove'] = dance_feat.get('rhythm.beats_loudness.mean', 0.0) / (dance_feat.get('lowlevel.dynamic_complexity', 0.0) + 1e-5)
        dance_feat['bass_drive'] = dance_feat.get('lowlevel.spectral_energyband_low.mean', 0.0) / (dance_feat.get('lowlevel.spectral_energyband_high.mean', 0.0) + 1e-5)
        dance_feat['bpm_closeness'] = np.exp(-((dance_feat['rhythm.bpm'] - 124.0) ** 2) / (2 * (22.0 ** 2)))
        feature_columns.extend(['raw_groove', 'bass_drive', 'bpm_closeness'])
        print(feature_columns)

        tempo_max = 205.984
        tempo_min = 39.082
        loudness_max = -1.144
        loudness_min = -29.868

        highlevels = run_all_models(input_audio)
        feat_vect = [dance_feat.get(col, 0.0) for col in feature_columns]
        prediction = dance_model.predict([feat_vect])[0]
        highlevels['danceability'] = float(np.clip(prediction, 0.0, 1.0))
        highlevels['energy'] = (highlevels['deam'][0] - 1) / (9 - 1)
        highlevels['loudness'] = min_max_scale(features['lowlevel.loudness_ebu128.integrated'], loudness_min, loudness_max)
        highlevels['acousticness'] = highlevels['acoustic'][0]
        highlevels['instrumentalness'] = (highlevels['instrumental'][0] ** 3) * 0.0001
        highlevels['valence'] = (highlevels['deam'][0] - 1) / (9 - 1)
        highlevels['tempo'] = min_max_scale(features['rhythm.bpm'], tempo_min, tempo_max)
        highlevels.pop('acoustic')
        highlevels.pop('instrumental')
        highlevels.pop('deam')

        return list(highlevels.values())

    except Exception as e:
        raise RuntimeError(f"Feature Extraction Failed: {e}") from e
    finally:
        if os.path.exists(input_audio):
            os.remove(input_audio)
            print("removed")

if __name__ == "__main__":
    from fastapi.testclient import TestClient

    id = str(uuid.uuid4())
    song_url = get_song_url("Lose Yourself", "Eminem")
    print(song_url)

    with TestClient(app) as client:
        print("lifespan active ")
        try:
            vector = extract_features(song_url, id) 
        except RuntimeError as e:
            raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/extract")
def get_features (payload: TrackRequest):
    if not payload.url:
        raise HTTPException(status_code=400, detail="Missing Song URL")
    task_id = str(uuid.uuid4())

    try:
        vector = extract_features(payload.url, task_id)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

    return { 
        "success": True,
        "vector": vector
    }




