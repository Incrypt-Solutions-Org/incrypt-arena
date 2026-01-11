/**
 * AddBookModal Component
 * Modal for adding new books to the library catalog
 */
import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddBookModal({ isOpen, onClose, onSuccess }: AddBookModalProps) {
  const [name, setName] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [pointsPer10Pages, setPointsPer10Pages] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      if (isSupabaseConfigured()) {
        const { error: insertError } = await supabase
          .from('books_library')
          .insert({
            name: name.trim(),
            author: author.trim() || null,
            category: category.trim() || null,
            points_per_10_pages: parseInt(pointsPer10Pages),
          });

        if (insertError) throw insertError;
      }

      // Reset form
      setName('');
      setAuthor('');
      setCategory('');
      setPointsPer10Pages('1');
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to add book:', err);
      setError('Failed to add book. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setName('');
      setAuthor('');
      setCategory('');
      setPointsPer10Pages('1');
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
                <h2 className="font-display text-xl font-bold text-white">
                  Add Book to Library
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
                {/* Book Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Book Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Clean Code"
                    className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg
                             text-white focus:border-neon-blue focus:outline-none"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* Author */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Author
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g., Robert C. Martin"
                    className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg
                             text-white focus:border-neon-blue focus:outline-none"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Software, Business, Management"
                    className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg
                             text-white focus:border-neon-blue focus:outline-none"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Points per 10 Pages */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Points per 10 Pages *
                  </label>
                  <input
                    type="number"
                    value={pointsPer10Pages}
                    onChange={(e) => setPointsPer10Pages(e.target.value)}
                    min="1"
                    step="1"
                    className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg
                             text-white focus:border-neon-blue focus:outline-none"
                    required
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Default: 1 point per 10 pages
                  </p>
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
                    disabled={isSubmitting || !name.trim()}
                    className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-cyber-dark border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>Save Book</span>
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
