/**
 * TopPerformerForm Component
 * Award custom points to any player for outstanding performance
 * Replaces the fixed +20 top performer from activities
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Send, Info } from 'lucide-react';
import type { LeaderboardEntry } from '../../types';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface TopPerformerFormProps {
  players: LeaderboardEntry[];
}

export function TopPerformerForm({ players }: TopPerformerFormProps) {
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [points, setPoints] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer || !points) return;

    const pointsValue = parseInt(points);
    if (pointsValue <= 0) {
      setMessage('❌ Points must be greater than 0');
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      if (isSupabaseConfigured()) {
        // Get active cycle
        const { data: cycle } = await supabase
          .from('cycles')
          .select('id')
          .eq('is_active', true)
          .single();

        if (!cycle) throw new Error('No active cycle');

        const { error } = await supabase.from('top_performer_awards').insert({
          player_id: selectedPlayer,
          cycle_id: cycle.id,
          points: pointsValue,
          reason: reason.trim() || null,
        });

        if (error) throw error;
      }

      const playerName = players.find(p => p.player_id === selectedPlayer)?.player_name;
      setMessage(`✓ Awarded +${pointsValue} points to ${playerName}!`);
      
      // Reset form
      setSelectedPlayer('');
      setPoints('');
      setReason('');
    } catch (err) {
      console.error('Failed to award points:', err);
      setMessage('❌ Failed to award points');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Header */}
      <div className="cyber-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-gold" />
              Top Performer Awards
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Award custom points to players for outstanding performance
            </p>
          </div>
          {points && parseInt(points) > 0 && (
            <div className="text-right">
              <span className="text-2xl font-bold text-gold">+{points}</span>
              <p className="text-xs text-gray-400">points</p>
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="cyber-card p-4 border-gold/30 bg-gold/5">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-300">
            <p className="font-medium text-white mb-1">How It Works:</p>
            <ul className="space-y-1 text-gray-400">
              <li>• Award any custom points value to recognize exceptional work</li>
              <li>• Add a reason to document why the award was given</li>
              <li>• Points are added to the player's total score immediately</li>
              <li>• Can be used for bonuses, special achievements, or split rewards</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Player Selection */}
      <div className="cyber-card p-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Select Player *
        </label>
        <select
          value={selectedPlayer}
          onChange={(e) => setSelectedPlayer(e.target.value)}
          className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg
                   text-white focus:border-gold focus:outline-none"
          required
        >
          <option value="">Choose a player...</option>
          {players.map((player) => (
            <option key={player.player_id} value={player.player_id}>
              {player.player_name}
            </option>
          ))}
        </select>
      </div>

      {/* Points and Reason */}
      {selectedPlayer && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="cyber-card p-6 space-y-4"
        >
          {/* Custom Points */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Points to Award *
            </label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              placeholder="e.g., 20, 10, 5"
              min="1"
              step="1"
              className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg
                       text-white focus:border-gold focus:outline-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter any positive whole number (e.g., split 20 points as 10+10 for two players)
            </p>
          </div>

          {/* Reason/Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Reason / Description (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why is this award being given? (e.g., 'Top contributor for Q1 project', 'Split top performer award')"
              rows={3}
              className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg
                       text-white focus:border-gold focus:outline-none resize-none"
            />
          </div>

          {/* Points Preview */}
          {parseInt(points || '0') > 0 && (
            <div className="p-4 bg-gold/10 rounded-lg border border-gold/30 text-center">
              <span className="text-gold font-medium">
                🏆 Award +{points} points to {players.find(p => p.player_id === selectedPlayer)?.player_name}
                {reason && (
                  <span className="block text-sm text-gray-400 mt-1">
                    Reason: {reason}
                  </span>
                )}
              </span>
            </div>
          )}
        </motion.div>
      )}

      {/* Submit */}
      <div className="flex items-center justify-between">
        {message && (
          <span className={message.startsWith('✓') ? 'text-success' : 'text-danger'}>
            {message}
          </span>
        )}
        <div className="flex-1" />
        <button
          type="submit"
          disabled={!selectedPlayer || !points || isSubmitting}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 bg-gold hover:bg-gold/80"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-cyber-dark border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span>Award Points</span>
        </button>
      </div>
    </motion.form>
  );
}
