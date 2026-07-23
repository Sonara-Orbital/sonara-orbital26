from dotenv import load_dotenv
from google import genai
from supabase import create_client, Client
import os

load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

LASTFM_API_KEY = os.getenv("LASTFM_API_KEY")

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)