/**
 * StreaksPanel Component
 * Admin panel for viewing and applying Askora's Streak and Attendance Champion bonuses
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Crown, Trophy, RefreshCw, Check } from 'lucide-react';

interface StreakInfo {
  playerId: string;
  playerName: string;
  consecutiveWeeks: number;
  bonusPoints: number;
}

interface ChampionInfo {
  playerId: string;
  playerName: string;
  attendanceCount: number;
  bonusPoints: number;
}

interface StreaksPanelProps {
  calculateStreaks: () => Promise<StreakInfo[]>;
  calculateAttendanceChampion: () => Promise<ChampionInfo | null>;
  isLoading: boolean;
}

export function StreaksPanel({ 
  calculateStreaks, 
  calculateAttendanceChampion,
}: StreaksPanelProps) {
  const [streaks, setStreaks] = useState<StreakInfo[]>([]);
  const [champion, setChampion] = useState<ChampionInfo | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = async () => {
    setIsRefreshing(true);
    const [streakData, championData] = await Promise.all([
      calculateStreaks(),
      calculateAttendanceChampion(),
    ]);
    setStreaks(streakData);
    setChampion(championData);
    setIsRefreshing(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-gold" />
            Streaks & Bonus Points
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            View and apply special bonus points for streaks and achievements
          </p>
        </div>
        <button
          onClick={refreshData}
          disabled={isRefreshing}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Askora's Streak Section */}
      <div className="cyber-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-neon-purple/20">
            <Trophy className="w-5 h-5 text-neon-purple" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white">
              Askora's Special Streak
            </h3>
            <p className="text-sm text-gray-400">
              +1 bonus for every 2 consecutive Wednesday check-ins
            </p>
          </div>
        </div>

        {streaks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No active streaks found. Players need 2+ consecutive Wednesdays.
          </p>
        ) : (
          <div className="space-y-3">
            {streaks.map((streak) => (
              <motion.div
                key={streak.playerId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 bg-cyber-darker rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔥</span>
                  <div>
                    <span className="font-medium text-white">{streak.playerName}</span>
                    <p className="text-xs text-gray-400">
                      {streak.consecutiveWeeks} consecutive weeks
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-neon-purple font-bold">
                    +{streak.bonusPoints} bonus
                  </span>
                  <Check className="w-4 h-4 text-success" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Attendance Champion Section */}
      <div className="cyber-card p-6 border-gold border-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-gold/20">
            <Crown className="w-5 h-5 text-gold" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-gold">
              Attendance Champion
            </h3>
            <p className="text-sm text-gray-400">
              +10 bonus at end of cycle for highest attendance
            </p>
          </div>
        </div>

        {champion ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-between p-4 bg-gold/10 rounded-lg border border-gold/30"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">👑</span>
              <div>
                <span className="font-display text-xl font-bold text-gold">
                  {champion.playerName}
                </span>
                <p className="text-sm text-gray-400">
                  {champion.attendanceCount} check-ins this cycle
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-gold">
                +{champion.bonusPoints}
              </span>
              <p className="text-xs text-gray-400">bonus points</p>
            </div>
          </motion.div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No attendance data yet. Champion determined at end of cycle.
          </p>
        )}
      </div>

      {/* Double Points Info */}
      <div className="cyber-card p-6 border-neon-blue/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-neon-blue/20">
            <Zap className="w-5 h-5 text-neon-blue" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white">
              Double Points Mode
            </h3>
            <p className="text-sm text-gray-400">
              Each player can use a one-time 2× multiplier on any activity
            </p>
          </div>
        </div>
        <p className="text-gray-400 text-sm">
          Double points can be applied when awarding activity points. 
          Each player can only use this once per cycle. 
          Apply it from the Activities tab when entering points.
        </p>
      </div>
    </div>
  );
}
