/**
 * LeaderboardCard Component
 * Displays a player's ranking with points breakdown and visual effects
 */
import { motion } from 'framer-motion';
import { RankBadge } from './RankBadge';
import type { LeaderboardEntry } from '../types';

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  totalPlayers: number;
  showDetails?: boolean;
}

/**
 * Point category configuration for breakdown display
 */
const POINT_CATEGORIES = [
  { key: 'attendance_points', label: 'Attendance', icon: '📅' },
  { key: 'activity_points', label: 'Activities', icon: '🎮' },
  { key: 'course_points', label: 'Courses', icon: '📚' },
  { key: 'book_points', label: 'Books', icon: '📖' },
  { key: 'blog_points', label: 'Blogs', icon: '✍️' },
  { key: 'presentation_points', label: 'Presentations', icon: '🎤' },
  { key: 'idea_points', label: 'Ideas', icon: '💡' },
  { key: 'penalty_points', label: 'Penalties', icon: '⚠️' },
] as const;

/**
 * Get card border color based on rank
 */
function getCardBorderClass(rank: number): string {
  switch (rank) {
    case 1:
      return 'border-gold shadow-[0_0_20px_rgba(251,191,36,0.3)]';
    case 2:
      return 'border-silver shadow-[0_0_15px_rgba(148,163,184,0.2)]';
    case 3:
      return 'border-bronze shadow-[0_0_15px_rgba(205,127,50,0.2)]';
    default:
      return 'border-neon-blue/20';
  }
}

export function LeaderboardCard({ entry, totalPlayers, showDetails = false }: LeaderboardCardProps) {
  const borderClass = getCardBorderClass(entry.rank);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: entry.rank * 0.05 }}
      className={`
        cyber-card p-4 ${borderClass}
        hover:bg-cyber-card transition-all duration-300
      `}
    >
      {/* Main content row */}
      <div className="flex items-center gap-4">
        {/* Rank Badge */}
        <RankBadge rank={entry.rank} totalPlayers={totalPlayers} />

        {/* Player Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg font-semibold text-white truncate">
            {entry.player_name}
          </h3>
          {entry.avatar_url && (
            <img
              src={entry.avatar_url}
              alt={entry.player_name}
              className="w-8 h-8 rounded-full"
            />
          )}
        </div>

        {/* Total Points */}
        <div className="text-right">
          <div className="font-display text-2xl font-bold text-neon-blue">
            {entry.total_points}
          </div>
          <div className="text-xs text-gray-400">points</div>
        </div>
      </div>

      {/* Point Breakdown (collapsible) */}
      {showDetails && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="mt-4 pt-4 border-t border-gray-700/50 grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {POINT_CATEGORIES.map(({ key, label, icon }) => {
            const points = entry[key as keyof LeaderboardEntry] as number;
            const isNegative = points < 0;

            return (
              <div
                key={key}
                className={`flex items-center gap-2 text-sm ${
                  isNegative ? 'text-danger' : 'text-gray-300'
                }`}
              >
                <span>{icon}</span>
                <span className="truncate">{label}</span>
                <span className={`ml-auto font-medium ${isNegative ? 'text-danger' : ''}`}>
                  {isNegative ? points : `+${points}`}
                </span>
              </div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
