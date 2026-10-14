import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import type { Movie } from './types/movie';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { MovieModal } from './components/MovieModal';
import { SearchModal } from './components/SearchModal';
import { HomePage } from './pages/HomePage';
import { DiscoverPage } from './pages/DiscoverPage';
import { SimilarMoviesPage } from './pages/SimilarMoviesPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

export const App: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMovieForModal, setSelectedMovieForModal] = useState<Movie | null>(null);
  const [movieForSimilarPage, setMovieForSimilarPage] = useState<Movie | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [watchlistIds, setWatchlistIds] = useState<Set<number>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync watchlist on initial mount
  const syncWatchlist = async () => {
    try {
      const items = await api.getWatchlist();
      setWatchlistIds(new Set(items.map((i) => i.movie_id)));
    } catch (err) {
      console.warn('Backend not currently reachable for watchlist sync:', err);
    }
  };

  useEffect(() => {
    syncWatchlist();
  }, []);

  // Keyboard shortcut '/' to trigger search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleWatchlist = async (movie: Movie) => {
    const isCurrentlyIn = watchlistIds.has(movie.movie_id);
    try {
      if (isCurrentlyIn) {
        await api.removeFromWatchlist(movie.movie_id);
        setWatchlistIds((prev) => {
          const updated = new Set(prev);
          updated.delete(movie.movie_id);
          return updated;
        });
        showToast(`Removed "${movie.title}" from Watchlist`);
      } else {
        await api.addToWatchlist(movie.movie_id);
        setWatchlistIds((prev) => new Set(prev).add(movie.movie_id));
        showToast(`Added "${movie.title}" to Watchlist`);
      }
    } catch (err) {
      console.error('Watchlist toggle error:', err);
      showToast('Could not update watchlist. Please check backend connection.');
    }
  };

  const handleExploreSimilar = (movie: Movie) => {
    setMovieForSimilarPage(movie);
    navigate('/similar');
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 flex flex-col selection:bg-amber-500 selection:text-black">
      {/* Navigation */}
      <Navbar
        watchlistCount={watchlistIds.size}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                onSelectMovie={(m) => setSelectedMovieForModal(m)}
                onExploreSimilar={handleExploreSimilar}
                onToggleWatchlist={handleToggleWatchlist}
                watchlistIds={watchlistIds}
              />
            }
          />
          <Route
            path="/discover"
            element={
              <DiscoverPage
                onSelectMovie={(m) => setSelectedMovieForModal(m)}
                onExploreSimilar={handleExploreSimilar}
                onToggleWatchlist={handleToggleWatchlist}
                watchlistIds={watchlistIds}
              />
            }
          />
          <Route
            path="/similar"
            element={
              <SimilarMoviesPage
                initialMovie={movieForSimilarPage}
                onSelectMovie={(m) => setSelectedMovieForModal(m)}
                onToggleWatchlist={handleToggleWatchlist}
                watchlistIds={watchlistIds}
              />
            }
          />
          <Route
            path="/watchlist"
            element={
              <WatchlistPage
                onSelectMovie={(m) => setSelectedMovieForModal(m)}
                onExploreSimilar={handleExploreSimilar}
                onWatchlistChanged={syncWatchlist}
              />
            }
          />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Modals */}
      <MovieModal
        movie={selectedMovieForModal}
        isOpen={!!selectedMovieForModal}
        onClose={() => setSelectedMovieForModal(null)}
        onExploreSimilar={handleExploreSimilar}
        onToggleWatchlist={handleToggleWatchlist}
        isWatchlisted={selectedMovieForModal ? watchlistIds.has(selectedMovieForModal.movie_id) : false}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectMovie={(m) => setSelectedMovieForModal(m)}
        onExploreSimilar={handleExploreSimilar}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-amber-500 text-black font-semibold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
export default App;
