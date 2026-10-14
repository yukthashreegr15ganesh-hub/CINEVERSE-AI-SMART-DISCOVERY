import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Movie, MovieRecommendation } from '../types/movie';
import { MovieCard } from './MovieCard';

interface MovieCarouselProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  movies: (Movie | MovieRecommendation)[];
  onSelectMovie: (movie: Movie) => void;
  onExploreSimilar?: (movie: Movie) => void;
  onToggleWatchlist?: (movie: Movie) => void;
  watchlistIds?: Set<number>;
  actionButton?: React.ReactNode;
}

export const MovieCarousel: React.FC<MovieCarouselProps> = ({
  title,
  subtitle,
  icon: Icon,
  movies,
  onSelectMovie,
  onExploreSimilar,
  onToggleWatchlist,
  watchlistIds = new Set(),
  actionButton,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -600 : 600;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full py-4 space-y-3">
      {/* Header with Title and Nav controls */}
      <div className="flex items-end justify-between px-4 sm:px-6 md:px-8">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              {title}
            </h2>
            {subtitle && <p className="text-xs text-zinc-400 font-medium">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {actionButton}
          <div className="hidden sm:flex items-center gap-1.5 ml-2">
            <button
              type="button"
              onClick={() => scroll('left')}
              aria-label="Scroll left"
              className="p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 transition-colors shadow-md active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              aria-label="Scroll right"
              className="p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 transition-colors shadow-md active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel Track */}
      <div
        ref={scrollContainerRef}
        className="flex items-stretch gap-4 px-4 sm:px-6 md:px-8 overflow-x-auto no-scrollbar scroll-smooth py-2"
      >
        {movies.map((movie) => (
          <MovieCard
            key={`${movie.movie_id}-${'similarity_score' in movie ? (movie as MovieRecommendation).similarity_score : ''}`}
            movie={movie}
            onSelect={onSelectMovie}
            onExploreSimilar={onExploreSimilar}
            onToggleWatchlist={onToggleWatchlist}
            isWatchlisted={watchlistIds.has(movie.movie_id)}
          />
        ))}
      </div>
    </section>
  );
};
