/**
 * AddBookModal - User version with Books Library selection
 */
import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface Book {
  id: string;
  name: string;
  category: string | null;
  points_per_10_pages: number;
}

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

export function AddBookModal({ isOpen, onClose, onSuccess, userId }: AddBookModalProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [pagesRead, setPagesRead] = useState('');
  const [notesLink, setNotesLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && isSupabaseConfigured()) {
      loadCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedCategory && isSupabaseConfigured()) {
      loadBooks(selectedCategory);
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    const { data } = await supabase.from('books_library').select('category').not('category', 'is', null);
    const uniqueCategories = [...new Set(data?.map(b => b.category).filter(Boolean) as string[])];
    setCategories(uniqueCategories);
  };

  const loadBooks = async (category: string) => {
    const { data } = await supabase.from('books_library').select('*').eq('category', category);
    setBooks(data || []);
  };

  const calculatedPoints = selectedBook ? Math.floor((parseFloat(pagesRead) || 0) / 10) * selectedBook.points_per_10_pages : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) return;

    setIsSubmitting(true);
    try {
      if (isSupabaseConfigured()) {
        const { data: cycle } = await supabase.from('cycles').select('id').eq('is_active', true).single();
        if (!cycle) throw new Error('No active cycle');

        await supabase.from('books').insert({
          player_id: userId,
          cycle_id: cycle.id,
          title: selectedBook.name,
          total_pages: parseFloat(pagesRead),
          pages_read: parseFloat(pagesRead),
          notes_link: notesLink.trim() || null,
        });
      }

      setSelectedCategory('');
      setSelectedBook(null);
      setPagesRead('');
      setNotesLink('');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to add book:', err);
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
                <h2 className="font-display text-xl font-bold text-white">Add Book</h2>
                <button onClick={onClose} disabled={isSubmitting}><X className="w-5 h-5 text-gray-400 hover:text-white" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                  <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setSelectedBook(null); }} className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg text-white focus:border-neon-blue focus:outline-none" required>
                    <option value="">Select category...</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                {selectedCategory && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Book *</label>
                    <select value={selectedBook?.id || ''} onChange={(e) => setSelectedBook(books.find(b => b.id === e.target.value) || null)} className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg text-white focus:border-neon-blue focus:outline-none" required>
                      <option value="">Select book...</option>
                      {books.map(book => <option key={book.id} value={book.id}>{book.name}</option>)}
                    </select>
                  </div>
                )}
                {selectedBook && (
                  <>
                    <div className="p-3 bg-neon-blue/10 rounded-lg">
                      <span className="text-sm text-gray-400">Points per 10 pages: </span>
                      <span className="text-neon-blue font-medium">{selectedBook.points_per_10_pages}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Pages Read *</label>
                      <input type="number" min="1" value={pagesRead} onChange={(e) => setPagesRead(e.target.value)} className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg text-white focus:border-neon-blue focus:outline-none" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Notes Link</label>
                      <input type="url" value={notesLink} onChange={(e) => setNotesLink(e.target.value)} className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg text-white focus:border-neon-blue focus:outline-none" />
                    </div>
                    {parseFloat(pagesRead) > 0 && (
                      <div className="p-3 bg-success/20 border border-success/50 rounded-lg text-center">
                        <span className="text-success font-medium">Points: +{calculatedPoints}</span>
                      </div>
                    )}
                  </>
                )}
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">Cancel</button>
                  <button type="submit" disabled={isSubmitting || !selectedBook} className="flex-1 btn-primary flex items-center justify-center gap-2">
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
