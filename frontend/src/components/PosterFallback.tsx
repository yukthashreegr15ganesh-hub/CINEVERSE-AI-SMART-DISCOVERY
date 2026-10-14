import React from 'react';
import { Film } from 'lucide-react';

interface PosterFallbackProps {
  title: string;
  genres?: string;
  className?: string;
}

export const PosterFallback: React.FC<PosterFallbackProps> = ({ title, className = '' }) => {
  return (
    <div
      className={`relative w-full h-full min-h-[200px] bg-gradient-to-b from-zinc-900 via-[#0a0d15] to-[#06080d] flex flex-col items-center justify-center p-4 text-center select-none overflow-hidden ${className}`}
    >
      {/* Background ambient radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent opacity-60" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

      {/* Centerpiece Minimalist Icon & Title */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-3 px-2 pt-6 pb-4 max-w-full">
        <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
          <Film className="w-5 h-5 text-amber-400/80" />
        </div>
        <h4 className="text-xs sm:text-sm font-bold text-zinc-200 line-clamp-3 leading-snug tracking-wide">
          {title}
        </h4>
        <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-mono">
          Featured Title
        </span>
      </div>
    </div>
  );
};
