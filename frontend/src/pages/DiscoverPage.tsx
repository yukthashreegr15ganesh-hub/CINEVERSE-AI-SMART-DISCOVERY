import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, Star, Film, Loader2 } from 'lucide-react';
import type { Movie } from '../types/movie';
import { api } from '../services/api';
import { MovieCard } from '../components/MovieCard';

interface DiscoverPageProps {
  onSelectMovie: (movie: Movie) => void;
  onExploreSimilar: (movie: Movie) => void;
  onToggleWatchlist: (movie: Movie) => void;
  watchlistIds: Set<number>;
}

export const DiscoverPage: React.FC<DiscoverPageProps> = ({
  onSelectMovie,
  onExploreSimilar,
  onToggleWatchlist,
  watchlistIds,
}) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [minRating, setMinRating] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('popularity_desc');
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Load genres on mount
  useEffect(() => {
    api.getGenres()
      .then((data) => setGenres(data))
      .catch((err) => console.error('Failed to load genres:', err));
  }, []);

  // Fetch movies when filters or search change
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    const timer = setTimeout(() => {
      api.getMovies({
        genre: selectedGenre !== 'All' ? selectedGenre : undefined,
        min_rating: minRating > 0 ? minRating : undefined,
        search: searchQuery.trim() || undefined,
        sort_by: sortBy,
        limit: 100,
      })
        .then((res) => {
          if (!isCancelled) {
            setMovies(res.items);
            setTotalCount(res.total);
          }
        })
        .catch((err) => {
          if (!isCancelled) {
            console.error('Error fetching catalog:', err);
            setMovies([]);
            setTotalCount(0);
          }
        })
        .finally(() => {
          if (!isCancelled) setLoading(false);
        });
    }, 200);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [selectedGenre, minRating, searchQuery, sortBy]);

  const handleResetFilters = () => {
    setSelectedGenre('All');
    setMinRating(0);
    setSearchQuery('');
    setSortBy('popularity_desc');
  };

  const isFiltered = selectedGenre !== 'All' || minRating > 0 || searchQuery.trim() !== '' || sortBy !== 'popularity_desc';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Film className="w-8 h-8 text-amber-400" />
            <span>Discover Catalog</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Browse, filter, and discover movies from our content-analyzed catalog of {totalCount} titles.
          </p>
        </div>

        {isFiltered && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear All Filters</span>
          </button>
        )}
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0c0f18] border border-white/10 space-y-4">
        {/* Top search & sorting row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, overview snippet, or keyword..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400/50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 whitespace-nowrap">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl bg-zinc-900 border border-white/10 text-zinc-200 text-sm focus:outline-none focus:border-amber-400/50 cursor-pointer"
            >
              <option value="popularity_desc">Most Popular (Votes)</option>
              <option value="rating_desc">Highest Rated (Average)</option>
              <option value="rating_asc">Lowest Rated</option>
              <option value="release_desc">Release Date: Newest First</option>
              <option value="release_asc">Release Date: Oldest First</option>
              <option value="title_asc">Title: A to Z</option>
            </select>
          </div>
        </div>

        {/* Rating threshold bar */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5">
          <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5 mr-2">
            <Star className="w-3.5 h-3.5 text-amber-400" />
            <span>Minimum Rating:</span>
          </span>
          {[0, 7.0, 7.5, 8.0, 8.3].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setMinRating(val)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                minRating === val
                  ? 'bg-amber-500 text-black font-bold shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              {val === 0 ? 'Any Rating' : `${val}+ ★`}
            </button>
          ))}
        </div>

        {/* Genre Tags Scrollable Row */}
        <div className="space-y-1.5 pt-1 border-t border-white/5">
          <span className="text-xs font-medium text-zinc-400">Genre:</span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedGenre('All')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedGenre === 'All'
                  ? 'bg-amber-400 text-black font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              All Genres
            </button>
            {genres.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setSelectedGenre(g)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedGenre === g
                    ? 'bg-amber-400 text-black font-bold shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
        <span>Showing {movies.length} of {totalCount} movies</span>
        {selectedGenre !== 'All' && <span>Filtered by: {selectedGenre}</span>}
      </div>

      {/* Grid of Movie Cards */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-zinc-400 space-y-3">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          <p className="text-sm font-medium">Filtering catalog...</p>
        </div>
      ) : movies.length === 0 ? (
        <div className="py-24 text-center rounded-2xl bg-zinc-900/40 border border-white/5 p-8 space-y-4">
          <Film className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Movies Match Your Filters</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            We couldn't find any movie matching the combination of your current genre, search keyword, and minimum rating.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs shadow-lg transition-all"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {movies.map((movie) => (
            <div key={movie.movie_id} className="flex justify-center">
              <MovieCard
                movie={movie}
                onSelect={onSelectMovie}
                onExploreSimilar={onExploreSimilar}
                onToggleWatchlist={onToggleWatchlist}
                isWatchlisted={watchlistIds.has(movie.movie_id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
