import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Compass, Sparkles, Bookmark, Search, BarChart3, Menu, X, Film } from 'lucide-react';

interface NavbarProps {
  watchlistCount: number;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ watchlistCount, onOpenSearch }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/discover', label: 'Discover', icon: Compass },
    { to: '/similar', label: 'Explore Similar', icon: Sparkles },
    { to: '/watchlist', label: 'My Watchlist', icon: Bookmark, badge: watchlistCount },
    { to: '/analytics', label: 'Algorithm Insights', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-nav backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-200 p-[1px] shadow-[0_0_20px_rgba(245,158,11,0.35)] group-hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all">
            <div className="w-full h-full bg-[#080a10] rounded-[11px] flex items-center justify-center">
              <Film className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-wider bg-gradient-to-r from-white via-zinc-200 to-amber-300 bg-clip-text text-transparent">
              CINEVERSE
            </span>
            <span className="text-[9px] font-mono tracking-widest uppercase text-amber-400/90 -mt-1 font-semibold">
              DISCOVERY
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `relative px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? 'text-white bg-white/10 shadow-inner border border-white/10'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span>{link.label}</span>
                {link.badge !== undefined && link.badge > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[11px] font-mono font-bold bg-amber-500 text-black">
                    {link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Right Search Action + Mobile Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white text-sm transition-all shadow-sm active:scale-95 group"
            aria-label="Search movies"
          >
            <Search className="w-4 h-4 text-zinc-400 group-hover:text-amber-400 transition-colors" />
            <span className="hidden sm:inline text-xs text-zinc-400">Search movies...</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 bg-white/5 rounded border border-white/10">
              /
            </kbd>
          </button>

          {/* Mobile hamburger menu */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-white/10 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'text-white bg-white/10 border border-white/10'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  {Icon && <Icon className="w-4 h-4 text-amber-400" />}
                  <span>{link.label}</span>
                </div>
                {link.badge !== undefined && link.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500 text-black">
                    {link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      )}
    </header>
  );
};
