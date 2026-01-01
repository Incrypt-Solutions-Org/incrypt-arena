/**
 * IdeasForm Component
 * Form for submitting ideas and tools proposals
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Wrench, Send, User } from 'lucide-react';
import type { LeaderboardEntry } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface IdeasFormProps {
  players: LeaderboardEntry[];
  onSuccess?: () => void;
}

export function IdeasForm({ players, onSuccess }: IdeasFormProps) {
  const [playerId, setPlayerId] = useState('');
  const [ideaType, setIdeaType] = useState<'idea' | 'tool'>('idea');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerId || !title) return;

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

        const { error } = await supabase.from('ideas').insert({
          player_id: playerId,
          cycle_id: cycle.id,
          title,
          description,
          idea_type: ideaType,
          testers_count: 0,
          votes: 0,
          points: 0,
          verified: false,
        });

        if (error) throw error;
      }

      setMessage(`✓ ${ideaType === 'idea' ? 'Idea' : 'Tool'} submitted for review!`);
      onSuccess?.();
      
      // Reset form
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error('Failed to submit idea:', err);
      setMessage('❌ Failed to submit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="cyber-card p-6 space-y-6"
    >
      <div>
        <h3 className="font-display text-lg font-bold text-white mb-1">
          💡 Submit an Idea or Tool
        </h3>
        <p className="text-sm text-gray-400">
          Propose improvements for the team. Earn 5-30 points based on team vote!
        </p>
      </div>

      {/* Player Select */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <User className="w-4 h-4 inline mr-1" />
          Submitter
        </label>
        <select
          value={playerId}
          onChange={(e) => setPlayerId(e.target.value)}
          className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg
                   text-white focus:border-neon-blue focus:outline-none"
          required
        >
          <option value="">Select your name...</option>
          {players.map((player) => (
            <option key={player.player_id} value={player.player_id}>
              {player.player_name}
            </option>
          ))}
        </select>
      </div>

      {/* Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Type
        </label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setIdeaType('idea')}
            className={`flex-1 p-4 rounded-lg border flex items-center justify-center gap-2 transition-all
              ${ideaType === 'idea'
                ? 'bg-neon-blue/20 border-neon-blue text-neon-blue'
                : 'bg-cyber-darker border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
          >
            <Lightbulb className="w-5 h-5" />
            <span>Idea</span>
          </button>
          <button
            type="button"
            onClick={() => setIdeaType('tool')}
            className={`flex-1 p-4 rounded-lg border flex items-center justify-center gap-2 transition-all
              ${ideaType === 'tool'
                ? 'bg-neon-purple/20 border-neon-purple text-neon-purple'
                : 'bg-cyber-darker border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
          >
            <Wrench className="w-5 h-5" />
            <span>Tool</span>
          </button>
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's your idea/tool called?"
          className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg
                   text-white placeholder-gray-500 focus:border-neon-blue focus:outline-none"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Explain your idea in detail..."
          rows={4}
          className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg
                   text-white placeholder-gray-500 focus:border-neon-blue focus:outline-none resize-none"
        />
      </div>

      {/* Info Box */}
      <div className="p-4 bg-cyber-darker rounded-lg text-sm text-gray-400">
        <p>📋 <strong>Requirements:</strong></p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Must be tested by at least 3 team members</li>
          <li>Team votes on usefulness (5-30 points)</li>
          <li>Admin verifies before points are awarded</li>
        </ul>
      </div>

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
          disabled={!playerId || !title || isSubmitting}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-cyber-dark border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span>Submit Proposal</span>
        </button>
      </div>
    </motion.form>
  );
}
