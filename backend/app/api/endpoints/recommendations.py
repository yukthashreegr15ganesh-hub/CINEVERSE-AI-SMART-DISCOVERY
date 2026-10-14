from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from app.schemas.movie import RecommendationResponse, ComparisonResponse
from app.services.recommender import recommender
from app.core.database import check_watchlist_exists

router = APIRouter()

@router.get("/similar/{movie_id}", response_model=RecommendationResponse)
def get_similar_movies(
    movie_id: int,
    limit: int = Query(8, ge=1, le=30, description="Number of recommendations to return")
):
    """
    Computes and returns top-N similar movies using TF-IDF and Cosine Similarity.
    The selected movie is excluded from recommendations.
    """
    source_movie, recommendations = recommender.get_similar_movies(movie_id=movie_id, top_n=limit)
    
    if not source_movie:
        raise HTTPException(
            status_code=404,
            detail=f"Movie with id {movie_id} was not found in dataset."
        )

    # Attach watchlist flags
    source_movie["is_in_watchlist"] = check_watchlist_exists(source_movie["movie_id"])
    for rec in recommendations:
        rec["is_in_watchlist"] = check_watchlist_exists(rec["movie_id"])

    return {
        "source_movie": source_movie,
        "recommendations": recommendations,
        "algorithm": "TF-IDF + Cosine Similarity",
        "explanation": (
            "These movies were ranked using cosine similarity calculated over numerical TF-IDF feature "
            "vectors built from their available genres, plot overviews, and keyword descriptors. "
            "Content similarity reflects textual metadata alignment, not subjective user taste."
        ),
        "total_results": len(recommendations)
    }

@router.get("/compare", response_model=ComparisonResponse)
def compare_movies(
    source_id: int = Query(..., description="ID of source movie"),
    target_id: int = Query(..., description="ID of comparison target movie")
):
    """
    Provides mathematical breakdown of similarity between two movies,
    including individual term contributions to the vector dot product.
    """
    comparison = recommender.compare_movies(source_id=source_id, target_id=target_id)
    if not comparison:
        raise HTTPException(
            status_code=404,
            detail="One or both movie IDs could not be found in the dataset."
        )

    comparison["source_movie"]["is_in_watchlist"] = check_watchlist_exists(source_id)
    comparison["target_movie"]["is_in_watchlist"] = check_watchlist_exists(target_id)

    return comparison
