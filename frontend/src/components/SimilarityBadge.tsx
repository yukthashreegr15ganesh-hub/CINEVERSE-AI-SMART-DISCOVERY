import React from 'react';
import { Sparkles } from 'lucide-react';

interface SimilarityBadgeProps {
  score: number; // e.g., 0.8421
  percentage?: number; // e.g., 84.2
  size?: 'sm' | 'md' | 'lg';
}

export const SimilarityBadge: React.FC<SimilarityBadgeProps> = ({ score, percentage, size = 'md' }) => {
  const pct = percentage ?? Math.round(score * 100);

  // Dynamic color coding based on cosine similarity thresholds
  let colorClass = 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
  let glowClass = 'shadow-[0_0_12px_rgba(6,182,212,0.25)]';

  if (score >= 0.5) {
    colorClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35';
    glowClass = 'shadow-[0_0_15px_rgba(16,185,129,0.3)]';
  } else if (score >= 0.3) {
    colorClass = 'bg-amber-500/20 text-amber-300 border-amber-500/35';
    glowClass = 'shadow-[0_0_12px_rgba(245,158,11,0.25)]';
  } else if (score >= 0.15) {
    colorClass = 'bg-blue-500/15 text-blue-300 border-blue-500/30';
    glowClass = 'shadow-[0_0_10px_rgba(59,130,246,0.2)]';
  }

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2'
  };

  return (
    <div
      className={`inline-flex items-center font-mono font-medium rounded-full border backdrop-blur-md ${colorClass} ${glowClass} ${sizeClasses[size]}`}
      title={`Calculated Content-Based Cosine Similarity: ${score.toFixed(4)} (${pct}% similarity)`}
    >
      <Sparkles className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} />
      <span>{pct}% Similarity</span>
    </div>
  );
};
