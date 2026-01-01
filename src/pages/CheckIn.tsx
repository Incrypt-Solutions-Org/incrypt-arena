/**
 * Check-In Page Component
 * Allows any player to log their own Wednesday attendance
 * No admin access required
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Check, User, AlertCircle, PartyPopper, History } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface Player {
  id: string;
  name: string;
}

interface AttendanceRecord {
  player_id: string;
  check_in_date: string;
  is_early_bird: boolean;
}

/**
 * Get the date of the last Wednesday (including today if it's Wednesday)
 */
function getLastWednesday(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysAgo = (dayOfWeek + 7 - 3) % 7;
  
  const lastWednesday = new Date(today);
  lastWednesday.setDate(today.getDate() - daysAgo);
  lastWednesday.setHours(0, 0, 0, 0);
  
  return lastWednesday;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get all Wednesdays from start of cycle until last Wednesday
 */
function getWednesdays(startDate: Date, endDate: Date): string[] {
  const wednesdays: string[] = [];
  const current = new Date(startDate);
  
  // Find first Wednesday
  while (current.getDay() !== 3) {
    current.setDate(current.getDate() + 1);
  }
  
  // Collect all Wednesdays
  while (current <= endDate) {
    wednesdays.push(formatDate(current));
    current.setDate(current.getDate() + 7);
  }
  
  return wednesdays.reverse(); // Most recent first
}

export function CheckInPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [isEarlyBird, setIsEarlyBird] = useState(false);
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState<Set<string>>(new Set());
  const [allAttendance, setAllAttendance] = useState<AttendanceRecord[]>([]);
  const [cycleStartDate, setCycleStartDate] = useState<Date>(new Date('2026-01-01'));
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);

  const lastWednesday = getLastWednesday();
  const lastWednesdayStr = formatDate(lastWednesday);
  const displayDate = formatDisplayDate(lastWednesday);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isToday = lastWednesday.getTime() === today.getTime();

  // Check if current time is before 11:30 AM (for auto early bird suggestion)
  const now = new Date();
  const isBeforeEarlyBirdCutoff = now.getHours() < 11 || (now.getHours() === 11 && now.getMinutes() < 30);

  // Get all Wednesdays for the history table
  const allWednesdays = getWednesdays(cycleStartDate, lastWednesday);

  // Load players and existing attendance
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      
      if (isSupabaseConfigured()) {
        try {
          // Load all players
          const { data: playersData, error: playersError } = await supabase
            .from('players')
            .select('id, name')
            .order('name');

          if (!playersError && playersData) {
            setPlayers(playersData);
          }

          // Get active cycle start date
          const { data: cycleData } = await supabase
            .from('cycles')
            .select('start_date')
            .eq('is_active', true)
            .single();

          if (cycleData?.start_date) {
            setCycleStartDate(new Date(cycleData.start_date));
          }

          // Load ALL attendance records for history
          const { data: allAttendanceData, error: allAttendanceError } = await supabase
            .from('attendance')
            .select('player_id, check_in_date, is_early_bird')
            .order('check_in_date', { ascending: false });

          if (!allAttendanceError && allAttendanceData) {
            setAllAttendance(allAttendanceData);
            // Set currently checked in for last Wednesday
            const lastWedAttendance = allAttendanceData.filter(a => a.check_in_date === lastWednesdayStr);
            setAlreadyCheckedIn(new Set(lastWedAttendance.map(a => a.player_id)));
          }
        } catch (err) {
          console.error('Failed to load data:', err);
        }
      } else {
        // Demo mode
        setPlayers([
          { id: '1', name: 'Hassan' },
          { id: '2', name: 'Hisa' },
          { id: '3', name: 'Haytham' },
          { id: '4', name: 'Nagar' },
          { id: '5', name: 'Hesham' },
          { id: '6', name: 'Ghallab' },
          { id: '7', name: 'Fahim' },
          { id: '8', name: 'Askora' },
        ]);
      }
      
      setIsLoading(false);
    }

    loadData();
  }, [lastWednesdayStr]);

  // Set early bird default based on current time (only if it's Wednesday)
  useEffect(() => {
    if (isToday && isBeforeEarlyBirdCutoff) {
      setIsEarlyBird(true);
    }
  }, [isToday, isBeforeEarlyBirdCutoff]);

  const handleCheckIn = async () => {
    if (!selectedPlayer) return;
    
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

        const { error } = await supabase.from('attendance').insert({
          player_id: selectedPlayer,
          cycle_id: cycle.id,
          check_in_date: lastWednesdayStr,
          check_in_time: new Date().toTimeString().split(' ')[0],
          is_early_bird: isEarlyBird,
          points: 1,
        });

        if (error) {
          if (error.code === '23505') {
            throw new Error('You have already checked in for this Wednesday!');
          }
          throw error;
        }

        // Update local state
        setAlreadyCheckedIn(prev => new Set([...prev, selectedPlayer]));
        setAllAttendance(prev => [
          { player_id: selectedPlayer, check_in_date: lastWednesdayStr, is_early_bird: isEarlyBird },
          ...prev
        ]);
      }

      const playerName = players.find(p => p.id === selectedPlayer)?.name;
      const points = 1 + (isEarlyBird ? 1 : 0);
      setSuccessMessage(`🎉 ${playerName} checked in! +${points} point${points > 1 ? 's' : ''}`);
      setHasCheckedIn(true);
      setSelectedPlayer('');
      setIsEarlyBird(false);
    } catch (err) {
      console.error('Check-in failed:', err);
      setSuccessMessage(`❌ ${err instanceof Error ? err.message : 'Check-in failed'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get available players (not yet checked in)
  const availablePlayers = players.filter(p => !alreadyCheckedIn.has(p.id));

  // Create attendance lookup map for quick access
  const attendanceMap = new Map<string, AttendanceRecord>();
  allAttendance.forEach(record => {
    attendanceMap.set(`${record.player_id}-${record.check_in_date}`, record);
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neon-blue/20 mb-4">
            <Calendar className="w-8 h-8 text-neon-blue" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            Wednesday Check-In
          </h1>
          <p className="text-gray-400">
            Log your attendance and earn points!
          </p>
        </motion.div>

        {/* Date Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className={`
            cyber-card p-4 mb-6 text-center
            ${isToday ? 'border-success bg-success/10' : 'border-neon-blue/50 bg-neon-blue/5'}
          `}
        >
          <p className={`font-medium ${isToday ? 'text-success' : 'text-neon-blue'}`}>
            {isToday ? '✨ Happy Wednesday!' : 'Logging for last Wednesday'}
          </p>
          <p className="text-gray-300 mt-1">{displayDate}</p>
        </motion.div>

        {/* Success State */}
        {hasCheckedIn && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="cyber-card p-8 text-center mb-6 border-success bg-success/10"
          >
            <PartyPopper className="w-12 h-12 text-success mx-auto mb-4" />
            <p className="text-success text-lg font-medium">{successMessage}</p>
            <button
              onClick={() => {
                setHasCheckedIn(false);
                setSuccessMessage(null);
              }}
              className="mt-4 text-sm text-gray-400 hover:text-white underline"
            >
              Check in another player
            </button>
          </motion.div>
        )}

        {/* Check-in Form */}
        {!hasCheckedIn && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="cyber-card p-6 space-y-6"
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
              </div>
            ) : availablePlayers.length === 0 ? (
              <div className="text-center py-8">
                <Check className="w-12 h-12 text-success mx-auto mb-4" />
                <p className="text-success font-medium">Everyone has checked in!</p>
                <p className="text-gray-400 text-sm mt-2">All players are accounted for this Wednesday.</p>
              </div>
            ) : (
              <>
                {/* Player Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Who are you?
                  </label>
                  <select
                    value={selectedPlayer}
                    onChange={(e) => setSelectedPlayer(e.target.value)}
                    className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg
                             text-white focus:border-neon-blue focus:outline-none text-lg"
                  >
                    <option value="">Select your name...</option>
                    {availablePlayers.map((player) => (
                      <option key={player.id} value={player.id}>
                        {player.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Early Bird Toggle */}
                {selectedPlayer && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <button
                      onClick={() => setIsEarlyBird(!isEarlyBird)}
                      className={`
                        w-full p-4 rounded-lg border flex items-center justify-between
                        transition-all
                        ${isEarlyBird
                          ? 'bg-gold/20 border-gold text-gold'
                          : 'bg-cyber-darker border-gray-700 text-gray-400 hover:border-gray-500'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5" />
                        <div className="text-left">
                          <p className="font-medium">Early Bird Bonus</p>
                          <p className="text-sm opacity-75">Arrived before 11:30 AM</p>
                        </div>
                      </div>
                      <div className={`
                        w-6 h-6 rounded-full border-2 flex items-center justify-center
                        ${isEarlyBird ? 'bg-gold border-gold' : 'border-gray-600'}
                      `}>
                        {isEarlyBird && <Check className="w-4 h-4 text-cyber-dark" />}
                      </div>
                    </button>
                  </motion.div>
                )}

                {/* Points Preview */}
                {selectedPlayer && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 bg-neon-blue/10 rounded-lg border border-neon-blue/30 text-center"
                  >
                    <p className="text-gray-400 text-sm mb-1">You'll earn</p>
                    <p className="text-3xl font-bold text-neon-blue">
                      +{1 + (isEarlyBird ? 1 : 0)}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {isEarlyBird ? '1 attendance + 1 early bird' : 'attendance point'}
                    </p>
                  </motion.div>
                )}

                {/* Error Message */}
                {successMessage && successMessage.startsWith('❌') && (
                  <div className="p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm">
                    {successMessage}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={handleCheckIn}
                  disabled={!selectedPlayer || isSubmitting}
                  className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-cyber-dark border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
                  <span>Check In</span>
                </button>
              </>
            )}
          </motion.div>
        )}

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 cyber-card border-gray-700"
        >
          <div className="flex gap-3 text-sm text-gray-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p>You can only check in once per Wednesday.</p>
              <p className="mt-1">If a week passes without checking in, that attendance is lost.</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Attendance History Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-12 max-w-4xl mx-auto"
      >
        <div className="flex items-center gap-3 mb-4">
          <History className="w-6 h-6 text-neon-blue" />
          <h2 className="font-display text-xl font-bold text-white">Attendance History</h2>
        </div>

        <div className="cyber-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cyber-darker border-b border-gray-700">
                  <th className="sticky left-0 z-10 bg-cyber-darker px-4 py-3 text-left text-gray-400 font-medium">
                    Player
                  </th>
                  {allWednesdays.slice(0, 10).map((date) => (
                    <th key={date} className="px-3 py-3 text-center text-gray-400 font-medium whitespace-nowrap">
                      {formatShortDate(date)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {players.map((player, idx) => (
                  <tr 
                    key={player.id}
                    className={`border-b border-gray-700/50 ${idx % 2 === 0 ? '' : 'bg-cyber-darker/30'}`}
                  >
                    <td className="sticky left-0 z-10 bg-cyber-dark px-4 py-3 font-medium text-white">
                      {player.name}
                    </td>
                    {allWednesdays.slice(0, 10).map((date) => {
                      const record = attendanceMap.get(`${player.id}-${date}`);
                      return (
                        <td key={date} className="px-3 py-3 text-center">
                          {record ? (
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full
                              ${record.is_early_bird ? 'bg-gold/20 text-gold' : 'bg-success/20 text-success'}`}
                            >
                              {record.is_early_bird ? '⭐' : '✓'}
                            </span>
                          ) : (
                            <span className="text-gray-600">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Legend */}
          <div className="px-4 py-3 bg-cyber-darker border-t border-gray-700 flex gap-6 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-success/20 text-success">✓</span>
              Attended
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gold/20 text-gold">⭐</span>
              Early Bird
            </span>
            <span className="flex items-center gap-1">
              <span className="text-gray-600">—</span>
              Missed
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
