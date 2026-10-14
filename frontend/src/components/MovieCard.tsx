import React, { useState, useEffect } from 'react';
import { Star, Bookmark, Sparkles, Eye } from 'lucide-react';
import type { Movie, MovieRecommendation } from '../types/movie';
import { getPosterUrl } from '../services/api';
import { PosterFallback } from './PosterFallback';
import { SimilarityBadge } from './SimilarityBadge';

interface MovieCardProps {
  movie: Movie | MovieRecommendation;
  onSelect: (movie: Movie) => void;
  onExploreSimilar?: (movie: Movie) => void;
  onToggleWatchlist?: (movie: Movie) => void;
  isWatchlisted?: boolean;
  priority?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onSelect,
  onExploreSimilar,
  onToggleWatchlist,
  isWatchlisted = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const posterUrl = getPosterUrl(movie.poster_path);
  const releaseYear = movie.release_date ? movie.release_date.split('-')[0] : '';
  const isRecommendation = 'similarity_score' in movie;
  const primaryGenre = movie.genres_list?.[0] || movie.genres?.split('|')[0] || '';

  // Reset error flag if poster path changes
  useEffect(() => {
    setImageError(false);
  }, [movie.poster_path]);

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleWatchlist?.(movie);
  };

  const handleSimilarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onExploreSimilar?.(movie);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(movie)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(movie);
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col flex-shrink-0 w-[170px] sm:w-[190px] md:w-[210px] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 transform hover:-translate-y-2 hover:shadow-[0_20px_35px_-10px_rgba(0,0,0,0.85)] border border-white/5 hover:border-amber-500/30 bg-[#0d101a] focus:outline-none focus:ring-2 focus:ring-amber-400/60"
    >
      {/* Poster Media Box */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-950">
        {!imageError && posterUrl ? (
          <img
            src={posterUrl}
            alt={movie.title}
            loading="lazy"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <PosterFallback title={movie.title} genres={movie.genres} />
        )}

        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-transparent to-black/30 opacity-70 group-hover:opacity-90 transition-opacity pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10 pointer-events-none">
          {/* Similarity score badge if recommendation */}
          <div className="pointer-events-auto">
            {isRecommendation ? (
              <SimilarityBadge
                score={(movie as MovieRecommendation).similarity_score}
                percentage={(movie as MovieRecommendation).similarity_percentage}
                size="sm"
              />
            ) : (
              primaryGenre && (
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/75 text-zinc-200 backdrop-blur-md border border-white/10 shadow-sm">
                  {primaryGenre}
                </span>
              )
            )}
          </div>

          {/* Watchlist Bookmark Button */}
          <button
            type="button"
            onClick={handleWatchlistClick}
            aria-label={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
            className={`pointer-events-auto p-1.5 rounded-full backdrop-blur-md border transition-all duration-200 ${
              isWatchlisted
                ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                : 'bg-black/75 text-zinc-300 border-white/15 hover:text-white hover:bg-black hover:border-amber-400/50'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isWatchlisted ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Hover Quick Actions Overlay */}
        <div
          className={`absolute inset-x-2 bottom-2 z-20 flex flex-col gap-1.5 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          <button
            type="button"
            onClick={handleSimilarClick}
            className="w-full py-1.5 px-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg transition-transform active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Find Similar</span>
          </button>
          <button
            type="button"
            onClick={() => onSelect(movie)}
            className="w-full py-1.5 px-2 rounded-lg bg-black/70 hover:bg-black/90 text-zinc-200 text-xs font-medium backdrop-blur-md border border-white/10 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Card Metadata Footer */}
      <div className="p-3 flex flex-col gap-1 bg-[#0c0f18] flex-1 justify-between border-t border-white/5">
        <h3
          className="text-xs sm:text-sm font-semibold text-zinc-100 group-hover:text-amber-400 transition-colors line-clamp-1"
          title={movie.title}
        >
          {movie.title}
        </h3>

        <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
          <span>{releaseYear || 'N/A'}</span>
          {movie.vote_average > 0 && (
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{movie.vote_average.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
