import React, { useState, useEffect } from 'react';
import { Bookmark, Trash2, Sparkles, Film } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { WatchlistItem, Movie } from '../types/movie';
import { api, getPosterUrl } from '../services/api';
import { PosterFallback } from '../components/PosterFallback';

interface WatchlistPageProps {
  onSelectMovie: (movie: Movie) => void;
  onExploreSimilar: (movie: Movie) => void;
  onWatchlistChanged: () => void;
}

export const WatchlistPage: React.FC<WatchlistPageProps> = ({
  onSelectMovie,
  onExploreSimilar,
  onWatchlistChanged,
}) => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const data = await api.getWatchlist();
      setWatchlist(data);
    } catch (err) {
      console.error('Failed to load watchlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const handleRemove = async (movieId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.removeFromWatchlist(movieId);
      setWatchlist((prev) => prev.filter((item) => item.movie_id !== movieId));
      onWatchlistChanged();
    } catch (err) {
      console.error('Failed to remove from watchlist:', err);
    }
  };

  const toMovieObject = (item: WatchlistItem): Movie => {
    return {
      movie_id: item.movie_id,
      title: item.title,
      overview: item.overview || '',
      genres: item.genres || '',
      keywords: '',
      genres_list: item.genres ? item.genres.split('|') : [],
      keywords_list: [],
      release_date: item.release_date || '',
      vote_average: item.vote_average || 0.0,
      vote_count: 0,
      poster_path: item.poster_path || '',
      backdrop_path: item.backdrop_path || '',
      is_in_watchlist: true,
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="space-y-3 border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-xs">
          <Bookmark className="w-3.5 h-3.5 fill-current" />
          <span>Local SQLite Persistence</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          My Watchlist
        </h1>
        <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
          Movies saved to your private collection. Saved titles are persisted across sessions in the application's local SQLite database.
        </p>
      </div>

      {/* Watchlist Grid or Empty State */}
      {loading ? (
        <div className="py-24 text-center text-zinc-400 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Loading your saved movies...</p>
        </div>
      ) : watchlist.length === 0 ? (
        <div className="py-24 text-center rounded-2xl bg-zinc-900/30 border border-white/5 p-8 max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-zinc-600">
            <Bookmark className="w-8 h-8 text-zinc-500" />
          </div>
          <h3 className="text-xl font-bold text-white">Your Watchlist is Empty</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            You haven't bookmarked any movies yet. Explore popular movies or discover titles similar to your favorites and bookmark them to keep track.
          </p>
          <div className="pt-2">
            <Link
              to="/discover"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs shadow-lg transition-all"
            >
              <Film className="w-4 h-4" />
              <span>Browse Catalog</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>{watchlist.length} saved titles</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {watchlist.map((item) => {
              const posterUrl = getPosterUrl(item.poster_path);
              const releaseYear = item.release_date ? item.release_date.split('-')[0] : '';
              const movieObj = toMovieObject(item);

              return (
                <div
                  key={item.movie_id}
                  onClick={() => onSelectMovie(movieObj)}
                  className="group p-3 rounded-2xl bg-[#0c0f18] border border-white/10 hover:border-amber-500/30 transition-all cursor-pointer flex flex-col justify-between space-y-3 shadow-lg"
                >
                  <div className="flex gap-3 items-start">
                    <div className="w-20 aspect-[2/3] rounded-lg overflow-hidden bg-zinc-950 flex-shrink-0 border border-white/5">
                      {posterUrl ? (
                        <img src={posterUrl} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <PosterFallback title={item.title} genres={item.genres} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="text-sm font-bold text-white group-hover:text-amber-400 truncate">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-zinc-400 font-mono">
                        {releaseYear} • ★ {item.vote_average.toFixed(1)}
                      </p>
                      <p className="text-[11px] text-zinc-500 line-clamp-2">
                        {item.overview}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onExploreSimilar(movieObj);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Similar</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleRemove(item.movie_id, e)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors"
                      title="Remove from watchlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
