/**
 * PeerEvaluationForm Component
 * Form for submitting peer evaluations on presentations
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Send, User } from 'lucide-react';
import type { LeaderboardEntry } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface PeerEvaluationFormProps {
  presentationId: string;
  presenterName: string;
  players: LeaderboardEntry[];
  currentPlayerId?: string;
  onSuccess?: () => void;
}

/**
 * Star rating input component
 */
function StarRating({ 
  value, 
  onChange, 
  label 
}: { 
  value: number; 
  onChange: (v: number) => void; 
  label: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`p-1 transition-colors ${
              star <= value ? 'text-gold' : 'text-gray-600 hover:text-gray-400'
            }`}
          >
            <Star className="w-5 h-5" fill={star <= value ? 'currentColor' : 'none'} />
          </button>
        ))}
        <span className="ml-2 text-neon-blue font-bold">{value}/10</span>
      </div>
    </div>
  );
}

export function PeerEvaluationForm({
  presentationId,
  presenterName,
  players,
  currentPlayerId,
  onSuccess,
}: PeerEvaluationFormProps) {
  const [evaluatorId, setEvaluatorId] = useState(currentPlayerId || '');
  const [usefulness, setUsefulness] = useState(5);
  const [entertainment, setEntertainment] = useState(5);
  const [effort, setEffort] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluatorId) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.from('peer_evaluations').insert({
          presentation_id: presentationId,
          evaluator_id: evaluatorId,
          usefulness,
          entertainment,
          effort,
        });

        if (error) throw error;
      }

      setMessage('✓ Evaluation submitted successfully!');
      onSuccess?.();
      
      // Reset form
      setUsefulness(5);
      setEntertainment(5);
      setEffort(5);
    } catch (err) {
      console.error('Failed to submit evaluation:', err);
      setMessage('❌ Failed to submit evaluation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const averageScore = ((usefulness + entertainment + effort) / 3).toFixed(1);

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="cyber-card p-6 space-y-6"
    >
      <div>
        <h3 className="font-display text-lg font-bold text-white mb-1">
          Evaluate Presentation
        </h3>
        <p className="text-sm text-gray-400">
          Rating <span className="text-neon-blue">{presenterName}</span>'s presentation
        </p>
      </div>

      {/* Evaluator Select (if not pre-selected) */}
      {!currentPlayerId && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <User className="w-4 h-4 inline mr-1" />
            Your Name
          </label>
          <select
            value={evaluatorId}
            onChange={(e) => setEvaluatorId(e.target.value)}
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
      )}

      {/* Rating Categories */}
      <div className="space-y-4">
        <StarRating
          value={usefulness}
          onChange={setUsefulness}
          label="📚 Usefulness - How valuable was the content?"
        />
        <StarRating
          value={entertainment}
          onChange={setEntertainment}
          label="🎭 Entertainment - How engaging was the delivery?"
        />
        <StarRating
          value={effort}
          onChange={setEffort}
          label="💪 Effort - How much effort went into preparation?"
        />
      </div>

      {/* Average Score Display */}
      <div className="p-4 bg-cyber-darker rounded-lg text-center">
        <div className="text-sm text-gray-400 mb-1">Average Score</div>
        <div className="font-display text-3xl font-bold text-neon-blue">
          {averageScore}
        </div>
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
          disabled={!evaluatorId || isSubmitting}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-cyber-dark border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span>Submit Evaluation</span>
        </button>
      </div>
    </motion.form>
  );
}
