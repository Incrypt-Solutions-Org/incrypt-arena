/**
 * PresentationForm Component
 * Form for logging presentations with presenter selection and URLs
 * Points: +30/+20/+20/+15 based on solo/pair and order
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Presentation, Send, Link as LinkIcon, Calendar as CalendarIcon } from 'lucide-react';
import type { LeaderboardEntry } from '../../types';
import { POINTS } from '../../types';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface PresentationFormProps {
  players: LeaderboardEntry[];
}

export function PresentationForm({ players }: PresentationFormProps) {
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState('');
  const [firstPresenter, setFirstPresenter] = useState('');
  const [secondPresenter, setSecondPresenter] = useState('');
  const [slidesUrl, setSlidesUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [evalLink, setEvalLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const isSolo = !secondPresenter;
  const firstPresenterPoints = isSolo ? POINTS.FIRST_SOLO_PRESENTATION : POINTS.FIRST_PAIR_PRESENTATION;
  const secondPresenterPoints = POINTS.SECOND_PAIR_PRESENTATION;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !date || !firstPresenter) return;

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

        // Insert first presenter
        const { error: firstError } = await supabase.from('presentations').insert({
          player_id: firstPresenter,
          second_presenter_id: secondPresenter || null,
          cycle_id: cycle.id,
          topic,
          date,
          slides_url: slidesUrl || null,
          youtube_url: youtubeUrl || null,
          eval_link: evalLink || null,
          is_solo: isSolo,
          presentation_order: 1,
          points: firstPresenterPoints,
        });

        if (firstError) throw firstError;

        // Insert second presenter if exists
        if (secondPresenter) {
          const { error: secondError } = await supabase.from('presentations').insert({
            player_id: secondPresenter,
            second_presenter_id: firstPresenter,
            cycle_id: cycle.id,
            topic,
            date,
            slides_url: slidesUrl || null,
            youtube_url: youtubeUrl || null,
            eval_link: evalLink || null,
            is_solo: false,
            presentation_order: 2,
            points: secondPresenterPoints,
          });

          if (secondError) throw secondError;
        }
      }

      const firstName = players.find(p => p.player_id === firstPresenter)?.player_name;
      const secondName = secondPresenter ? players.find(p => p.player_id === secondPresenter)?.player_name : null;
      const presenters = secondName ? `${firstName} & ${secondName}` : firstName;
      setMessage(`✓ "${topic}" logged for ${presenters}!`);
      
      // Reset form
      setTopic('');
      setDate('');
      setFirstPresenter('');
      setSecondPresenter('');
      setSlidesUrl('');
      setYoutubeUrl('');
      setEvalLink('');
    } catch (err) {
      console.error('Failed to log presentation:', err);
      setMessage('❌ Failed to log presentation');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter available players for second presenter (exclude first presenter)
  const availableSecondPresenters = players.filter(p => p.player_id !== firstPresenter);

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
              <Presentation className="w-5 h-5 text-neon-blue" />
              Presentation Points
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              1st solo: +30 pts, 1st pair: +20 pts • 2nd solo: +20 pts, 2nd pair: +15 pts
            </p>
          </div>
        </div>
      </div>

      {/* Presentation Details */}
      <div className="cyber-card p-6 space-y-4">
        {/* Topic and Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Topic *
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Docker Fundamentals"
              className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg
                       text-white focus:border-neon-blue focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg
                       text-white focus:border-neon-blue focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Presenters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              1st Presenter *
            </label>
            <select
              value={firstPresenter}
              onChange={(e) => setFirstPresenter(e.target.value)}
              className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg
                       text-white focus:border-neon-blue focus:outline-none"
              required
            >
              <option value="">Choose presenter...</option>
              {players.map((player) => (
                <option key={player.player_id} value={player.player_id}>
                  {player.player_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              2nd Presenter (Optional)
            </label>
            <select
              value={secondPresenter}
              onChange={(e) => setSecondPresenter(e.target.value)}
              className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg
                       text-white focus:border-neon-blue focus:outline-none"
              disabled={!firstPresenter}
            >
              <option value="">Solo presentation</option>
              {availableSecondPresenters.map((player) => (
                <option key={player.player_id} value={player.player_id}>
                  {player.player_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Points Preview */}
        {firstPresenter && (
          <div className="p-4 bg-neon-blue/10 rounded-lg border border-neon-blue/30">
            <div className="text-center text-neon-blue font-medium">
              {isSolo ? (
                <span>Solo: +{firstPresenterPoints} points for {players.find(p => p.player_id === firstPresenter)?.player_name}</span>
              ) : (
                <span>Pair: +{firstPresenterPoints} for {players.find(p => p.player_id === firstPresenter)?.player_name}, 
                  +{secondPresenterPoints} for {players.find(p => p.player_id === secondPresenter)?.player_name}</span>
              )}
            </div>
          </div>
        )}

        {/* URLs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Slides Link (URL)
            </label>
            <input
              type="url"
              value={slidesUrl}
              onChange={(e) => setSlidesUrl(e.target.value)}
              placeholder="https://...slides link"
              className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg
                       text-white focus:border-neon-blue focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              YouTube Link (URL)
            </label>
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://youtube.com/..."
              className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg
                       text-white focus:border-neon-blue focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Evaluation Link (URL)
            </label>
            <input
              type="url"
              value={evalLink}
              onChange={(e) => setEvalLink(e.target.value)}
              placeholder="https://...evaluation form"
              className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg
                       text-white focus:border-neon-blue focus:outline-none"
            />
          </div>
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
          disabled={!topic || !date || !firstPresenter || isSubmitting}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-cyber-dark border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span>Log Presentation</span>
        </button>
      </div>
    </motion.form>
  );
}
