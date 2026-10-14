import type {
  Movie,
  MoviesListResponse,
  RecommendationResponse,
  ComparisonResponse,
  WatchlistItem,
  AnalyticsSummary
} from '../types/movie';

const API_BASE_URL = 'http://localhost:8000/api';

export function getPosterUrl(path?: string): string {
  if (!path || path.trim() === '') return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `https://image.tmdb.org/t/p/w500${path}`;
}

export function getBackdropUrl(path?: string): string {
  if (!path || path.trim() === '') return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `https://image.tmdb.org/t/p/w1280${path}`;
}

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  },

  async getMovies(params?: {
    genre?: string;
    min_rating?: number;
    search?: string;
    sort_by?: string;
    limit?: number;
    offset?: number;
  }): Promise<MoviesListResponse> {
    const query = new URLSearchParams();
    if (params?.genre && params.genre !== 'All') query.append('genre', params.genre);
    if (params?.min_rating !== undefined && params.min_rating > 0) query.append('min_rating', params.min_rating.toString());
    if (params?.search) query.append('search', params.search);
    if (params?.sort_by) query.append('sort_by', params.sort_by);
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset !== undefined) query.append('offset', params.offset.toString());

    const res = await fetch(`${API_BASE_URL}/movies?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch movies');
    return res.json();
  },

  async getMovie(movieId: number): Promise<Movie> {
    const res = await fetch(`${API_BASE_URL}/movies/${movieId}`);
    if (!res.ok) throw new Error(`Movie with ID ${movieId} not found`);
    return res.json();
  },

  async searchMovies(q: string, limit = 20): Promise<{ query: string; results: Movie[]; total: number }> {
    const res = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(q)}&limit=${limit}`);
    if (!res.ok) throw new Error('Search request failed');
    return res.json();
  },

  async getGenres(): Promise<string[]> {
    const res = await fetch(`${API_BASE_URL}/genres`);
    if (!res.ok) throw new Error('Failed to fetch genres');
    return res.json();
  },

  async getSimilarMovies(movieId: number, limit = 8): Promise<RecommendationResponse> {
    const res = await fetch(`${API_BASE_URL}/recommendations/similar/${movieId}?limit=${limit}`);
    if (!res.ok) throw new Error(`Failed to calculate similar movies for ID ${movieId}`);
    return res.json();
  },

  async compareMovies(sourceId: number, targetId: number): Promise<ComparisonResponse> {
    const res = await fetch(`${API_BASE_URL}/recommendations/compare?source_id=${sourceId}&target_id=${targetId}`);
    if (!res.ok) throw new Error('Comparison computation failed');
    return res.json();
  },

  async getWatchlist(): Promise<WatchlistItem[]> {
    const res = await fetch(`${API_BASE_URL}/watchlist`);
    if (!res.ok) throw new Error('Failed to retrieve watchlist');
    return res.json();
  },

  async addToWatchlist(movieId: number): Promise<{ success: boolean; message: string; movie_id: number }> {
    const res = await fetch(`${API_BASE_URL}/watchlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movie_id: movieId })
    });
    if (!res.ok) throw new Error('Failed to add movie to watchlist');
    return res.json();
  },

  async removeFromWatchlist(movieId: number): Promise<{ success: boolean; message: string; movie_id: number }> {
    const res = await fetch(`${API_BASE_URL}/watchlist/${movieId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to remove movie from watchlist');
    return res.json();
  },

  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const res = await fetch(`${API_BASE_URL}/analytics/summary`);
    if (!res.ok) throw new Error('Failed to fetch vector analytics summary');
    return res.json();
  }
};
