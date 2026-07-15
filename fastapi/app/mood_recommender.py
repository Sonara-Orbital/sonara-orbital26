from supabase import create_client, Client
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import numpy as np
from sklearn.neighbors import NearestNeighbors
import json, ast, joblib, spotipy, requests
import musicbrainzngs as mbn
import zstandard as zstd
from spotipy.oauth2 import SpotifyClientCredentials
from fastapi import APIRouter
from database import supabase, LASTFM_API_KEY
from sentence_transformers import SentenceTransformer

router = APIRouter()

class MoodInput(BaseModel):
    moodPrompt: str

## MOOD RECOMMENDER ##
model = SentenceTransformer('all-MiniLM-L6-v2')

def recommender():
    vectorise_user_mood = model.encode("Give me a sad song to listen to alone on the highway")
    print(vectorise_user_mood)
    return ["Test Drive"]
recommender()

# Testing Lastfm API
def test_tags():
    url = f"https://ws.audioscrobbler.com/2.0/?method=track.gettoptags&api_key={LASTFM_API_KEY}&artist=the+weeknd&track=blinding+lights&format=json"
    response = requests.get(url)
    data = response.json()
    print(data)
    for song in data['toptags']['tag']:
        print(song['name'])

test_tags()


@router.post("/mood")
async def get_mood_recommendations(mood_input: MoodInput):
    print(mood_input.moodPrompt)
    # result = ["I want it that way", "Glory of love", "I want to break free", "I want to hold your hand", "I want you back"]
    result = recommender()
    # 1. Convert mood string to vector

    # 2. Find nearest neighbours

    # 3. Fetch song titles from supabase

    return {"status": "success", "data": result}

