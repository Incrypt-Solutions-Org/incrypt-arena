/**
 * CourseForm Component
 * Form for logging course completion with URL fields
 * Points: (Hours × Completion%) × 4
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Send, Link as LinkIcon } from 'lucide-react';
import type { LeaderboardEntry } from '../../types';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface CourseFormProps {
  players: LeaderboardEntry[];
}

export function CourseForm({ players }: CourseFormProps) {
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [courseName, setCourseName] = useState('');
  const [totalHours, setTotalHours] = useState('');
  const [completionPercent, setCompletionPercent] = useState('');
  const [courseUrl, setCourseUrl] = useState('');
  const [notesLink, setNotesLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Calculate points: (Hours × Completion%) × 4
  const calculatedPoints = Math.round(
    parseFloat(totalHours || '0') * (parseFloat(completionPercent || '0') / 100) * 4
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer || !courseName || !totalHours || !completionPercent) return;
    
    const completion = parseFloat(completionPercent);
    if (completion < 60) {
      setMessage('❌ Minimum 60% completion required');
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      if (isSupabaseConfigured()) {
        const { data: cycle } = await supabase
          .from('cycles')
          .select('id')
          .eq('is_active', true)
          .single();

        if (!cycle) throw new Error('No active cycle');

        const { error } = await supabase.from('courses').insert({
          player_id: selectedPlayer,
          cycle_id: cycle.id,
          name: courseName,
          total_hours: parseFloat(totalHours),
          completion_percent: completion,
          course_url: courseUrl || null,
          notes_link: notesLink || null,
          verified: true,
        });

        if (error) throw error;
      }

      const playerName = players.find(p => p.player_id === selectedPlayer)?.player_name;
      setMessage(`✓ ${courseName} logged for ${playerName}! +${calculatedPoints} points`);
      
      // Reset form
      setSelectedPlayer('');
      setCourseName('');
      setTotalHours('');
      setCompletionPercent('');
      setCourseUrl('');
      setNotesLink('');
    } catch (err) {
      console.error('Failed to log course:', err);
      setMessage('❌ Failed to log course');
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
              <GraduationCap className="w-5 h-5 text-neon-blue" />
              Course Points
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Formula: (Hours × Completion%) × 4 • Minimum 60% completion required
            </p>
          </div>
          {calculatedPoints > 0 && (
            <div className="text-right">
              <span className="text-2xl font-bold text-neon-blue">+{calculatedPoints}</span>
              <p className="text-xs text-gray-400">points</p>
            </div>
          )}
        </div>
      </div>

      {/* Player Selection */}
      <div className="cyber-card p-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Select Player
        </label>
        <select
          value={selectedPlayer}
          onChange={(e) => setSelectedPlayer(e.target.value)}
          className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg
                   text-white focus:border-neon-blue focus:outline-none"
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

      {/* Course Details */}
      {selectedPlayer && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="cyber-card p-6 space-y-4"
        >
          {/* Course Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Course Name *
            </label>
            <input
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="e.g., Advanced React Patterns"
              className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg
                       text-white focus:border-neon-blue focus:outline-none"
              required
            />
          </div>

          {/* Hours and Completion */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Total Hours *
              </label>
              <input
                type="number"
                value={totalHours}
                onChange={(e) => setTotalHours(e.target.value)}
                placeholder="e.g., 20"
                min="0.5"
                step="0.5"
                className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg
                         text-white focus:border-neon-blue focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Completion Percentage *
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={completionPercent}
                  onChange={(e) => setCompletionPercent(e.target.value)}
                  placeholder="e.g., 85"
                  min="0"
                  max="100"
                  className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg
                           text-white focus:border-neon-blue focus:outline-none pr-8"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
              </div>
            </div>
          </div>

          {/* Points Preview */}
          {parseFloat(totalHours || '0') > 0 && parseFloat(completionPercent || '0') > 0 && (
            <div className="p-4 bg-neon-blue/10 rounded-lg border border-neon-blue/30 text-center">
              <span className="text-neon-blue font-medium">
                ({totalHours} hrs × {completionPercent}%) × 4 = <span className="text-2xl font-bold">+{calculatedPoints}</span> points
              </span>
            </div>
          )}

          {/* Course URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Course URL
            </label>
            <input
              type="url"
              value={courseUrl}
              onChange={(e) => setCourseUrl(e.target.value)}
              placeholder="https://...course link"
              className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg
                       text-white focus:border-neon-blue focus:outline-none"
            />
          </div>

          {/* Notes Link */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Notes Link (URL)
            </label>
            <input
              type="url"
              value={notesLink}
              onChange={(e) => setNotesLink(e.target.value)}
              placeholder="https://...your course notes"
              className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg
                       text-white focus:border-neon-blue focus:outline-none"
            />
          </div>
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
          disabled={!selectedPlayer || !courseName || !totalHours || !completionPercent || isSubmitting}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-cyber-dark border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span>Log Course</span>
        </button>
      </div>
    </motion.form>
  );
}
