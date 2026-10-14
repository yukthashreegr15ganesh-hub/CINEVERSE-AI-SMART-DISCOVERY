export interface Movie {
  movie_id: number;
  title: string;
  overview: string;
  genres: string;
  keywords: string;
  genres_list: string[];
  keywords_list: string[];
  release_date: string;
  vote_average: number;
  vote_count: number;
  poster_path: string;
  backdrop_path: string;
  is_in_watchlist?: boolean;
}

export interface MovieRecommendation extends Movie {
  similarity_score: number;
  similarity_percentage: number;
  shared_genres: string[];
  shared_keywords: string[];
}

export interface RecommendationResponse {
  source_movie: Movie;
  recommendations: MovieRecommendation[];
  algorithm: string;
  explanation: string;
  total_results: number;
}

export interface TermContribution {
  term: string;
  source_weight: number;
  target_weight: number;
  contribution: number;
}

export interface ComparisonResponse {
  source_movie: Movie;
  target_movie: Movie;
  similarity_score: number;
  similarity_percentage: number;
  shared_genres: string[];
  shared_keywords: string[];
  top_contributing_terms: TermContribution[];
  cosine_formula: string;
  explanation: string;
}

export interface WatchlistItem {
  movie_id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  genres: string;
  added_at: string;
}

export interface AnalyticsSummary {
  total_movies: number;
  vocabulary_size: number;
  matrix_shape: number[];
  sparsity_percentage: number;
  top_tfidf_terms: Array<{ term: string; mean_tfidf: number }>;
  genre_distribution: Record<string, number>;
  score_distribution_samples: number[];
  algorithm_info: Record<string, string | boolean>;
}

export interface MoviesListResponse {
  items: Movie[];
  total: number;
  limit: number;
  offset: number;
}
