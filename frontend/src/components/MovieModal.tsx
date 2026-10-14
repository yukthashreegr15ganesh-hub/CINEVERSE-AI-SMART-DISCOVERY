import React, { useEffect, useState } from 'react';
import { X, Star, Sparkles, Bookmark, Calendar, Users, Film, ArrowRight } from 'lucide-react';
import type { Movie, MovieRecommendation } from '../types/movie';
import { api, getBackdropUrl, getPosterUrl } from '../services/api';
import { PosterFallback } from './PosterFallback';
import { SimilarityBadge } from './SimilarityBadge';

interface MovieModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
  onExploreSimilar: (movie: Movie) => void;
  onToggleWatchlist: (movie: Movie) => void;
  isWatchlisted?: boolean;
}

export const MovieModal: React.FC<MovieModalProps> = ({
  movie,
  isOpen,
  onClose,
  onExploreSimilar,
  onToggleWatchlist,
  isWatchlisted = false,
}) => {
  const [inlineRecs, setInlineRecs] = useState<MovieRecommendation[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [posterError, setPosterError] = useState(false);

  useEffect(() => {
    if (movie && isOpen) {
      setLoadingRecs(true);
      setPosterError(false);
      api.getSimilarMovies(movie.movie_id, 4)
        .then((res) => setInlineRecs(res.recommendations || []))
        .catch((err) => {
          console.error('Failed to load modal similar movies:', err);
          setInlineRecs([]);
        })
        .finally(() => setLoadingRecs(false));
    } else {
      setInlineRecs([]);
    }
  }, [movie, isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const [backdropError, setBackdropError] = useState(false);

  useEffect(() => {
    setBackdropError(false);
  }, [movie?.movie_id]);

  if (!isOpen || !movie) return null;

  const rawBackdrop = getBackdropUrl(movie.backdrop_path);
  const posterUrl = getPosterUrl(movie.poster_path);
  const activeBackdrop = !backdropError && rawBackdrop ? rawBackdrop : posterUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-lg overflow-y-auto animate-fadeIn">
      {/* Background click to dismiss */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-[#0b0e17] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Backdrop Banner Area */}
        <div className="relative w-full h-56 sm:h-72 md:h-80 overflow-hidden bg-zinc-950 flex-shrink-0">
          {activeBackdrop ? (
            <img
              src={activeBackdrop}
              alt={movie.title}
              onError={() => setBackdropError(true)}
              className="w-full h-full object-cover object-top opacity-60"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-zinc-900 to-zinc-950 flex items-center justify-center">
              <Film className="w-16 h-16 text-zinc-800" />
            </div>
          )}

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e17] via-[#0b0e17]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0e17] via-transparent to-transparent" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/70 hover:bg-black text-zinc-300 hover:text-white border border-white/10 transition-colors shadow-lg active:scale-95"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 md:p-8 -mt-24 sm:-mt-32 relative z-10 overflow-y-auto space-y-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Poster Thumbnail */}
            <div className="w-32 sm:w-44 md:w-52 aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 border-2 border-white/10 shadow-2xl flex-shrink-0">
              {!posterError && posterUrl ? (
                <img
                  src={posterUrl}
                  alt={movie.title}
                  onError={() => setPosterError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <PosterFallback title={movie.title} genres={movie.genres} />
              )}
            </div>

            {/* Movie Info */}
            <div className="flex-1 space-y-3 pt-2">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {movie.vote_average > 0 && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{movie.vote_average.toFixed(1)} / 10</span>
                  </div>
                )}
                {movie.vote_count > 0 && (
                  <div className="flex items-center gap-1 text-zinc-400 font-mono text-xs">
                    <Users className="w-3.5 h-3.5" />
                    <span>{movie.vote_count.toLocaleString()} votes</span>
                  </div>
                )}
                {movie.release_date && (
                  <div className="flex items-center gap-1 text-zinc-400 font-mono text-xs">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{movie.release_date}</span>
                  </div>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {movie.title}
              </h2>

              {/* Genres */}
              {movie.genres_list && movie.genres_list.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {movie.genres_list.map((g) => (
                    <span
                      key={g}
                      className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-white/10 text-zinc-300 border border-white/10"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {/* Synopsis */}
              <div className="space-y-1.5 pt-1">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Overview</h4>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {movie.overview || 'No synopsis is currently available for this film in the catalog.'}
                </p>
              </div>

              {/* Keywords / Content Tags */}
              {movie.keywords_list && movie.keywords_list.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Content Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {movie.keywords_list.slice(0, 8).map((k) => (
                      <span
                        key={k}
                        className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-900 text-zinc-400 border border-white/5"
                      >
                        #{k}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    onExploreSimilar(movie);
                    onClose();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all active:scale-95"
                >
                  <Sparkles className="w-4 h-4 fill-black" />
                  <span>Find Similar Movies</span>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleWatchlist(movie)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium border flex items-center gap-2 transition-all active:scale-95 ${
                    isWatchlisted
                      ? 'bg-amber-500 text-black border-amber-400 font-semibold'
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isWatchlisted ? 'fill-current' : ''}`} />
                  <span>{isWatchlisted ? 'In Watchlist' : 'Add to Watchlist'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick "More Like This" Section in Modal */}
          <div className="pt-6 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Content-Based Similarity Matches</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  onExploreSimilar(movie);
                  onClose();
                }}
                className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-mono"
              >
                <span>Deep Vector Analysis</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {loadingRecs && (
              <div className="h-28 flex items-center justify-center text-xs text-zinc-500">
                Computing similarity vectors...
              </div>
            )}

            {!loadingRecs && inlineRecs.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {inlineRecs.map((rec) => {
                  const rPoster = getPosterUrl(rec.poster_path);
                  return (
                    <div
                      key={rec.movie_id}
                      onClick={() => {
                        onExploreSimilar(rec);
                        onClose();
                      }}
                      className="group p-2 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/5 hover:border-amber-400/30 transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div className="aspect-[2/3] w-full rounded-lg overflow-hidden bg-zinc-950 mb-2 relative">
                        {rPoster ? (
                          <img src={rPoster} alt={rec.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <PosterFallback title={rec.title} />
                        )}
                        <div className="absolute top-1.5 left-1.5">
                          <SimilarityBadge score={rec.similarity_score} percentage={rec.similarity_percentage} size="sm" />
                        </div>
                      </div>
                      <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-amber-400 truncate">
                        {rec.title}
                      </h4>
                      <p className="text-[10px] text-zinc-500 font-mono">
                        {rec.release_date ? rec.release_date.split('-')[0] : ''}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
