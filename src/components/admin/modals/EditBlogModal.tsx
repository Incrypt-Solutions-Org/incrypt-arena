/**
 * EditBlogModal Component
 * Edit blog name and URL
 */
import { useState, useEffect } from 'react';
import { X, Save, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';

interface BlogRecord {
  id: string;
  name: string;
  url: string;
  player_name: string;
  is_first: boolean;
  points: number;
}

interface EditBlogModalProps {
  isOpen: boolean;
  blog: BlogRecord | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditBlogModal({ isOpen, blog, onClose, onSuccess }: EditBlogModalProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (blog) {
      setName(blog.name);
      setUrl(blog.url);
    }
  }, [blog]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blog || !name.trim() || !url.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      if (isSupabaseConfigured()) {
        const { error: updateError } = await supabase
          .from('blogs')
          .update({
            name: name.trim(),
            url: url.trim(),
          })
          .eq('id', blog.id);

        if (updateError) throw updateError;
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to update blog:', err);
      setError('Failed to update blog. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && blog && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="cyber-card p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-xl font-bold text-white">Edit Blog</h2>
                  <p className="text-xs text-gray-400 mt-1">
                    {blog.player_name} • {blog.is_first ? 'First Blog' : 'Subsequent'} • +{blog.points} pts
                  </p>
                </div>
                <button onClick={onClose} disabled={isSubmitting} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Blog Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg text-white focus:border-neon-blue focus:outline-none"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    Blog URL *
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg text-white focus:border-neon-blue focus:outline-none"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {error && <div className="p-3 bg-danger/20 border border-danger/50 rounded-lg text-danger text-sm">{error}</div>}

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">Cancel</button>
                  <button type="submit" disabled={isSubmitting || !name.trim() || !url.trim()} className="flex-1 btn-primary flex items-center justify-center gap-2">
                    {isSubmitting ? <div className="w-4 h-4 border-2 border-cyber-dark border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
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
