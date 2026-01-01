/**
 * RankBadge Component
 * Displays player rank with special styling for top 3 and "El Kooz" for last place
 */

interface RankBadgeProps {
  rank: number;
  totalPlayers: number;
}

/**
 * Medal configuration for top 3 ranks
 */
const MEDALS = {
  1: { emoji: '🥇', label: '1st Place', styleClass: 'gold-shimmer' },
  2: { emoji: '🥈', label: '2nd Place', styleClass: 'silver-shine' },
  3: { emoji: '🥉', label: '3rd Place', styleClass: 'bronze-glow' },
} as const;

export function RankBadge({ rank, totalPlayers }: RankBadgeProps) {
  // Check if this is the last place player
  const isLastPlace = rank === totalPlayers && totalPlayers > 1;
  
  // Check if this is a medal position (top 3)
  const medal = MEDALS[rank as keyof typeof MEDALS];

  // Last place: El Kooz badge
  if (isLastPlace) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-danger/10 border border-danger/30">
        <span className="text-2xl animate-bounce" role="img" aria-label="El Kooz">
          🪣
        </span>
        <div className="flex flex-col">
          <span className="text-lg font-bold text-danger">{rank}</span>
          <span className="text-xs text-danger/80">El Kooz</span>
        </div>
      </div>
    );
  }

  // Medal positions (1st, 2nd, 3rd)
  if (medal) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${medal.styleClass}`}>
        <span className="text-2xl" role="img" aria-label={medal.label}>
          {medal.emoji}
        </span>
        <span className={`text-xl font-bold ${medal.styleClass}`}>
          {rank}
        </span>
      </div>
    );
  }

  // Regular rank (4th onwards, not last)
  return (
    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-cyber-card border border-gray-600">
      <span className="text-xl font-bold text-gray-300">{rank}</span>
    </div>
  );
}
