from supabase import create_client, Client
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import numpy as np
from sklearn.neighbors import NearestNeighbors
import json, ast, os, joblib, spotipy
import musicbrainzngs as mbn
import zstandard as zstd
from spotipy.oauth2 import SpotifyClientCredentials
from fastapi import APIRouter
from database import supabase 

router = APIRouter()

class MoodInput(BaseModel):
    moodPrompt: str

## MOOD RECOMMENDER ##
def recommender():
    return ["Test Drive"]

@router.post("/mood")
async def get_mood_recommendations(mood_input: MoodInput):
    print(mood_input.moodPrompt)
    # result = ["I want it that way", "Glory of love", "I want to break free", "I want to hold your hand", "I want you back"]
    result = recommender()
    # 1. Convert mood string to vector

    # 2. Find nearest neighbours

    # 3. Fetch song titles from supabase

    return {"status": "success", "data": result}
