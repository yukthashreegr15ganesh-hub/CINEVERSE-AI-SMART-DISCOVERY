import React, { useEffect, useState } from 'react';
import { Sparkles, Flame, Trophy, Compass, Film, Zap } from 'lucide-react';
import type { Movie, MovieRecommendation } from '../types/movie';
import { api } from '../services/api';
import { HeroSection } from '../components/HeroSection';
import { MovieCarousel } from '../components/MovieCarousel';

interface HomePageProps {
  onSelectMovie: (movie: Movie) => void;
  onExploreSimilar: (movie: Movie) => void;
  onToggleWatchlist: (movie: Movie) => void;
  watchlistIds: Set<number>;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectMovie,
  onExploreSimilar,
  onToggleWatchlist,
  watchlistIds,
}) => {
  const [featured, setFeatured] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [sciFi, setSciFi] = useState<Movie[]>([]);
  const [thrillers, setThrillers] = useState<Movie[]>([]);
  const [animation, setAnimation] = useState<Movie[]>([]);
  const [sampleRecs, setSampleRecs] = useState<MovieRecommendation[]>([]);
  const [selectedAnchor, setSelectedAnchor] = useState<Movie | null>(null);

  useEffect(() => {
    async function loadCatalog() {
      try {
        // Load popular
        const popRes = await api.getMovies({ sort_by: 'popularity_desc', limit: 12 });
        setPopular(popRes.items);
        setFeatured(popRes.items.slice(0, 5));

        // Load top rated
        const topRes = await api.getMovies({ sort_by: 'rating_desc', limit: 12 });
        setTopRated(topRes.items);

        // Load Sci-Fi
        const sciFiRes = await api.getMovies({ genre: 'Science Fiction', limit: 12 });
        setSciFi(sciFiRes.items);

        // Load Thrillers
        const thrillRes = await api.getMovies({ genre: 'Thriller', limit: 12 });
        setThrillers(thrillRes.items);

        // Load Animation
        const animRes = await api.getMovies({ genre: 'Animation', limit: 12 });
        setAnimation(animRes.items);

        // Load initial recommendation for an iconic anchor movie (Inception or Dune)
        if (popRes.items.length > 0) {
          const anchor = popRes.items[0];
          setSelectedAnchor(anchor);
          const recRes = await api.getSimilarMovies(anchor.movie_id, 8);
          setSampleRecs(recRes.recommendations);
        }
      } catch (err) {
        console.error('Failed to load homepage movie streams:', err);
      }
    }

    loadCatalog();
  }, []);

  return (
    <div className="w-full min-h-screen space-y-6 pb-12">
      {/* Cinematic Hero */}
      <HeroSection
        featuredMovies={featured}
        onSelectMovie={onSelectMovie}
        onExploreSimilar={onExploreSimilar}
        onToggleWatchlist={onToggleWatchlist}
        watchlistIds={watchlistIds}
      />

      {/* Content-Based Recommendation Highlight Stream */}
      {selectedAnchor && sampleRecs.length > 0 && (
        <div className="pt-2 px-2">
          <div className="max-w-7xl mx-auto rounded-2xl bg-gradient-to-r from-amber-950/20 via-zinc-900/60 to-cyan-950/20 border border-amber-500/20 p-2 shadow-2xl">
            <div className="px-4 pt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    Recommended for Fans of <span className="text-amber-400">"{selectedAnchor.title}"</span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Calculated using cosine similarity across genre tags, synopses, and thematic keywords.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onExploreSimilar(selectedAnchor)}
                className="text-xs font-mono text-amber-400 hover:text-amber-300 underline"
              >
                Inspect Vector Matches →
              </button>
            </div>

            <MovieCarousel
              title=""
              movies={sampleRecs}
              onSelectMovie={onSelectMovie}
              onExploreSimilar={onExploreSimilar}
              onToggleWatchlist={onToggleWatchlist}
              watchlistIds={watchlistIds}
            />
          </div>
        </div>
      )}

      {/* Popular Movies Stream */}
      <MovieCarousel
        title="Popular in Cineverse"
        subtitle="Most explored titles across our curated catalog"
        icon={Flame}
        movies={popular}
        onSelectMovie={onSelectMovie}
        onExploreSimilar={onExploreSimilar}
        onToggleWatchlist={onToggleWatchlist}
        watchlistIds={watchlistIds}
      />

      {/* Top Rated Stream */}
      <MovieCarousel
        title="Top Rated Masterpieces"
        subtitle="Critically acclaimed films with the highest rating scores"
        icon={Trophy}
        movies={topRated}
        onSelectMovie={onSelectMovie}
        onExploreSimilar={onExploreSimilar}
        onToggleWatchlist={onToggleWatchlist}
        watchlistIds={watchlistIds}
      />

      {/* Sci-Fi Stream */}
      <MovieCarousel
        title="Cosmic & Science Fiction Horizons"
        subtitle="Mind-bending realities, space travel, and futuristic epics"
        icon={Zap}
        movies={sciFi}
        onSelectMovie={onSelectMovie}
        onExploreSimilar={onExploreSimilar}
        onToggleWatchlist={onToggleWatchlist}
        watchlistIds={watchlistIds}
      />

      {/* Thrillers Stream */}
      <MovieCarousel
        title="Edge-of-Your-Seat Thrillers & Mystery"
        subtitle="Complex investigations, psychological twists, and high stakes"
        icon={Film}
        movies={thrillers}
        onSelectMovie={onSelectMovie}
        onExploreSimilar={onExploreSimilar}
        onToggleWatchlist={onToggleWatchlist}
        watchlistIds={watchlistIds}
      />

      {/* Animation Stream */}
      <MovieCarousel
        title="Animated Dimensions & Fantasy"
        subtitle="Visionary worlds and timeless storytelling from top animation studios"
        icon={Compass}
        movies={animation}
        onSelectMovie={onSelectMovie}
        onExploreSimilar={onExploreSimilar}
        onToggleWatchlist={onToggleWatchlist}
        watchlistIds={watchlistIds}
      />
    </div>
  );
};
