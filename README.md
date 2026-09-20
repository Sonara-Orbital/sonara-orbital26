# Sonara

Sonara is a music discovery application that recommends songs based on a selected song or a described mood. The project contains a Next.js frontend and a FastAPI backend for music analysis and similarity recommendations.

> [!WARNING]
> ### macOS users
>
> Sonara's live audio-feature extraction uses Essentia's TensorFlow predictors, including `TensorflowPredictMusiCNN`. These predictors are not reliably available on Apple Silicon Macs (`arm64`), especially with Python 3.13.
>
> On macOS, you may need to comment out the Essentia imports in:
>
> - `fastapi/app/custom_vector.py`
> - `fastapi/app/dance_model.py`
>
> Commenting them out allows the backend to start and database-based recommendations to work. However, macOS users will not be able to recommend songs that are outside the database or use live audio feature extraction.
>
> For full functionality, run the backend in Linux/Docker or use an x86_64 Python 3.11 environment through Rosetta.

## Requirements

- Node.js and npm
- Python 3.11 recommended for the backend
- A Supabase project and the required API credentials

## Project structure

```text
.
├── app/                 # Next.js frontend
├── actions/             # Server actions used by the frontend
├── components/          # Reusable UI components
├── fastapi/             # FastAPI backend and music-analysis models
├── public/              # Static frontend assets
└── .env.local           # Local frontend environment variables
```

## Environment variables

The frontend reads environment variables from `.env.local`. The backend reads them from `fastapi/.env`.

Don't commit either environment file or share secret keys publicly. Use the variable names expected by the existing files, including the Supabase credentials and any Spotify, Last.fm, or Gemini credentials required by the feature you are using.

## Running locally

### 1. Start the backend

From the project root:

```bash
cd fastapi
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The backend runs at [http://localhost:8000](http://localhost:8000). Interactive API documentation is available at [http://localhost:8000/docs](http://localhost:8000/docs).

On later runs, activate the existing environment instead of creating it again:

```bash
cd fastapi
source .venv/bin/activate
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 2. Start the frontend

Open a second terminal from the project root:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The frontend uses `NEXT_PUBLIC_API_URL` to locate the backend. For local development, set it to:

```text
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Recommendation modes

### Similar-song recommendations

The backend first checks whether the selected song exists in the `Songs` database.

- If it exists, its stored embedding is used to find similar songs.
- If it does not exist, the backend retrieves an audio preview, extracts audio features with Essentia, and compares the resulting vector with the KNN model.

### Mood recommendations

The mood recommender converts a text description into a vector and returns similar songs from the available song catalogue.

### Song discovery feed

The discovery feed uses songs saved in the user’s library as seed songs and excludes songs already seen or saved by the user.

## macOS limitations

The live audio-feature extraction path depends on Essentia’s TensorFlow predictors, including `TensorflowPredictMusiCNN`. These predictors are not reliably available in the Essentia Python package on Apple Silicon Macs (`arm64`), particularly with Python 3.13.

As a result, macOS users may see an error similar to:

```text
ImportError: cannot import name 'TensorflowPredictMusiCNN' from 'essentia.standard'
```

### macOS workaround

In `fastapi/app/custom_vector.py` and `fastapi/app/dance_model.py`, comment out the Essentia import:

```python
# from essentia.standard import MonoLoader, TensorflowPredictMusiCNN, TensorflowPredict2D, RhythmExtractor2013, MusicExtractor
```

This allows the backend to start and keeps database-based recommendations available. However, the live extraction path will not work.

With the Essentia import commented out, macOS users cannot reliably:

- Recommend songs that are not already in the database
- Extract features from a new audio preview
- Use features that depend on the TensorFlow-based Essentia models

Database-based recommendations, mood recommendations using the precomputed model, and other features that do not invoke live Essentia extraction may continue to work.

### Full macOS workaround

To enable live extraction, run the backend in a compatible Linux environment or use an x86_64 Python environment through Rosetta on Apple Silicon. Python 3.11 is recommended. The Essentia TensorFlow predictors must be available before uncommenting the import.

## Windows and Linux

Windows x64 and Linux are the preferred environments for the full backend because the repository includes platform-specific audio-analysis assets. Install `essentia-tensorflow` when using the TensorFlow predictors; the plain `essentia` package does not provide those predictors.

## Changing branches

After switching branches:

```bash
python -m pip install -r fastapi/requirements.txt
npm install
```

The Python dependencies only need to be reinstalled when the requirements change. Environment files are local and may need to be updated if a branch expects different variables.

## Troubleshooting

### Backend cannot find the KNN model

Start Uvicorn from inside the `fastapi` directory. The backend loads model files using paths relative to that directory.

### Backend starts but returns no recommendations for a new song

Check whether the Essentia import is commented out or whether `TensorflowPredictMusiCNN` is unavailable in the current Python environment. This specifically affects songs that are not already in the database.

### Port already in use

Stop the existing development server, or start the backend on another port and update `NEXT_PUBLIC_API_URL` accordingly.

## License and third-party components

This project uses third-party libraries and pretrained model files. Review their individual licenses before redistributing the project or its model assets.
