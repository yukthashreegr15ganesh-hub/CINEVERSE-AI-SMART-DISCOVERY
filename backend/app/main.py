import logging
from contextlib import asynccontextmanager
from typing import Optional, List
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db, check_watchlist_exists
from app.services.recommender import recommender
from app.api.api import api_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("cineverse")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes database and fits recommendation model upon startup."""
    logger.info("Starting up %s v%s...", settings.PROJECT_NAME, settings.PROJECT_VERSION)
    init_db()
    recommender.fit()
    logger.info("Recommendation engine ready with %d movies.", len(recommender.df))
    yield
    logger.info("Shutting down %s...", settings.PROJECT_NAME)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="Cinematic Movie Discovery and Content-Based Recommendation Platform",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount modular router under /api
app.include_router(api_router, prefix="/api")

# Top-level direct endpoint mappings for exact prompt specifications
@app.get("/api/health", tags=["Health"])
def health_check():
    """Health check endpoint providing engine status and catalog count."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "engine_ready": recommender.is_ready(),
        "catalog_size": len(recommender.df) if recommender.is_ready() else 0,
        "vocabulary_size": len(recommender.feature_names) if recommender.is_ready() else 0
    }

@app.get("/api/genres", tags=["Movies"], response_model=List[str])
def direct_genres():
    """Returns available genres."""
    return recommender.get_all_genres()

@app.get("/api/search", tags=["Movies"])
def direct_search(q: str = Query(..., min_length=1), limit: int = Query(20, ge=1, le=100)):
    """Direct search endpoint."""
    movies_data, total = recommender.get_all_movies(search_query=q, limit=limit, offset=0)
    for m in movies_data:
        m["is_in_watchlist"] = check_watchlist_exists(m["movie_id"])
    return {
        "query": q,
        "results": movies_data,
        "total": total
    }

@app.get("/")
def root():
    return {
        "message": "Welcome to Cineverse Discovery API",
        "docs_url": "/docs",
        "health_check": "/api/health"
    }
