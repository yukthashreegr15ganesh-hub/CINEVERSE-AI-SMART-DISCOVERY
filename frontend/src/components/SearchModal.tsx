import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, Sparkles, Star, Film } from 'lucide-react';
import type { Movie } from '../types/movie';
import { api, getPosterUrl } from '../services/api';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMovie: (movie: Movie) => void;
  onExploreSimilar: (movie: Movie) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectMovie,
  onExploreSimilar,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
      setHasSearched(false);
    }
  }, [isOpen]);

  // Debounced search effect
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const response = await api.searchMovies(query, 12);
        setResults(response.results || []);
        setHasSearched(true);
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Background click to dismiss */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div className="w-full max-w-2xl bg-[#0e121e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Header */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-white/10 bg-[#090b12]">
          <Search className="w-5 h-5 text-amber-400 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies by title, keywords or synopsis..."
            className="w-full bg-transparent text-white placeholder-zinc-500 text-sm sm:text-base focus:outline-none"
          />
          {isLoading && (
            <Loader2 className="w-4 h-4 text-amber-400 animate-spin mr-2 flex-shrink-0" />
          )}
          {query && !isLoading && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-zinc-400 hover:text-white mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-mono text-zinc-400 hover:text-white px-2 py-1 rounded bg-white/5 border border-white/10"
          >
            ESC
          </button>
        </div>

        {/* Search Results Container */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {isLoading && results.length === 0 && (
            <div className="py-12 text-center text-zinc-400 flex flex-col items-center justify-center">
              <Loader2 className="w-7 h-7 text-amber-400 animate-spin mb-2" />
              <p className="text-sm">Searching movie catalog...</p>
            </div>
          )}

          {!isLoading && hasSearched && results.length === 0 && (
            <div className="py-12 text-center text-zinc-400 space-y-2">
              <Film className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-sm font-medium text-zinc-300">No movies found for "{query}"</p>
              <p className="text-xs text-zinc-500">Try searching for keywords like "space", "heist", or a different title.</p>
            </div>
          )}

          {!hasSearched && !isLoading && (
            <div className="py-8 text-center text-zinc-500 text-xs">
              Type at least 2 characters to search across titles, synopses, and genre keywords.
            </div>
          )}

          {results.map((movie) => {
            const posterUrl = getPosterUrl(movie.poster_path);
            const releaseYear = movie.release_date ? movie.release_date.split('-')[0] : '';
            return (
              <div
                key={movie.movie_id}
                className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors cursor-pointer"
                onClick={() => {
                  onSelectMovie(movie);
                  onClose();
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-16 rounded-md overflow-hidden bg-zinc-900 flex-shrink-0 border border-white/5">
                    {posterUrl ? (
                      <img src={posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        <Film className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-zinc-100 group-hover:text-amber-400 truncate">
                      {movie.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5 font-mono">
                      <span>{releaseYear || 'N/A'}</span>
                      {movie.vote_average > 0 && (
                        <div className="flex items-center gap-1 text-amber-400">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{movie.vote_average.toFixed(1)}</span>
                        </div>
                      )}
                      {movie.genres_list?.[0] && (
                        <span className="text-[10px] text-zinc-500 truncate max-w-[120px]">
                          • {movie.genres_list[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onExploreSimilar(movie);
                      onClose();
                    }}
                    className="p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold flex items-center gap-1.5 border border-amber-500/20 transition-colors"
                    title="Find movies similar to this"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Similar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
