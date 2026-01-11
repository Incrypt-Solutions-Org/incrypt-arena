/**
 * EditBookModal - User version for editing book pages read
 */
import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface Book {
  id: string;
  title: string;
  pages_read: number;
  total_pages: number;
  notes_link: string | null;
  points: number;
}

interface EditBookModalProps {
  isOpen: boolean;
  book: Book | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditBookModal({ isOpen, book, onClose, onSuccess }: EditBookModalProps) {
  const [pagesRead, setPagesRead] = useState('');
  const [notesLink, setNotesLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (book) {
      setPagesRead(book.pages_read.toString());
      setNotesLink(book.notes_link || '');
    }
  }, [book]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book) return;

    setIsSubmitting(true);
    try {
      if (isSupabaseConfigured()) {
        await supabase.from('books').update({
          pages_read: parseFloat(pagesRead),
          total_pages: parseFloat(pagesRead),
          notes_link: notesLink.trim() || null,
        }).eq('id', book.id);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to update book:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && book && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="cyber-card p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-xl font-bold text-white">Edit Book</h2>
                  <p className="text-xs text-gray-400 mt-1">{book.title} • +{book.points} pts</p>
                </div>
                <button onClick={onClose} disabled={isSubmitting}><X className="w-5 h-5 text-gray-400 hover:text-white" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Pages Read *</label>
                  <input type="number" min="1" value={pagesRead} onChange={(e) => setPagesRead(e.target.value)} className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg text-white focus:border-neon-blue focus:outline-none" required disabled={isSubmitting} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Notes Link</label>
                  <input type="url" value={notesLink} onChange={(e) => setNotesLink(e.target.value)} className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg text-white focus:border-neon-blue focus:outline-none" disabled={isSubmitting} />
                </div>
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
