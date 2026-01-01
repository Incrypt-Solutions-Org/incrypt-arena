/**
 * Leaderboard Page Component
 * Main page displaying the live leaderboard with rankings
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { LeaderboardCard } from '../components/LeaderboardCard';

export function LeaderboardPage() {
  const { entries, isLoading, error, totalPlayers, refetch } = useLeaderboard();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  /**
   * Handle manual refresh with loading state
   */
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  /**
   * Toggle point breakdown for a player
   */
  const toggleCardExpand = (playerId: string) => {
    setExpandedCard(current => (current === playerId ? null : playerId));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-gold" />
          <h1 className="font-display text-3xl font-bold neon-text">
            Leaderboard
          </h1>
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing || isLoading}
          className="btn-secondary flex items-center gap-2"
          aria-label="Refresh leaderboard"
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-neon-blue border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400">Loading leaderboard...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="cyber-card p-6 border-danger/50 bg-danger/10 text-center">
          <p className="text-danger mb-4">{error}</p>
          <button onClick={handleRefresh} className="btn-primary">
            Try Again
          </button>
        </div>
      )}

      {/* Leaderboard Grid */}
      {!isLoading && !error && (
        <div className="space-y-4">
          {entries.map((entry) => (
            <motion.div
              key={entry.player_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: entry.rank * 0.05 }}
            >
              <div
                onClick={() => toggleCardExpand(entry.player_id)}
                className="cursor-pointer"
              >
                <LeaderboardCard
                  entry={entry}
                  totalPlayers={totalPlayers}
                  showDetails={expandedCard === entry.player_id}
                />
              </div>

              {/* Expand/Collapse Indicator */}
              <div className="flex justify-center -mt-2">
                <button
                  className="text-gray-500 hover:text-neon-blue transition-colors p-1"
                  aria-label={expandedCard === entry.player_id ? 'Collapse' : 'Expand'}
                >
                  {expandedCard === entry.player_id ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && entries.length === 0 && (
        <div className="text-center py-20">
          <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-display text-gray-400 mb-2">
            No Competitors Yet
          </h2>
          <p className="text-gray-500">
            The leaderboard will populate once players start earning points.
          </p>
        </div>
      )}

      {/* Stats Footer */}
      {!isLoading && entries.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-4 cyber-card text-center"
        >
          <div className="text-sm text-gray-400">
            <span className="text-neon-blue font-bold">{totalPlayers}</span>{' '}
            players competing •{' '}
            <span className="text-gold font-bold">
              {entries[0]?.total_points || 0}
            </span>{' '}
            points in the lead
          </div>
        </motion.div>
      )}
    </div>
  );
}
