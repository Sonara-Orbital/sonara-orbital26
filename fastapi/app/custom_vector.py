from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import subprocess, os, uuid, requests, json, librosa
import numpy as np
import tensorflow as tf
from contextlib import asynccontextmanager


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
    models_to_load = {
        "deam": "deam-msd-musicnn-1.pb",
        "acoustic": "mood_acoustic-musicnn-msd-2.pb",
        "instrumental": "voice_instrumental-musicnn-msd-2.pb"
    }

    for nickname, filename in models_to_load.items():
        model_path = os.path.join(BIN_DIR, filename)
        if not os.path.exists(model_path):
            print("Model file not found")
            continue
        
        try:
            graph = tf.Graph()
            with graph.as_default():
                with tf.io.gfile.GFile(model_path, "rb") as f:
                    graph_def = tf.compat.v1.GraphDef()
                    graph_def.ParseFromString(f.read())
                    tf.import_graph_def(graph_def, name="")
             
            session = tf.compat.v1.Session(graph=graph)

            try: 
                input_tensor = graph.get_tensor_by_name("model/Placeholder:0")
            except KeyError: 
                input_tensor = graph.get_tensor_by_name("flatten_in_input:0")
            
            output_options= [
                "model/Sigmoid:0",
                "dense_out:0"
            ]

            output_tensor = None

            for option in output_options:
                try:
                    output_tensor = graph.get_tensor_by_name(option)
                    break
                except KeyError:
                    continue
            
            LOADED_MODELS[nickname] = {
                "session": session,
                "input_tensor": input_tensor,
                "output_tensor": output_tensor
            }
        except Exception as e:
            print(f"Error: {str(e)}")
        
    yield

    for name, resources in LOADED_MODELS.items():
        resources["session"].close()

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
        audio, sr = librosa.load(audio_path, sr=16000, mono=True)

        for nickname, model in LOADED_MODELS.items():
            input_tensor = model["input_tensor"]
            shape = input_tensor.shape.as_list()
            mel = librosa.feature.melspectrogram(y=audio, sr=sr, n_mels=128, hop_length=512)
            mel_db = librosa.power_to_db(mel, ref=np.max)
            flattened = mel_db.flatten()

            if nickname == "deam":
                num_wins = len(flattened) // 200
                trimmed = flattened[:num_wins * 200]
                audio_input = trimmed.reshape(num_wins, 1, 200)
            elif nickname == "acoustic":
                num_wins = len(flattened) // 187 
                trimmed = flattened[:num_wins * 200]
                audio_input = trimmed.reshape(num_wins, 1, 200)
            else: 
                audio_input = np.expand_dims(audio, axis=0)
             
            prediction = model["session"].run(
                model["output_tensor"],
                feed_dict={model["input_tensor"]: audio_input}
            )
            flat = np.squeeze(prediction).flatten()
            highlevels[nickname] = [float(x) for x in flat]
    except Exception as e:
        print(f"batch iterference failed: {str(e)}")
    
    print("---------------------------------------------------")
    print(highlevels)
    print("---------------------------------------------------")
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
        
        print(EXTRACTOR_PATH)
        command = [EXTRACTOR_PATH, input_audio, output_json]

        result = subprocess.run(command, cwd=BASE_DIR, capture_output=True, text=True, check=True)

        if os.path.exists(output_json):
            with open(output_json, 'r', encoding='utf-8') as f:
                features_data = json.load(f)
            
            highlevel = run_all_models(input_audio)
            features_data["highlevel"] = highlevel

            print(features_data)
        else: 
            print("Extractor Failed")
    except subprocess.CalledProcessError as e:
        print(f"Essentia Error: {e}")
        print("-------------")
        print(e.stderr)
        print("-------------")
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


