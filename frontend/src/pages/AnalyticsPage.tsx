import React, { useState, useEffect } from 'react';
import { BarChart3, Binary, BrainCircuit, Sparkles, Sigma, Layers, Award } from 'lucide-react';
import type { AnalyticsSummary, ComparisonResponse, Movie } from '../types/movie';
import { api } from '../services/api';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [movieAId, setMovieAId] = useState<number>(1); // Inception
  const [movieBId, setMovieBId] = useState<number>(2); // Interstellar
  const [liveComparison, setLiveComparison] = useState<ComparisonResponse | null>(null);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [summary, moviesRes] = await Promise.all([
          api.getAnalyticsSummary(),
          api.getMovies({ limit: 100, sort_by: 'popularity_desc' }),
        ]);
        setAnalytics(summary);
        setAllMovies(moviesRes.items);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      }
    }
    loadData();
  }, []);

  // Update live comparison when pair changes
  useEffect(() => {
    if (!movieAId || !movieBId) return;
    setComparing(true);
    api.compareMovies(movieAId, movieBId)
      .then((comp) => setLiveComparison(comp))
      .catch((err) => console.error('Live comparison error:', err))
      .finally(() => setComparing(false));
  }, [movieAId, movieBId]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header */}
      <div className="space-y-3 border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-xs">
          <BrainCircuit className="w-3.5 h-3.5" />
          <span>Machine Learning Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Visual Analytics & Algorithm Mechanics
        </h1>
        <p className="text-sm text-zinc-300 max-w-3xl leading-relaxed">
          Explore the mathematical foundations of Content-Based Filtering used in <strong>Cineverse Discovery</strong>. Learn how text metadata transforms into high-dimensional numerical feature spaces and how cosine similarity detects semantic alignment.
        </p>
      </div>

      {/* Vector Space Metrics Overview Cards */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0c0f18] border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-mono uppercase">Total Documents</span>
              <Layers className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">
              {analytics.total_movies}
            </p>
            <p className="text-[11px] text-zinc-500">Curated movies in catalog</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#0c0f18] border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-mono uppercase">TF-IDF Vocabulary</span>
              <Binary className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">
              {analytics.vocabulary_size}
            </p>
            <p className="text-[11px] text-zinc-500">Unigrams + Bigrams extracted</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#0c0f18] border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-mono uppercase">Matrix Sparsity</span>
              <BarChart3 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">
              {analytics.sparsity_percentage}%
            </p>
            <p className="text-[11px] text-zinc-500">Zero entries in sparse matrix</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#0c0f18] border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-mono uppercase">Feature Dimension</span>
              <Sigma className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {analytics.matrix_shape[0]} × {analytics.matrix_shape[1]}
            </p>
            <p className="text-[11px] text-zinc-500">Rows × Columns (Docs × Terms)</p>
          </div>
        </div>
      )}

      {/* Conceptual Explanation: TF-IDF & Cosine Similarity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* TF-IDF Box */}
        <div className="p-6 rounded-2xl bg-[#0d101a] border border-white/10 space-y-4">
          <div className="flex items-center gap-2.5 text-amber-400 font-bold text-base">
            <Binary className="w-5 h-5" />
            <span>1. Term Frequency - Inverse Document Frequency (TF-IDF)</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            TF-IDF measures the statistical significance of a word in a specific movie's metadata relative to the entire movie catalog. Rare, specific keywords (like <em>wormhole</em>, <em>heist</em>, <em>cyberpunk</em>) receive higher weights than generic filler words.
          </p>
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-white/5 font-mono text-xs text-amber-300 space-y-1">
            <div className="text-zinc-500 uppercase text-[10px]">Mathematical Formula:</div>
            <div>TF-IDF(t, d, D) = TF(t, d) × log( (1 + |D|) / (1 + DF(t, D)) ) + 1</div>
          </div>
          <p className="text-[11px] text-zinc-400">
            • <strong>TF(t, d)</strong>: Number of times term <em>t</em> occurs in movie <em>d</em>.
            <br />
            • <strong>DF(t, D)</strong>: Number of movies in the catalog containing term <em>t</em>.
          </p>
        </div>

        {/* Cosine Similarity Box */}
        <div className="p-6 rounded-2xl bg-[#0d101a] border border-white/10 space-y-4">
          <div className="flex items-center gap-2.5 text-cyan-400 font-bold text-base">
            <Sigma className="w-5 h-5" />
            <span>2. Vector Cosine Similarity Metric</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Instead of measuring absolute document length, Cosine Similarity calculates the cosine of the angle between two multi-dimensional feature vectors. Two movies with similar thematic proportions point in the same direction in vector space regardless of plot length.
          </p>
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-white/5 font-mono text-xs text-cyan-300 space-y-1">
            <div className="text-zinc-500 uppercase text-[10px]">Mathematical Formula:</div>
            <div>cos(θ) = ( A · B ) / ( ||A||₂ × ||B||₂ )</div>
          </div>
          <p className="text-[11px] text-zinc-400">
            • Range: <strong>0.0</strong> (completely orthogonal, zero overlap) to <strong>1.0</strong> (identical thematic distribution).
            <br />
            • Normalized: L2-norm is applied so dot product directly yields cosine similarity.
          </p>
        </div>
      </div>

      {/* Interactive Two-Movie Vector Comparison Lab */}
      <div className="p-6 rounded-2xl bg-[#0c0f18] border border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Interactive Two-Movie Vector Dot Product Inspector</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Select two movies to inspect their live cosine angle and see exact term contribution weights.
            </p>
          </div>
        </div>

        {/* Movie Pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-zinc-400 uppercase">Movie Vector A</label>
            <select
              value={movieAId}
              onChange={(e) => setMovieAId(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              {allMovies.map((m) => (
                <option key={m.movie_id} value={m.movie_id}>
                  {m.title} ({m.release_date?.split('-')[0]})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-zinc-400 uppercase">Movie Vector B</label>
            <select
              value={movieBId}
              onChange={(e) => setMovieBId(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {allMovies.map((m) => (
                <option key={m.movie_id} value={m.movie_id}>
                  {m.title} ({m.release_date?.split('-')[0]})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Comparison Output */}
        {comparing ? (
          <div className="py-12 text-center text-xs text-zinc-400 animate-pulse">
            Computing high-dimensional dot product...
          </div>
        ) : liveComparison ? (
          <div className="space-y-5">
            {/* Score Highlight Display */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-zinc-900 to-cyan-500/10 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-zinc-400 uppercase">Calculated Cosine Similarity</span>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-0.5">
                  {liveComparison.similarity_score}{' '}
                  <span className="text-base font-normal text-amber-400">
                    ({liveComparison.similarity_percentage}%)
                  </span>
                </div>
              </div>

              {/* Angle visual gauge */}
              <div className="text-right">
                <span className="text-xs font-mono text-zinc-400 uppercase">Vector Alignment Angle θ</span>
                <div className="text-lg font-mono font-bold text-zinc-200">
                  {Math.round(Math.acos(Math.min(1.0, liveComparison.similarity_score)) * (180 / Math.PI))}° degrees
                </div>
              </div>
            </div>

            {/* Overlapping Genres and Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-zinc-950 border border-white/5 space-y-1.5">
                <span className="font-bold text-zinc-300">Shared Genres:</span>
                <div className="flex flex-wrap gap-1">
                  {liveComparison.shared_genres.length > 0 ? (
                    liveComparison.shared_genres.map((g) => (
                      <span key={g} className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-medium">
                        {g}
                      </span>
                    ))
                  ) : (
                    <span className="text-zinc-500 italic">No exact genre overlap</span>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-white/5 space-y-1.5">
                <span className="font-bold text-zinc-300">Shared Keyword Descriptors:</span>
                <div className="flex flex-wrap gap-1">
                  {liveComparison.shared_keywords.length > 0 ? (
                    liveComparison.shared_keywords.map((k) => (
                      <span key={k} className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[11px]">
                        #{k}
                      </span>
                    ))
                  ) : (
                    <span className="text-zinc-500 italic">No exact keyword overlap</span>
                  )}
                </div>
              </div>
            </div>

            {/* Term Contribution Breakdown */}
            {liveComparison.top_contributing_terms.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Terms Contributing to Cosine Dot Product:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {liveComparison.top_contributing_terms.map((t) => (
                    <div
                      key={t.term}
                      className="p-2.5 rounded-lg bg-zinc-900 border border-white/5 text-xs font-mono flex items-center justify-between"
                    >
                      <span className="text-amber-300 font-semibold">{t.term}</span>
                      <span className="text-emerald-400 font-bold">+{t.contribution}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Top TF-IDF Terms in Entire Dataset */}
      {analytics && analytics.top_tfidf_terms && (
        <div className="p-6 rounded-2xl bg-[#0c0f18] border border-white/10 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>Highest Weighted TF-IDF Term Tokens Across Catalog</span>
          </h3>
          <p className="text-xs text-zinc-400">
            These terms represent the most influential keywords determining similarity clusters across the catalog:
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {analytics.top_tfidf_terms.map((item) => (
              <div
                key={item.term}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs font-mono flex items-center gap-2"
              >
                <span className="text-white font-medium">{item.term}</span>
                <span className="text-amber-400 text-[10px] bg-amber-500/10 px-1.5 py-0.5 rounded">
                  {item.mean_tfidf}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
