from typing import List
from fastapi import APIRouter, HTTPException, status
from app.schemas.movie import WatchlistCreate, WatchlistResponse
from app.core.database import fetch_all_watchlist, insert_watchlist, delete_watchlist, check_watchlist_exists
from app.services.recommender import recommender

router = APIRouter()

@router.get("", response_model=List[WatchlistResponse])
def get_watchlist():
    """Returns all movies saved in the persistent SQLite watchlist."""
    return fetch_all_watchlist()

@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
def add_to_watchlist(payload: WatchlistCreate):
    """Adds a movie to the user's local watchlist."""
    movie = recommender.get_movie_by_id(payload.movie_id)
    if not movie:
        raise HTTPException(
            status_code=404,
            detail=f"Movie with id {payload.movie_id} does not exist in catalog."
        )

    if check_watchlist_exists(payload.movie_id):
        return {
            "success": True,
            "message": f"'{movie['title']}' is already in your watchlist.",
            "movie_id": payload.movie_id
        }

    success = insert_watchlist(movie)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to persist movie into watchlist.")

    return {
        "success": True,
        "message": f"'{movie['title']}' added to your watchlist.",
        "movie_id": payload.movie_id
    }

@router.delete("/{movie_id}", response_model=dict)
def remove_from_watchlist(movie_id: int):
    """Removes a movie from the user's watchlist."""
    removed = delete_watchlist(movie_id)
    if not removed:
        raise HTTPException(
            status_code=404,
            detail=f"Movie with id {movie_id} not found in watchlist."
        )

    return {
        "success": True,
        "message": f"Movie removed from watchlist.",
        "movie_id": movie_id
    }
