/**
 * BestPresentationPrize Component
 * Admin form to award bonus points for best presentation
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import type { LeaderboardEntry } from '../../types';
import { POINTS } from '../../types';
import { db } from '../../lib/supabaseApi';
import { useAuth } from '../../hooks/useAuth';

interface BestPresentationPrizeProps {
  players: LeaderboardEntry[];
  onSuccess?: () => void;
}

export function BestPresentationPrize({ players, onSuccess }: BestPresentationPrizeProps) {
  const { session } = useAuth();
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [points, setPoints] = useState(POINTS.BEST_PRESENTATION.toString());
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      if (db.isConfigured()) {
        const { data: cycles } = await db.select<{ id: string }[]>('cycles', { 
          columns: 'id', 
          filters: { 'is_active': 'eq.true' }, 
          limit: 1 
        });
        if (!cycles || cycles.length === 0) throw new Error('No active cycle');
        const cycle = cycles[0];

        // Insert as a special presentation record with is_best_presentation flag
        const { error } = await db.insert('presentations', {
          player_id: selectedPlayer,
          cycle_id: cycle.id,
          topic: `Best Presentation Award${reason ? `: ${reason}` : ''}`,
          date: (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })(),
          is_solo: true,
          presentation_order: 0, // 0 indicates it's a prize, not a regular presentation
          points: parseInt(points) || POINTS.BEST_PRESENTATION,
          is_best_presentation: true,
        }, { authToken: session?.access_token });

        if (error) throw new Error(error.message);
      }

      const playerName = players.find(p => p.player_id === selectedPlayer)?.player_name;
      setMessage(`✓ Best Presentation Prize (+${points} pts) awarded to ${playerName}!`);
      setSelectedPlayer('');
      setPoints(POINTS.BEST_PRESENTATION.toString());
      setReason('');
      onSuccess?.();
    } catch (err) {
      console.error('Failed to award prize:', err);
      setMessage('❌ Failed to award prize');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="cyber-card p-6 border-gold/30 bg-gold/5"
    >
      <div className="flex items-center gap-3 mb-4">
        <Award className="w-6 h-6 text-gold" />
        <div>
          <h3 className="font-display text-lg font-bold text-gold">Best Presentation Prize</h3>
          <p className="text-sm text-gray-400">Award bonus points for outstanding presentation</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Select Winner *</label>
            <select
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg text-white focus:border-gold focus:outline-none"
              required
            >
              <option value="">Choose player...</option>
              {players.map((player) => (
                <option key={player.player_id} value={player.player_id}>
                  {player.player_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Points (default: {POINTS.BEST_PRESENTATION})</label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              min="1"
              className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg text-white focus:border-gold focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Reason (Optional)</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Exceptional delivery and content"
            className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg text-white focus:border-gold focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          {message && (
            <span className={message.startsWith('✓') ? 'text-success' : 'text-danger'}>
              {message}
            </span>
          )}
          <div className="flex-1" />
          <button
            type="submit"
            disabled={!selectedPlayer || isSubmitting}
            className="px-6 py-3 bg-gradient-to-r from-gold/80 to-gold text-cyber-dark font-semibold rounded-lg hover:from-gold hover:to-gold/80 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-cyber-dark border-t-transparent rounded-full animate-spin" />
            ) : (
              <Award className="w-4 h-4" />
            )}
            <span>Award Prize</span>
          </button>
        </div>
      </form>
    </motion.div>
  );
}
