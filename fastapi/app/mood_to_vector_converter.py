import os
from fastapi import APIRouter
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from .database import client

router = APIRouter()

class SongAttributes(BaseModel):
    danceability: float = Field(description="How suitable a track is for dancing based on a combination of musical elements. 0.0 is least danceable (ambient/slow), 1.0 is most danceable (high-tempo rhythm).")
    energy: float = Field(description="Intensity and activity. 0.0 represents a sleepy/relaxed track, 1.0 represents a high-energy track (fast, loud, and noisy).")
    loudness: float = Field(description="The overall loudness of a track in decibels (dB). Scale this to a 0.0 to 1.0 range, where 0.0 is very quiet and 1.0 is very loud/compressed.")
    acousticness: float = Field(description="A confidence measure of whether the track is acoustic. 0.0 is purely electronic/synthesized, 1.0 is definitely acoustic (natural instruments like piano/guitar).")
    instrumentalness: float = Field(description="Predicts whether a track contains no vocals. 0.0 contains vocal-heavy content (rap/pop), 1.0 is a pure instrumental track.")
    valence: float = Field(description="The musical positiveness conveyed by a track. 0.0 is sad/depressing/angry, 1.0 is happy/cheerful/euphoric.")
    tempo: float = Field(description="The overall estimated tempo of a track in beats per minute (BPM). Normalize this to a 0.0 to 1.0 scale, where 0.0 is a slow ballad (around 60 BPM) and 1.0 is a very fast song (around 200+ BPM).")


def convert_user_mood_to_vector(mood_prompt: str) -> list[float]:
    print(f"PROMPT IS {mood_prompt}")
    ai_prompt = "You are a music analysis engine. Output JSON with 7 attributes on a scale of 0.000 to 1.000.\
        Do not round numbers to the nearest tenth. Provide high-prevision vloat values with at least 2 decimal places\
        to allow for precise similarity matching."
    
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=f"Analyse this request: {mood_prompt}",
        config=types.GenerateContentConfig(
            system_instruction=ai_prompt,
            response_mime_type="application/json",
            response_schema=SongAttributes,
            temperature=0.3
        )
    )

    data = response.parsed
    res = [data.danceability, data.energy, data.loudness, data.acousticness, data.instrumentalness, data.valence, data.tempo]

    return res

# print(convert_user_mood_to_vector("I want a sad song to listen to alone on the highway"))

