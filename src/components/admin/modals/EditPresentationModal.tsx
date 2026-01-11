/**
 * EditPresentationModal Component  
 * Modal for editing existing presentation records
 */
import { useState, useEffect } from 'react';
import { X, Save, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';

interface PresentationRecord {
  id: string;
  topic: string;
  date: string;
  slides_url: string | null;
  youtube_url: string | null;
  eval_link: string | null;
  points: number;
  is_solo: boolean;
  player_name: string;
  second_presenter_name: string | null;
}

interface EditPresentationModalProps {
  isOpen: boolean;
  presentation: PresentationRecord | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditPresentationModal({ isOpen, presentation, onClose, onSuccess }: EditPresentationModalProps) {
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState('');
  const [slidesUrl, setSlidesUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [evalLink, setEvalLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (presentation) {
      setTopic(presentation.topic);
      setDate(presentation.date);
      setSlidesUrl(presentation.slides_url || '');
      setYoutubeUrl(presentation.youtube_url || '');
      setEvalLink(presentation.eval_link || '');
    }
  }, [presentation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!presentation || !topic.trim() || !date) return;

    setIsSubmitting(true);
    setError(null);

    try {
      if (isSupabaseConfigured()) {
        const { error: updateError } = await supabase
          .from('presentations')
          .update({
            topic: topic.trim(),
            date,
            slides_url: slidesUrl.trim() || null,
            youtube_url: youtubeUrl.trim() || null,
            eval_link: evalLink.trim() || null,
          })
          .eq('id', presentation.id);

        if (updateError) throw updateError;
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to update presentation:', err);
      setError('Failed to update presentation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setError(null);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && presentation && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="cyber-card p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-xl font-bold text-white">
                    Edit Presentation
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    {presentation.player_name}
                    {presentation.second_presenter_name && ` & ${presentation.second_presenter_name}`}
                    {' '} • {presentation.is_solo ? 'Solo' : 'Pair'} • +{presentation.points} pts
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Topic */}
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
                    disabled={isSubmitting}
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg
                             text-white focus:border-neon-blue focus:outline-none"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* Slides URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    Slides Link
                  </label>
                  <input
                    type="url"
                    value={slidesUrl}
                    onChange={(e) => setSlidesUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg
                             text-white focus:border-neon-blue focus:outline-none"
                    disabled={isSubmitting}
                  />
                </div>

                {/* YouTube URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    YouTube Link
                  </label>
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://youtube.com/..."
                    className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg
                             text-white focus:border-neon-blue focus:outline-none"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Eval Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    Evaluation Link
                  </label>
                  <input
                    type="url"
                    value={evalLink}
                    onChange={(e) => setEvalLink(e.target.value)}
                    placeholder="https://...evaluation form"
                    className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg
                             text-white focus:border-neon-blue focus:outline-none"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-danger/20 border border-danger/50 rounded-lg text-danger text-sm">
                    {error}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg
                             transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !topic.trim() || !date}
                    className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-cyber-dark border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>Update</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
