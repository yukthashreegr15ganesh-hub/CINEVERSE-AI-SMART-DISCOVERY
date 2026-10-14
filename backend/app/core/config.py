import os
from pathlib import Path
from typing import List

# Resolve base paths
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BACKEND_DIR / "data"
DEFAULT_DATA_PATH = DATA_DIR / "sample_movies.csv"
DB_PATH = BACKEND_DIR / "watchlist.db"

class Settings:
    PROJECT_NAME: str = "CINEVERSE DISCOVERY"
    PROJECT_VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # Dataset and storage
    DATASET_PATH: str = os.getenv("DATASET_PATH", str(DEFAULT_DATA_PATH))
    SQLITE_PATH: str = os.getenv("SQLITE_PATH", str(DB_PATH))
    
    # External API (optional, graceful fallback if empty)
    TMDB_API_KEY: str = os.getenv("TMDB_API_KEY", "")
    TMDB_BASE_URL: str = "https://api.themoviedb.org/3"
    TMDB_IMAGE_BASE_URL: str = "https://image.tmdb.org/t/p/w500"
    TMDB_BACKDROP_BASE_URL: str = "https://image.tmdb.org/t/p/w1280"

settings = Settings()
