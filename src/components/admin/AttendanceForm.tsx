/**
 * AttendanceForm Component
 * Admin form for logging Wednesday attendance with Early Bird toggle
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Check, User } from 'lucide-react';
import type { LeaderboardEntry } from '../../types';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface AttendanceFormProps {
  players: LeaderboardEntry[];
}

export function AttendanceForm({ players }: AttendanceFormProps) {
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [earlyBirdPlayers, setEarlyBirdPlayers] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Get current date formatted
  const today = new Date().toISOString().split('T')[0];
  const isWednesday = new Date().getDay() === 3;

  const togglePlayer = (playerId: string) => {
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

        // Insert attendance records
        const records = Array.from(selectedPlayers).map(playerId => ({
          player_id: playerId,
          cycle_id: cycle.id,
          check_in_date: today,
          check_in_time: new Date().toTimeString().split(' ')[0],
          is_early_bird: earlyBirdPlayers.has(playerId),
          points: 1, // Base attendance points
        }));

        const { error } = await supabase.from('attendance').insert(records);
        if (error) throw error;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
          <p className="text-sm text-gray-400">Date</p>
          <p className={`font-medium ${isWednesday ? 'text-success' : 'text-gray-300'}`}>
            {today} {isWednesday && '(Wednesday ✓)'}
          </p>
        </div>
      </div>

      {/* Player Grid */}
      <div className="cyber-card p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {players.map((player) => {
            const isSelected = selectedPlayers.has(player.player_id);
            const isEarlyBird = earlyBirdPlayers.has(player.player_id);

            return (
              <motion.div
                key={player.player_id}
                whileHover={{ scale: 1.02 }}
                className={`
                  p-4 rounded-lg border cursor-pointer transition-all
                  ${isSelected
                    ? 'bg-neon-blue/20 border-neon-blue'
                    : 'bg-cyber-darker border-gray-700 hover:border-gray-500'
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
                    ${isSelected ? 'bg-neon-blue border-neon-blue' : 'border-gray-600'}
                  `}>
                    {isSelected && <Check className="w-3 h-3 text-cyber-dark" />}
                  </div>
                </div>

                {/* Early Bird Toggle */}
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
              </motion.div>
            );
          })}
        </div>
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
            disabled={selectedPlayers.size === 0 || isSubmitting}
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
