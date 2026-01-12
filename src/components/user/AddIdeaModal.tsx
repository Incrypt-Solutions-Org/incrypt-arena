/**
 * AddIdeaModal Component (Player Version)
 * Modal for players to submit ideas/tools
 * Submitted as pending (verified: false, points: 0)
 */
import { useState } from 'react';
import { X, Send, Lightbulb, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../lib/supabaseApi';
import { useAuth } from '../../contexts/AuthContext';

interface AddIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddIdeaModal({ isOpen, onClose, onSuccess }: AddIdeaModalProps) {
  const { session, playerData } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ideaType, setIdeaType] = useState<'idea' | 'tool'>('idea');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !playerData?.id || !session?.access_token) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Get active cycle
      const { data: cycles } = await db.select<{ id: string }[]>('cycles', {
        columns: 'id',
        filters: { 'is_active': 'eq.true' },
        limit: 1,
      });

      if (!cycles || cycles.length === 0) {
        throw new Error('No active cycle found');
      }

      // Insert idea as pending
      const { error: insertError } = await db.insert('ideas', {
        player_id: playerData.id,
        cycle_id: cycles[0].id,
        title: title.trim(),
        description: description.trim() || null,
        idea_type: ideaType,
        points: 0,
        verified: false,
      }, { authToken: session.access_token });

      if (insertError) throw new Error(insertError.message);

      // Reset form
      setTitle('');
      setDescription('');
      setIdeaType('idea');
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to submit idea:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit idea');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setTitle('');
      setDescription('');
      setIdeaType('idea');
      setError(null);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
                <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-gold" />
                  Submit Idea / Tool
                </h2>
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
                {/* Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Type *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setIdeaType('idea')}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        ideaType === 'idea'
                          ? 'bg-gold/20 border-gold text-gold'
                          : 'bg-cyber-darker border-gray-700 text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      <Lightbulb className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-sm font-medium">Idea</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIdeaType('tool')}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        ideaType === 'tool'
                          ? 'bg-neon-blue/20 border-neon-blue text-neon-blue'
                          : 'bg-cyber-darker border-gray-700 text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      <Wrench className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-sm font-medium">Tool</span>
                    </button>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Brief title for your idea/tool"
                    className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg
                             text-white focus:border-gold focus:outline-none"
                    required
                    disabled={isSubmitting}
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
                    placeholder="Describe your idea or tool in detail..."
                    rows={4}
                    className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg
                             text-white focus:border-gold focus:outline-none resize-none"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Info */}
                <div className="p-3 bg-gold/10 border border-gold/30 rounded-lg text-sm text-gray-300">
                  💡 Your submission will be reviewed by an admin who will assign points based on its value.
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-danger/20 border border-danger/50 rounded-lg text-danger text-sm">
                    {error}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
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
                    disabled={isSubmitting || !title.trim()}
                    className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 bg-gold hover:bg-gold/80"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-cyber-dark border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>Submit</span>
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
