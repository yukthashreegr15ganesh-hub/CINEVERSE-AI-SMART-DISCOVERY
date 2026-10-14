import React, { useState, useEffect } from 'react';
import { Star, Sparkles, Bookmark, Info } from 'lucide-react';
import type { Movie } from '../types/movie';
import { getBackdropUrl, getPosterUrl } from '../services/api';

interface HeroSectionProps {
  featuredMovies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  onExploreSimilar: (movie: Movie) => void;
  onToggleWatchlist: (movie: Movie) => void;
  watchlistIds?: Set<number>;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  featuredMovies,
  onSelectMovie,
  onExploreSimilar,
  onToggleWatchlist,
  watchlistIds = new Set(),
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [backdropError, setBackdropError] = useState(false);

  const movie = featuredMovies[currentIndex] || featuredMovies[0];

  useEffect(() => {
    setBackdropError(false);
  }, [movie?.movie_id]);

  if (!featuredMovies || featuredMovies.length === 0) {
    return (
      <div className="relative w-full h-[480px] bg-zinc-950 flex items-center justify-center border-b border-white/5">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-48 h-8 bg-zinc-800 rounded" />
          <div className="w-96 h-4 bg-zinc-800 rounded" />
        </div>
      </div>
    );
  }

  const isWatchlisted = watchlistIds.has(movie.movie_id);
  const rawBackdrop = getBackdropUrl(movie.backdrop_path);
  const rawPoster = getPosterUrl(movie.poster_path);
  const activeImage = !backdropError && rawBackdrop ? rawBackdrop : rawPoster;
  const releaseYear = movie.release_date ? movie.release_date.split('-')[0] : '';

  return (
    <div className="relative w-full min-h-[520px] lg:h-[620px] overflow-hidden bg-black flex items-center">
      {/* Background Artwork with Multi-stage Gradient Vignette */}
      {activeImage && (
        <div className="absolute inset-0 z-0">
          <img
            src={activeImage}
            alt={movie.title}
            onError={() => setBackdropError(true)}
            className="w-full h-full object-cover object-top opacity-50 filter contrast-110 brightness-90 transform scale-105 transition-all duration-700 ease-out"
          />
        </div>
      )}

      {/* Cinematic dark gradients: left fade, bottom fade, top fade */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#07090e] via-[#07090e]/80 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-transparent to-[#07090e]/60 z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(245,158,11,0.06),transparent_60%)] z-10" />

      {/* Hero Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full flex flex-col justify-center">
        <div className="max-w-2xl space-y-4">
          {/* Tag & Metadata */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono font-semibold tracking-wider uppercase border border-amber-500/30">
              Featured Discovery
            </span>
            {releaseYear && (
              <span className="text-zinc-400 font-mono font-medium">{releaseYear}</span>
            )}
            {movie.vote_average > 0 && (
              <div className="flex items-center gap-1 text-amber-400 font-mono font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{movie.vote_average.toFixed(1)}</span>
                <span className="text-zinc-500 text-[11px]">({movie.vote_count.toLocaleString()} votes)</span>
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white drop-shadow-md leading-tight">
            {movie.title}
          </h1>

          {/* Genre Badges */}
          {movie.genres_list && movie.genres_list.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {movie.genres_list.map((genre) => (
                <span
                  key={genre}
                  className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-white/10 text-zinc-300 backdrop-blur-md border border-white/10"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {/* Synopsis */}
          <p className="text-sm sm:text-base text-zinc-300/90 line-clamp-3 leading-relaxed drop-shadow">
            {movie.overview}
          </p>

          {/* Hero Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              type="button"
              onClick={() => onExploreSimilar(movie)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-bold text-sm flex items-center gap-2 shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all transform active:scale-95"
            >
              <Sparkles className="w-4 h-4 fill-black" />
              <span>Find Similar Movies</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectMovie(movie)}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm backdrop-blur-md border border-white/15 flex items-center gap-2 transition-all active:scale-95"
            >
              <Info className="w-4 h-4 text-zinc-300" />
              <span>Explore Movie</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleWatchlist(movie)}
              className={`p-2.5 rounded-xl backdrop-blur-md border transition-all active:scale-95 ${
                isWatchlisted
                  ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                  : 'bg-white/10 text-white border-white/15 hover:bg-white/20'
              }`}
              title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              <Bookmark className={`w-4 h-4 ${isWatchlisted ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Featured Movie Navigation Switcher */}
        {featuredMovies.length > 1 && (
          <div className="absolute right-4 sm:right-8 bottom-6 z-20 flex items-center gap-2">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest hidden sm:inline mr-2">
              Featured Titles
            </span>
            {featuredMovies.slice(0, 5).map((m, idx) => (
              <button
                key={m.movie_id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Switch to ${m.title}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? 'w-8 bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.8)]'
                    : 'w-2.5 bg-zinc-700 hover:bg-zinc-500'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
