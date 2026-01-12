/**
 * BookForm Component
 * Form for logging book reading progress
 * Points: 1 point per 10 pages read
 * Books are selected from the Books Library
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Send, Info } from 'lucide-react';
import type { LeaderboardEntry } from '../../types';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface BookFormProps {
  players: LeaderboardEntry[];
}

interface LibraryBook {
  id: string;
  name: string;
  author: string | null;
  category: string | null;
  total_pages: number | null;
}

export function BookForm({ players }: BookFormProps) {
  const [libraryBooks, setLibraryBooks] = useState<LibraryBook[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [totalPages, setTotalPages] = useState('');
  const [pagesRead, setPagesRead] = useState('');
  const [notesLink, setNotesLink] = useState('');
  const [summaryNotes, setSummaryNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const calculatedPoints = Math.floor(parseInt(pagesRead || '0') / 10);

  // Fetch books from library on mount
  useEffect(() => {
    async function fetchLibraryBooks() {
      if (!isSupabaseConfigured()) {
        setIsLoadingBooks(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('books_library')
          .select('id, name, author, category, total_pages')
          .order('name');

        if (error) throw error;
        setLibraryBooks(data || []);
      } catch (err) {
        console.error('Failed to fetch library books:', err);
      } finally {
        setIsLoadingBooks(false);
      }
    }

    fetchLibraryBooks();
  }, []);

  // Auto-fill when a book is selected
  const handleBookSelect = (bookId: string) => {
    setSelectedBookId(bookId);
    
    if (bookId) {
      const book = libraryBooks.find(b => b.id === bookId);
      if (book) {
        setTitle(book.name);
        setAuthor(book.author || '');
        setCategory(book.category || '');
        setTotalPages(book.total_pages ? String(book.total_pages) : '');
      }
    } else {
      setTitle('');
      setAuthor('');
      setCategory('');
      setTotalPages('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer || !selectedBookId || !totalPages || !pagesRead) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      if (isSupabaseConfigured()) {
        // Get active cycle
        const { data: cycle } = await supabase
          .from('cycles')
          .select('id')
          .eq('is_active', true)
          .single();

        if (!cycle) throw new Error('No active cycle');

        const { error } = await supabase
          .from('books')
          .insert({
            player_id: selectedPlayer,
            cycle_id: cycle.id,
            title,
            author: author || null,
            category: category || null,
            total_pages: parseInt(totalPages),
            pages_read: parseInt(pagesRead),
            notes_link: notesLink || null,
            summary_notes: summaryNotes || null,
            verified: true, // Admin-submitted, auto-verified
          });

        if (error) throw error;
      }

      const playerName = players.find(p => p.player_id === selectedPlayer)?.player_name;
      setMessage(`✓ "${title}" logged for ${playerName}! +${calculatedPoints} points`);
      
      // Reset form
      setSelectedPlayer('');
      setSelectedBookId('');
      setTitle('');
      setAuthor('');
      setCategory('');
      setTotalPages('');
      setPagesRead('');
      setNotesLink('');
      setSummaryNotes('');
    } catch (err) {
      console.error('Failed to log book:', err);
      setMessage('❌ Failed to log book');
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
              <BookOpen className="w-5 h-5 text-neon-blue" />
              Book Reading Points
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              +1 point per 10 pages read • Select from library
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

      {/* Info Box */}
      <div className="cyber-card p-4 border-neon-blue/30 bg-neon-blue/5">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-neon-blue flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-300">
            <p className="font-medium text-white mb-1">How It Works:</p>
            <ul className="space-y-1 text-gray-400">
              <li>• Select a book from the library (added via Books Library tab)</li>
              <li>• Enter the total pages and pages you've read</li>
              <li>• Earn 1 point per 10 pages (introductions don't count)</li>
            </ul>
          </div>
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

      {/* Book Selection from Library */}
      {selectedPlayer && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="cyber-card p-6 space-y-4"
        >
          {/* Book Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Select Book from Library *
            </label>
            {isLoadingBooks ? (
              <div className="flex items-center gap-2 text-gray-400">
                <div className="w-4 h-4 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
                Loading books...
              </div>
            ) : libraryBooks.length === 0 ? (
              <div className="p-4 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm">
                No books in library. Add books via the "Books Library" tab first.
              </div>
            ) : (
              <select
                value={selectedBookId}
                onChange={(e) => handleBookSelect(e.target.value)}
                className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg
                         text-white focus:border-neon-blue focus:outline-none"
                required
              >
                <option value="">Choose a book...</option>
                {libraryBooks.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.name} {book.author ? `- ${book.author}` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Auto-filled Info (Read-only display) */}
          {selectedBookId && (
            <div className="p-3 bg-cyber-darker/50 rounded-lg border border-gray-700">
              <p className="text-sm text-gray-400 mb-1">Selected Book:</p>
              <p className="text-white font-medium">{title}</p>
              {author && <p className="text-sm text-gray-400">by {author}</p>}
              {category && <p className="text-xs text-neon-blue mt-1 capitalize">{category.replace('_', ' ')}</p>}
            </div>
          )}

          {/* Pages - User Input */}
          {selectedBookId && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Total Pages *
                  </label>
                  <input
                    type="number"
                    value={totalPages}
                    onChange={(e) => setTotalPages(e.target.value)}
                    placeholder="e.g., 464"
                    min="1"
                    className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg
                             text-white focus:border-neon-blue focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Pages Read (excluding intro) *
                  </label>
                  <input
                    type="number"
                    value={pagesRead}
                    onChange={(e) => setPagesRead(e.target.value)}
                    placeholder="e.g., 150"
                    min="0"
                    max={totalPages || undefined}
                    className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg
                             text-white focus:border-neon-blue focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Points Preview */}
              {parseInt(pagesRead || '0') > 0 && (
                <div className="p-4 bg-neon-blue/10 rounded-lg border border-neon-blue/30 text-center">
                  <span className="text-neon-blue font-medium">
                    📖 {pagesRead} pages ÷ 10 = <span className="text-2xl font-bold">+{calculatedPoints}</span> points
                  </span>
                </div>
              )}

              {/* Notes Link */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes Link (URL)
                </label>
                <input
                  type="text"
                  value={notesLink}
                  onChange={(e) => setNotesLink(e.target.value)}
                  placeholder="https://...your study notes"
                  className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg
                           text-white focus:border-neon-blue focus:outline-none"
                />
              </div>

              {/* Summary Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Summary Notes
                </label>
                <textarea
                  value={summaryNotes}
                  onChange={(e) => setSummaryNotes(e.target.value)}
                  placeholder="Key learnings and takeaways from the book..."
                  rows={3}
                  className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg
                           text-white focus:border-neon-blue focus:outline-none resize-none"
                />
              </div>
            </>
          )}
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
          disabled={!selectedPlayer || !selectedBookId || !totalPages || !pagesRead || isSubmitting}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-cyber-dark border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span>Log Book Progress</span>
        </button>
      </div>
    </motion.form>
  );
}
