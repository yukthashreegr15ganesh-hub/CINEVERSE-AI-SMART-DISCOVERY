import React, { useState, useEffect } from 'react';
import { Sparkles, Search, Sliders, Info, ChevronRight, BarChart2, Star } from 'lucide-react';
import type { Movie, MovieRecommendation, ComparisonResponse } from '../types/movie';
import { api, getPosterUrl } from '../services/api';
import { SimilarityBadge } from '../components/SimilarityBadge';
import { PosterFallback } from '../components/PosterFallback';

interface SimilarMoviesPageProps {
  initialMovie?: Movie | null;
  onSelectMovie: (movie: Movie) => void;
  onToggleWatchlist: (movie: Movie) => void;
  watchlistIds: Set<number>;
}

export const SimilarMoviesPage: React.FC<SimilarMoviesPageProps> = ({
  initialMovie,
  onSelectMovie,
}) => {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(initialMovie || null);
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [recommendations, setRecommendations] = useState<MovieRecommendation[]>([]);
  const [limit, setLimit] = useState<number>(8);
  const [loading, setLoading] = useState<boolean>(false);
  const [comparisonModal, setComparisonModal] = useState<ComparisonResponse | null>(null);

  // Load movie list for picker
  useEffect(() => {
    api.getMovies({ limit: 100, sort_by: 'popularity_desc' })
      .then((res) => {
        setAllMovies(res.items);
        if (!selectedMovie && res.items.length > 0) {
          setSelectedMovie(res.items[0]);
        }
      })
      .catch((err) => console.error('Failed to load movie picker:', err));
  }, []);

  // Update selected movie when prop changes
  useEffect(() => {
    if (initialMovie) {
      setSelectedMovie(initialMovie);
    }
  }, [initialMovie]);

  // Compute recommendations when selectedMovie or limit changes
  useEffect(() => {
    if (!selectedMovie) return;
    setLoading(true);
    api.getSimilarMovies(selectedMovie.movie_id, limit)
      .then((res) => {
        setRecommendations(res.recommendations);
      })
      .catch((err) => {
        console.error('Failed to compute recommendations:', err);
        setRecommendations([]);
      })
      .finally(() => setLoading(false));
  }, [selectedMovie, limit]);

  const handleDeepCompare = async (targetMovie: Movie) => {
    if (!selectedMovie) return;
    try {
      const comp = await api.compareMovies(selectedMovie.movie_id, targetMovie.movie_id);
      setComparisonModal(comp);
    } catch (err) {
      console.error('Comparison error:', err);
    }
  };

  const filteredMovies = allMovies.filter((m) =>
    m.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    m.genres.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Page Title & Explanation Notice */}
      <div className="space-y-3 border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Content-Based Similarity Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Explore Similar Movies
        </h1>
        <p className="text-sm text-zinc-300 max-w-3xl leading-relaxed">
          Select any film from the catalog to calculate real content-based similarity scores. Our machine learning pipeline vectorizes plot synopses, genre identifiers, and keyword tags using <strong>TF-IDF</strong> and ranks eligible movies by <strong>Cosine Similarity</strong>.
        </p>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Movie Selector & Selected Movie Card (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0c0f18] border border-white/10 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200 flex items-center justify-between">
              <span>Selected Reference Movie</span>
              <span className="text-[11px] font-mono text-amber-400">Anchor</span>
            </h3>

            {/* Movie Picker search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Find a movie to compare..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/50"
              />
            </div>

            {/* Quick Picker List */}
            {searchFilter && (
              <div className="max-h-48 overflow-y-auto space-y-1 p-1 bg-zinc-950 rounded-xl border border-white/10 text-xs">
                {filteredMovies.slice(0, 6).map((m) => (
                  <button
                    key={m.movie_id}
                    type="button"
                    onClick={() => {
                      setSelectedMovie(m);
                      setSearchFilter('');
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-white/10 flex items-center justify-between text-zinc-300 hover:text-white"
                  >
                    <span className="truncate">{m.title}</span>
                    <span className="text-[10px] text-zinc-500 font-mono ml-2">
                      {m.release_date?.split('-')[0]}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Selected Anchor Movie Preview */}
            {selectedMovie && (
              <div className="space-y-4 pt-2">
                <div className="flex gap-4 items-start">
                  <div className="w-24 aspect-[2/3] rounded-lg overflow-hidden bg-zinc-900 border border-white/10 flex-shrink-0 shadow-lg">
                    {getPosterUrl(selectedMovie.poster_path) ? (
                      <img
                        src={getPosterUrl(selectedMovie.poster_path)}
                        alt={selectedMovie.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <PosterFallback title={selectedMovie.title} />
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <h4 className="text-base font-bold text-white line-clamp-2">
                      {selectedMovie.title}
                    </h4>
                    <p className="text-xs text-zinc-400 font-mono">
                      {selectedMovie.release_date?.split('-')[0]} • ★ {selectedMovie.vote_average.toFixed(1)}
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {selectedMovie.genres_list?.slice(0, 3).map((g) => (
                        <span key={g} className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-zinc-300">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-zinc-300">
                  <span className="font-semibold text-zinc-400">Synopsis:</span>
                  <p className="line-clamp-3 text-zinc-400 leading-relaxed text-[11px]">
                    {selectedMovie.overview}
                  </p>
                </div>

                {selectedMovie.keywords_list?.length > 0 && (
                  <div className="space-y-1 text-xs">
                    <span className="font-semibold text-zinc-400">Key Descriptors:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedMovie.keywords_list.slice(0, 5).map((k) => (
                        <span key={k} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-900 text-zinc-400 border border-white/5">
                          #{k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Algorithm Notice Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-zinc-900/60 to-transparent border border-amber-500/20 text-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Info className="w-4 h-4" />
              <span>Scientific Content Notice</span>
            </div>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              These movies were ranked using calculated similarities across genres, plot synopses, and keyword descriptors. Similarity scores reflect textual metadata overlap, not subjective probability of viewer preference.
            </p>
          </div>
        </div>

        {/* Right Column: Recommendations Stream & Controls (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Controls Bar */}
          <div className="p-4 rounded-2xl bg-[#0c0f18] border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-300">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Recommendations to Return:</span>
              <div className="flex items-center gap-1.5 ml-2">
                {[4, 8, 12, 16].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setLimit(num)}
                    className={`px-2.5 py-1 rounded-lg font-mono text-xs transition-colors ${
                      limit === num
                        ? 'bg-amber-500 text-black font-bold'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-xs font-mono text-zinc-400">
              {recommendations.length} Results Computed
            </span>
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="py-24 text-center text-zinc-400 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm">Calculating cosine similarities in TF-IDF space...</p>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="py-20 text-center rounded-2xl bg-zinc-900/40 border border-white/5 p-6">
              <p className="text-sm text-zinc-400">No similar movies found for this selection.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendations.map((rec, index) => {
                const posterUrl = getPosterUrl(rec.poster_path);
                const releaseYear = rec.release_date ? rec.release_date.split('-')[0] : '';
                return (
                  <div
                    key={rec.movie_id}
                    className="p-4 rounded-2xl bg-[#0d101a] border border-white/10 hover:border-amber-500/30 transition-all space-y-3 shadow-lg flex flex-col justify-between"
                  >
                    {/* Top Row: Rank, Poster & Basic Info */}
                    <div className="flex gap-3.5 items-start">
                      {/* Poster */}
                      <div className="w-20 aspect-[2/3] rounded-lg overflow-hidden bg-zinc-950 flex-shrink-0 border border-white/10 shadow">
                        {posterUrl ? (
                          <img src={posterUrl} alt={rec.title} className="w-full h-full object-cover" />
                        ) : (
                          <PosterFallback title={rec.title} />
                        )}
                      </div>

                      {/* Info & Metrics */}
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                            Rank #{index + 1}
                          </span>
                          <SimilarityBadge
                            score={rec.similarity_score}
                            percentage={rec.similarity_percentage}
                            size="sm"
                          />
                        </div>

                        <h3
                          onClick={() => onSelectMovie(rec)}
                          className="text-sm sm:text-base font-bold text-white hover:text-amber-400 cursor-pointer truncate"
                          title={rec.title}
                        >
                          {rec.title}
                        </h3>

                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
                          <span>{releaseYear || 'N/A'}</span>
                          {rec.vote_average > 0 && (
                            <div className="flex items-center gap-1 text-amber-400">
                              <Star className="w-3 h-3 fill-amber-400" />
                              <span>{rec.vote_average.toFixed(1)}</span>
                            </div>
                          )}
                        </div>

                        <p className="text-[11px] text-zinc-400 line-clamp-2 leading-snug">
                          {rec.overview}
                        </p>
                      </div>
                    </div>

                    {/* Shared Content Badges */}
                    <div className="pt-2 border-t border-white/5 space-y-1.5 text-[11px]">
                      {rec.shared_genres && rec.shared_genres.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 text-zinc-400">
                          <span className="text-[10px] uppercase font-mono text-zinc-500">Shared Genres:</span>
                          {rec.shared_genres.map((g) => (
                            <span key={g} className="px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 font-medium">
                              {g}
                            </span>
                          ))}
                        </div>
                      )}

                      {rec.shared_keywords && rec.shared_keywords.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 text-zinc-400">
                          <span className="text-[10px] uppercase font-mono text-zinc-500">Shared Tags:</span>
                          {rec.shared_keywords.slice(0, 4).map((k) => (
                            <span key={k} className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 font-mono text-[10px]">
                              #{k}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleDeepCompare(rec)}
                        className="flex-1 py-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Vector Breakdown</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedMovie(rec)}
                        className="py-1.5 px-3 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Set as reference movie to find similar"
                      >
                        <span>Chain</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Deep Vector Comparison Modal */}
      {comparisonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg animate-fadeIn">
          <div className="fixed inset-0 -z-10" onClick={() => setComparisonModal(null)} />
          <div className="w-full max-w-2xl bg-[#0e121d] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-amber-400">
                <BarChart2 className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Mathematical Vector Breakdown</h3>
              </div>
              <button
                type="button"
                onClick={() => setComparisonModal(null)}
                className="text-zinc-400 hover:text-white text-xs font-mono px-2 py-1 bg-white/5 rounded border border-white/10"
              >
                Close
              </button>
            </div>

            {/* Movies Compared */}
            <div className="grid grid-cols-2 gap-4 p-3 rounded-xl bg-zinc-950 border border-white/5 text-center">
              <div>
                <p className="text-[11px] font-mono text-zinc-500 uppercase">Source Movie (A)</p>
                <p className="text-sm font-bold text-white truncate">{comparisonModal.source_movie.title}</p>
              </div>
              <div>
                <p className="text-[11px] font-mono text-zinc-500 uppercase">Target Movie (B)</p>
                <p className="text-sm font-bold text-white truncate">{comparisonModal.target_movie.title}</p>
              </div>
            </div>

            {/* Formula Banner */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center font-mono space-y-1">
              <div className="text-xs text-amber-400 font-bold">{comparisonModal.cosine_formula}</div>
              <div className="text-xl font-extrabold text-white">
                Similarity Score: {comparisonModal.similarity_score} ({comparisonModal.similarity_percentage}%)
              </div>
            </div>

            {/* Top Contributing Term Factors */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Top Contributing Feature Terms (Dot Product Weights)
              </h4>
              <div className="space-y-1.5">
                {comparisonModal.top_contributing_terms.map((item) => (
                  <div
                    key={item.term}
                    className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/60 border border-white/5 text-xs font-mono"
                  >
                    <span className="text-amber-300 font-semibold">{item.term}</span>
                    <div className="flex items-center gap-4 text-zinc-400">
                      <span>A: {item.source_weight}</span>
                      <span>B: {item.target_weight}</span>
                      <span className="text-emerald-400 font-bold">+ {item.contribution}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed bg-zinc-900/40 p-3 rounded-xl border border-white/5">
              {comparisonModal.explanation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
