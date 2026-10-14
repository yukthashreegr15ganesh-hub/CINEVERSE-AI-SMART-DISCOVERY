from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query
from app.schemas.movie import Movie
from app.services.recommender import recommender
from app.core.database import check_watchlist_exists

router = APIRouter()

@router.get("", response_model=dict)
def get_movies(
    genre: Optional[str] = Query(None, description="Filter by genre"),
    min_rating: Optional[float] = Query(None, ge=0.0, le=10.0, description="Minimum vote average"),
    search: Optional[str] = Query(None, description="Search keyword in title or keywords"),
    sort_by: Optional[str] = Query("popularity_desc", description="Sort order"),
    limit: int = Query(50, ge=1, le=200, description="Page limit"),
    offset: int = Query(0, ge=0, description="Page offset")
):
    """Retrieves paginated list of movies with optional filters and sorting."""
    movies_data, total = recommender.get_all_movies(
        genre=genre,
        min_rating=min_rating,
        search_query=search,
        sort_by=sort_by,
        limit=limit,
        offset=offset
    )

    # Attach watchlist status
    for m in movies_data:
        m["is_in_watchlist"] = check_watchlist_exists(m["movie_id"])

    return {
        "items": movies_data,
        "total": total,
        "limit": limit,
        "offset": offset
    }

@router.get("/genres", response_model=List[str])
def get_genres():
    """Returns all available distinct genres in the dataset."""
    return recommender.get_all_genres()

@router.get("/search", response_model=dict)
def search_movies(
    q: str = Query(..., min_length=1, description="Search query string"),
    limit: int = Query(20, ge=1, le=100)
):
    """Dedicated search endpoint matching title and keywords with debounced support."""
    movies_data, total = recommender.get_all_movies(
        search_query=q,
        limit=limit,
        offset=0
    )
    for m in movies_data:
        m["is_in_watchlist"] = check_watchlist_exists(m["movie_id"])

    return {
        "query": q,
        "results": movies_data,
        "total": total
    }

@router.get("/{movie_id}", response_model=Movie)
def get_movie_detail(movie_id: int):
    """Retrieves metadata for a specific movie by stable ID."""
    movie = recommender.get_movie_by_id(movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail=f"Movie with id {movie_id} was not found.")
    
    movie["is_in_watchlist"] = check_watchlist_exists(movie_id)
    return movie
