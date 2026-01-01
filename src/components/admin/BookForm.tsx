/**
 * BookForm Component
 * Form for logging book reading progress
 * Points: 1 point per 10 pages read
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Send, Info } from 'lucide-react';
import type { LeaderboardEntry } from '../../types';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface BookFormProps {
  players: LeaderboardEntry[];
}

const BOOK_CATEGORIES = [
  { id: 'software', name: 'Software', emoji: '💻' },
  { id: 'management', name: 'Management', emoji: '📊' },
  { id: 'business', name: 'Business', emoji: '💼' },
  { id: 'soft_skills', name: 'Soft Skills', emoji: '🧠' },
] as const;

export function BookForm({ players }: BookFormProps) {
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [totalPages, setTotalPages] = useState('');
  const [pagesRead, setPagesRead] = useState('');
  const [notesLink, setNotesLink] = useState('');
  const [summaryNotes, setSummaryNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const calculatedPoints = Math.floor(parseInt(pagesRead || '0') / 10);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer || !title || !category || !totalPages || !pagesRead) return;

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
            category,
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
              +1 point per 10 pages read • Register books with Mr. Naggar first
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
              <li>• Choose a book from: Software, Management, Business, or Soft Skills</li>
              <li>• Register your book with Mr. Naggar first</li>
              <li>• Write summary notes to demonstrate understanding</li>
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

      {/* Book Details */}
      {selectedPlayer && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="cyber-card p-6 space-y-4"
        >
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Book Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {BOOK_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`
                    p-3 rounded-lg border text-center transition-all
                    ${category === cat.id
                      ? 'bg-neon-blue/20 border-neon-blue text-white'
                      : 'bg-cyber-darker border-gray-700 text-gray-400 hover:border-gray-500'
                    }
                  `}
                >
                  <span className="text-xl block mb-1">{cat.emoji}</span>
                  <span className="text-sm font-medium">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Book Title & Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Book Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Clean Code"
                className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg
                         text-white focus:border-neon-blue focus:outline-none"
                required
              />
            </div>
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
              />
            </div>
          </div>

          {/* Pages */}
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
              type="url"
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
          disabled={!selectedPlayer || !title || !category || !totalPages || !pagesRead || isSubmitting}
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
