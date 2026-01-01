/**
 * AttendanceForm Component
 * Admin form for logging Wednesday attendance with Early Bird toggle
 * Restrictions:
 * - Only last Wednesday's attendance can be logged
 * - Each player can only have attendance logged once per Wednesday
 * - If a week passes without logging, that attendance is lost
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Check, User, AlertCircle } from 'lucide-react';
import type { LeaderboardEntry } from '../../types';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface AttendanceFormProps {
  players: LeaderboardEntry[];
}

/**
 * Get the date of the last Wednesday (including today if it's Wednesday)
 */
function getLastWednesday(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 3 = Wednesday
  
  // Calculate days since last Wednesday
  // If today is Wednesday (3), daysAgo = 0
  // If today is Thursday (4), daysAgo = 1
  // If today is Tuesday (2), daysAgo = 6
  const daysAgo = (dayOfWeek + 7 - 3) % 7;
  
  const lastWednesday = new Date(today);
  lastWednesday.setDate(today.getDate() - daysAgo);
  lastWednesday.setHours(0, 0, 0, 0);
  
  return lastWednesday;
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Format date for display (e.g., "Wed, Jan 1, 2026")
 */
function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function AttendanceForm({ players }: AttendanceFormProps) {
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [earlyBirdPlayers, setEarlyBirdPlayers] = useState<Set<string>>(new Set());
  const [alreadyLoggedPlayers, setAlreadyLoggedPlayers] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Calculate last Wednesday
  const lastWednesday = getLastWednesday();
  const lastWednesdayStr = formatDate(lastWednesday);
  const displayDate = formatDisplayDate(lastWednesday);
  
  // Check if today is the last Wednesday (same day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isToday = lastWednesday.getTime() === today.getTime();

  // Load existing attendance for last Wednesday
  useEffect(() => {
    async function checkExistingAttendance() {
      setIsLoading(true);
      
      if (isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase
            .from('attendance')
            .select('player_id')
            .eq('check_in_date', lastWednesdayStr);

          if (!error && data) {
            const loggedIds = new Set(data.map(record => record.player_id));
            setAlreadyLoggedPlayers(loggedIds);
          }
        } catch (err) {
          console.error('Failed to check existing attendance:', err);
        }
      }
      
      setIsLoading(false);
    }

    checkExistingAttendance();
  }, [lastWednesdayStr]);

  const togglePlayer = (playerId: string) => {
    // Don't allow toggling if already logged
    if (alreadyLoggedPlayers.has(playerId)) return;
    
    const newSet = new Set(selectedPlayers);
    if (newSet.has(playerId)) {
      newSet.delete(playerId);
      // Also remove from early bird if unchecked
      const newEarlyBird = new Set(earlyBirdPlayers);
      newEarlyBird.delete(playerId);
      setEarlyBirdPlayers(newEarlyBird);
    } else {
      newSet.add(playerId);
    }
    setSelectedPlayers(newSet);
  };

  const toggleEarlyBird = (playerId: string) => {
    if (!selectedPlayers.has(playerId)) return;
    
    const newSet = new Set(earlyBirdPlayers);
    if (newSet.has(playerId)) {
      newSet.delete(playerId);
    } else {
      newSet.add(playerId);
    }
    setEarlyBirdPlayers(newSet);
  };

  const handleSubmit = async () => {
    if (selectedPlayers.size === 0) return;
    
    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      if (isSupabaseConfigured()) {
        // Get active cycle
        const { data: cycle } = await supabase
          .from('cycles')
          .select('id')
          .eq('is_active', true)
          .single();

        if (!cycle) throw new Error('No active cycle found');

        // Insert attendance records for the last Wednesday
        const records = Array.from(selectedPlayers).map(playerId => ({
          player_id: playerId,
          cycle_id: cycle.id,
          check_in_date: lastWednesdayStr,
          check_in_time: new Date().toTimeString().split(' ')[0],
          is_early_bird: earlyBirdPlayers.has(playerId),
          points: 1, // Base attendance points
        }));

        const { error } = await supabase.from('attendance').insert(records);
        if (error) throw error;

        // Update already logged players
        const newLogged = new Set(alreadyLoggedPlayers);
        selectedPlayers.forEach(id => newLogged.add(id));
        setAlreadyLoggedPlayers(newLogged);
      }

      // Show success message
      const count = selectedPlayers.size;
      const earlyCount = earlyBirdPlayers.size;
      setSuccessMessage(
        `✓ Logged attendance for ${count} player${count > 1 ? 's' : ''}` +
        (earlyCount > 0 ? ` (${earlyCount} Early Bird bonus${earlyCount > 1 ? 'es' : ''})` : '')
      );

      // Clear form
      setSelectedPlayers(new Set());
      setEarlyBirdPlayers(new Set());
    } catch (err) {
      console.error('Failed to log attendance:', err);
      setSuccessMessage('❌ Failed to log attendance');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Count available players (not yet logged)
  const availablePlayers = players.filter(p => !alreadyLoggedPlayers.has(p.player_id));
  const allLogged = availablePlayers.length === 0 && players.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-neon-blue" />
            Wednesday Attendance
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            +1 point per check-in • +1 Early Bird bonus (before 11:30 AM)
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Logging for</p>
          <p className={`font-medium ${isToday ? 'text-success' : 'text-neon-blue'}`}>
            {displayDate} {isToday && '(Today ✓)'}
          </p>
        </div>
      </div>

      {/* Warning if all logged */}
      {allLogged && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 cyber-card border-success bg-success/10"
        >
          <Check className="w-5 h-5 text-success flex-shrink-0" />
          <p className="text-success">
            All players have attendance logged for {displayDate}!
          </p>
        </motion.div>
      )}

      {/* Info banner */}
      {!allLogged && (
        <div className="flex items-start gap-3 p-4 cyber-card border-neon-blue/30 bg-neon-blue/5">
          <AlertCircle className="w-5 h-5 text-neon-blue flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-300">
            <p>
              You can only log attendance for the <strong>last Wednesday ({displayDate})</strong>.
            </p>
            <p className="text-gray-500 mt-1">
              Players with ✓ already have attendance logged and cannot be added again.
            </p>
          </div>
        </div>
      )}

      {/* Player Grid */}
      <div className="cyber-card p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-gray-400">Checking existing attendance...</span>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {players.map((player) => {
              const isAlreadyLogged = alreadyLoggedPlayers.has(player.player_id);
              const isSelected = selectedPlayers.has(player.player_id);
              const isEarlyBird = earlyBirdPlayers.has(player.player_id);

              return (
                <motion.div
                  key={player.player_id}
                  whileHover={!isAlreadyLogged ? { scale: 1.02 } : {}}
                  className={`
                    p-4 rounded-lg border transition-all
                    ${isAlreadyLogged
                      ? 'bg-success/10 border-success/50 cursor-not-allowed opacity-70'
                      : isSelected
                        ? 'bg-neon-blue/20 border-neon-blue cursor-pointer'
                        : 'bg-cyber-darker border-gray-700 hover:border-gray-500 cursor-pointer'
                    }
                  `}
                  onClick={() => togglePlayer(player.player_id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-white">{player.player_name}</span>
                    </div>
                    <div className={`
                      w-5 h-5 rounded border flex items-center justify-center
                      ${isAlreadyLogged
                        ? 'bg-success border-success'
                        : isSelected
                          ? 'bg-neon-blue border-neon-blue'
                          : 'border-gray-600'
                      }
                    `}>
                      {(isAlreadyLogged || isSelected) && <Check className="w-3 h-3 text-cyber-dark" />}
                    </div>
                  </div>

                  {/* Status or Early Bird Toggle */}
                  {isAlreadyLogged ? (
                    <div className="w-full flex items-center justify-center gap-1 py-1 rounded text-xs bg-success/20 text-success">
                      <Check className="w-3 h-3" />
                      <span>Already Logged</span>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleEarlyBird(player.player_id);
                      }}
                      disabled={!isSelected}
                      className={`
                        w-full flex items-center justify-center gap-1 py-1 rounded text-xs
                        transition-all
                        ${isSelected
                          ? isEarlyBird
                            ? 'bg-gold/20 text-gold border border-gold/50'
                            : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                          : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                        }
                      `}
                    >
                      <Clock className="w-3 h-3" />
                      <span>Early Bird +1</span>
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Submit Section */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">
          {selectedPlayers.size > 0 && (
            <span>
              Selected: <span className="text-neon-blue font-medium">{selectedPlayers.size}</span> player(s)
              {earlyBirdPlayers.size > 0 && (
                <span className="text-gold ml-2">
                  ({earlyBirdPlayers.size} Early Bird)
                </span>
              )}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {successMessage && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={successMessage.startsWith('✓') ? 'text-success' : 'text-danger'}
            >
              {successMessage}
            </motion.span>
          )}
          <button
            onClick={handleSubmit}
            disabled={selectedPlayers.size === 0 || isSubmitting || allLogged}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-cyber-dark border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>Log Attendance</span>
          </button>
        </div>
      </div>
    </div>
  );
}
