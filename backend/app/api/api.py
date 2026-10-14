from fastapi import APIRouter
from app.api.endpoints import movies, recommendations, watchlist, analytics

api_router = APIRouter()

api_router.include_router(movies.router, prefix="/movies", tags=["Movies"])
api_router.include_router(recommendations.router, prefix="/recommendations", tags=["Recommendations"])
api_router.include_router(watchlist.router, prefix="/watchlist", tags=["Watchlist"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
