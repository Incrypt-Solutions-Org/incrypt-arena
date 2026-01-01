/**
 * PointsForm Component
 * Generic admin form for awarding points in different categories
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Check, User, AlertTriangle } from 'lucide-react';
import type { LeaderboardEntry } from '../../types';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface PointsFormProps {
  title: string;
  description: string;
  players: LeaderboardEntry[];
  category: 'activity' | 'course' | 'blog' | 'presentation' | 'penalty';
  isNegative?: boolean;
}

// Table mapping for different categories
const TABLE_MAP = {
  activity: 'activity_participations',
  course: 'courses',
  blog: 'blogs',
  presentation: 'presentations',
  penalty: 'penalties',
} as const;

export function PointsForm({ title, description, players, category, isNegative = false }: PointsFormProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [points, setPoints] = useState<number>(isNegative ? -1 : 10);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer || points === 0) return;

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

        // Insert record based on category
        const table = TABLE_MAP[category];
        const record: Record<string, unknown> = {
          player_id: selectedPlayer,
          cycle_id: cycle.id,
          points: isNegative ? -Math.abs(points) : points,
          created_at: new Date().toISOString(),
        };

        // Add category-specific fields
        if (category === 'penalty') {
          record.reason = 'other';
          record.description = note;
        } else if (category === 'course') {
          record.name = note || 'Unnamed Course';
          record.hours = Math.abs(points) / 4;
          record.completion_percentage = 100;
          record.verified = true;
        } else if (category === 'blog') {
          record.title = note || 'Blog Post';
          record.url = '';
        } else if (category === 'presentation') {
          record.topic = note || 'Presentation';
          record.date = new Date().toISOString().split('T')[0];
          record.is_solo = true;
        }

        const { error } = await supabase.from(table).insert(record);
        if (error) throw error;
      }

      // Get player name for success message
      const playerName = players.find(p => p.player_id === selectedPlayer)?.player_name || 'Unknown';
      const pointsDisplay = isNegative ? `-${Math.abs(points)}` : `+${points}`;
      
      setSuccessMessage(`✓ ${pointsDisplay} points ${isNegative ? 'deducted from' : 'awarded to'} ${playerName}`);

      // Clear form
      setSelectedPlayer('');
      setPoints(isNegative ? -1 : 10);
      setNote('');
    } catch (err) {
      console.error('Failed to submit points:', err);
      setSuccessMessage('❌ Failed to submit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className={`font-display text-xl font-bold flex items-center gap-2 ${isNegative ? 'text-danger' : 'text-white'}`}>
          {isNegative ? <AlertTriangle className="w-5 h-5" /> : <Plus className="w-5 h-5 text-neon-blue" />}
          {title}
        </h2>
        <p className="text-sm text-gray-400 mt-1">{description}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="cyber-card p-6 space-y-6">
        {/* Player Select */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <User className="w-4 h-4 inline mr-1" />
            Select Player
          </label>
          <select
            value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value)}
            className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg
                     text-white focus:border-neon-blue focus:outline-none transition-colors"
            required
          >
            <option value="">Choose a player...</option>
            {players.map((player) => (
              <option key={player.player_id} value={player.player_id}>
                {player.player_name} ({player.total_points} pts)
              </option>
            ))}
          </select>
        </div>

        {/* Points Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Points {isNegative ? '(Deduction)' : ''}
          </label>
          <input
            type="number"
            value={Math.abs(points)}
            onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
            min={1}
            max={100}
            className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg
                     text-white focus:border-neon-blue focus:outline-none transition-colors"
            required
          />
        </div>

        {/* Note/Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Note / Description (optional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={category === 'course' ? 'Course name...' : 'Add a note...'}
            className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg
                     text-white placeholder-gray-500 focus:border-neon-blue focus:outline-none 
                     transition-colors"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
          {successMessage && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={successMessage.startsWith('✓') ? 'text-success' : 'text-danger'}
            >
              {successMessage}
            </motion.span>
          )}
          <div className="flex-1" />
          <button
            type="submit"
            disabled={!selectedPlayer || isSubmitting}
            className={`
              flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all
              disabled:opacity-50 disabled:cursor-not-allowed
              ${isNegative 
                ? 'bg-danger text-white hover:bg-danger/80' 
                : 'btn-primary'
              }
            `}
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>{isNegative ? 'Apply Penalty' : 'Award Points'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
