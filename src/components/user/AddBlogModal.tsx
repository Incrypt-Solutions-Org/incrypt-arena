/**
 * AddBlogModal - User version with duplicate prevention and first blog detection
 */
import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface AddBlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

export function AddBlogModal({ isOpen, onClose, onSuccess, userId }: AddBlogModalProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (isSupabaseConfigured()) {
        // Check for duplicate URL
        const { data: existing } = await supabase.from('blogs').select('id').eq('player_id', userId).eq('url', url.trim());
        if (existing && existing.length > 0) {
          setError('You have already submitted this blog URL');
          setIsSubmitting(false);
          return;
        }

        // Check if first blog
        const { data: userBlogs } = await supabase.from('blogs').select('id').eq('player_id', userId);
        const isFirst = !userBlogs || userBlogs.length === 0;
        const points = isFirst ? 30 : 20;

        const { data: cycle } = await supabase.from('cycles').select('id').eq('is_active', true).single();
        if (!cycle) throw new Error('No active cycle');

        await supabase.from('blogs').insert({
          player_id: userId,
          cycle_id: cycle.id,
          name: name.trim(),
          url: url.trim(),
          is_first: isFirst,
          points,
        });
      }

      setName('');
      setUrl('');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to add blog:', err);
      if (err.message?.includes('duplicate') || err.code === '23505') {
        setError('This blog URL already exists in the system');
      } else {
        setError('Failed to add blog. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="cyber-card p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold text-white">Add Blog</h2>
                <button onClick={onClose} disabled={isSubmitting}><X className="w-5 h-5 text-gray-400 hover:text-white" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-3 bg-neon-blue/10 rounded-lg border border-neon-blue/30 text-sm text-gray-300">
                  <strong className="text-white">Auto-detection:</strong> Your first blog will receive +30 points, subsequent blogs +20 points each. Duplicate URLs are not allowed.
                </div>
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
                    <span>Save</span>
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
