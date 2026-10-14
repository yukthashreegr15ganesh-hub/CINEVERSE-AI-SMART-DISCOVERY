from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class MovieBase(BaseModel):
    movie_id: int
    title: str
    overview: Optional[str] = ""
    genres: Optional[str] = ""
    keywords: Optional[str] = ""
    release_date: Optional[str] = ""
    vote_average: Optional[float] = 0.0
    vote_count: Optional[int] = 0
    poster_path: Optional[str] = ""
    backdrop_path: Optional[str] = ""

class Movie(MovieBase):
    genres_list: List[str] = Field(default_factory=list)
    keywords_list: List[str] = Field(default_factory=list)
    is_in_watchlist: Optional[bool] = False

class MovieRecommendation(Movie):
    similarity_score: float = Field(..., description="Cosine similarity score bounded between 0.0 and 1.0")
    similarity_percentage: float = Field(..., description="Similarity expressed as a readable percentage")
    shared_keywords: List[str] = Field(default_factory=list)
    shared_genres: List[str] = Field(default_factory=list)

class RecommendationResponse(BaseModel):
    source_movie: Movie
    recommendations: List[MovieRecommendation]
    algorithm: str = "TF-IDF + Cosine Similarity"
    explanation: str = (
        "These movies were ranked using cosine similarity calculated over numerical TF-IDF feature "
        "vectors built from their available genres, plot overviews, and keyword descriptors. "
        "Content similarity reflects textual metadata alignment, not subjective user taste."
    )
    total_results: int

class TermContribution(BaseModel):
    term: str
    source_weight: float
    target_weight: float
    contribution: float

class ComparisonResponse(BaseModel):
    source_movie: Movie
    target_movie: Movie
    similarity_score: float
    similarity_percentage: float
    shared_genres: List[str]
    shared_keywords: List[str]
    top_contributing_terms: List[TermContribution]
    cosine_formula: str = "cos(θ) = (A · B) / (||A|| ||B||)"
    explanation: str

class WatchlistCreate(BaseModel):
    movie_id: int

class WatchlistResponse(BaseModel):
    movie_id: int
    title: str
    overview: Optional[str] = ""
    poster_path: Optional[str] = ""
    backdrop_path: Optional[str] = ""
    release_date: Optional[str] = ""
    vote_average: Optional[float] = 0.0
    genres: Optional[str] = ""
    added_at: Optional[str] = ""

class AnalyticsSummary(BaseModel):
    total_movies: int
    vocabulary_size: int
    matrix_shape: List[int]
    sparsity_percentage: float
    top_tfidf_terms: List[Dict[str, Any]]
    genre_distribution: Dict[str, int]
    score_distribution_samples: List[float]
    algorithm_info: Dict[str, Any]
