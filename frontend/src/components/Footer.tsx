import React from 'react';
import { Film, Sparkles, BookOpen, Code } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#05070b] border-t border-white/5 py-12 px-4 sm:px-6 lg:px-8 mt-16 text-zinc-400">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        {/* Brand Col */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-300 p-[1px]">
              <div className="w-full h-full bg-black rounded-[7px] flex items-center justify-center">
                <Film className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-extrabold tracking-wider text-white">CINEVERSE</span>
              <span className="text-[9px] font-mono tracking-widest uppercase text-amber-400 font-semibold -mt-1">
                DISCOVERY
              </span>
            </div>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            A premium movie discovery engine driven by genuine Content-Based Filtering,
            TF-IDF vector space modeling, and Cosine Similarity metrics.
          </p>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono bg-zinc-900 border border-white/10 text-amber-300">
              <Code className="w-3.5 h-3.5" />
              <span>Project 22 • AIML Level 2</span>
            </span>
          </div>
        </div>

        {/* Algorithm Summary */}
        <div className="space-y-2.5 md:col-span-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Content-Based Recommendation Engine</span>
          </h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Recommendations are computed using Scikit-Learn's <code className="text-zinc-300 font-mono">TfidfVectorizer</code> fitted across combined movie metadata (genres, narrative overviews, and keyword tags). Movie similarity is computed by measuring the cosine angle between normalized document vectors in multidimensional feature space:
          </p>
          <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-white/5 font-mono text-[11px] text-zinc-300">
            cos(θ) = ( A · B ) / ( ||A|| ||B|| )
          </div>
          <p className="text-[11px] text-zinc-400">
            * Note: Similarity scores reflect textual metadata overlap and content descriptors, not subjective probability of viewer preference.
          </p>
        </div>

        {/* Attribution & Stack */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Attribution & Stack</span>
          </h4>
          <ul className="text-xs space-y-1.5 text-zinc-400">
            <li>Frontend: React 19, TypeScript, Tailwind CSS, Lucide</li>
            <li>Backend: FastAPI, Scikit-learn, Pandas, NumPy, SQLite</li>
            <li>Data: Curated TMDB educational dataset</li>
            <li>Status: Standalone offline mode enabled</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-4">
        <p>© 2026 Cineverse Discovery. Developed for AIML Level 2 Project 22 Portfolio.</p>
        <p className="font-mono text-[11px] text-zinc-400">
          FastAPI Backend: <span className="text-emerald-400">Online</span> | Recommender: <span className="text-emerald-400">Fitted</span>
        </p>
      </div>
    </footer>
  );
};
