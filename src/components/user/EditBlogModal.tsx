/**
 * EditBlogModal - User version for editing blog name/URL
 */
import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface Blog {
  id: string;
  name: string;
  url: string;
  is_first: boolean;
  points: number;
}

interface EditBlogModalProps {
  isOpen: boolean;
  blog: Blog | null;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

export function EditBlogModal({ isOpen, blog, onClose, onSuccess, userId }: EditBlogModalProps) {
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
    if (!blog) return;

    setIsSubmitting(true);
    setError(null);

    try {
      if (isSupabaseConfigured()) {
        // Check for duplicate URL (excluding current blog)
        const { data: existing } = await supabase.from('blogs').select('id').eq('player_id', userId).eq('url', url.trim()).neq('id', blog.id);
        if (existing && existing.length > 0) {
          setError('You have already submitted this blog URL');
          setIsSubmitting(false);
          return;
        }

        await supabase.from('blogs').update({
          name: name.trim(),
          url: url.trim(),
        }).eq('id', blog.id);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to update blog:', err);
      if (err.message?.includes('duplicate') || err.code === '23505') {
        setError('This blog URL already exists in the system');
      } else {
        setError('Failed to update blog. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && blog && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="cyber-card p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-xl font-bold text-white">Edit Blog</h2>
                  <p className="text-xs text-gray-400 mt-1">{blog.is_first ? 'First Blog' : 'Subsequent'} • +{blog.points} pts</p>
                </div>
                <button onClick={onClose} disabled={isSubmitting}><X className="w-5 h-5 text-gray-400 hover:text-white" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Blog Name *</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg text-white focus:border-neon-blue focus:outline-none" required disabled={isSubmitting} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Blog URL *</label>
                  <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg text-white focus:border-neon-blue focus:outline-none" required disabled={isSubmitting} />
                </div>
                {error && <div className="p-3 bg-danger/20 border border-danger/50 rounded-lg text-danger text-sm">{error}</div>}
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 btn-primary flex items-center justify-center gap-2">
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
