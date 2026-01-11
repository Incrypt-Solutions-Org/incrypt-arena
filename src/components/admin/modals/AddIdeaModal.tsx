/**
 * AddIdeaModal - Add new idea
 */
import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';

interface Player { player_id: string; player_name: string; }

interface AddIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  players: Player[];
}

export function AddIdeaModal({ isOpen, onClose, onSuccess, players }: AddIdeaModalProps) {
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer || !title.trim() || !points) return;

    setIsSubmitting(true);
    try {
      if (isSupabaseConfigured()) {
        const { data: cycle } = await supabase.from('cycles').select('id').eq('is_active', true).single();
        if (!cycle) throw new Error('No active cycle');
        await supabase.from('ideas').insert({ player_id: selectedPlayer, cycle_id: cycle.id, title: title.trim(), description: description.trim() || null, points: parseInt(points), date });
      }
      setSelectedPlayer('');
      setTitle('');
      setDescription('');
      setPoints('');
      setDate(new Date().toISOString().split('T')[0]);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to add idea:', err);
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
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="cyber-card p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold text-white">Add Idea</h2>
                <button onClick={onClose} disabled={isSubmitting}><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">User *</label>
                  <select value={selectedPlayer} onChange={(e) => setSelectedPlayer(e.target.value)} className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg text-white focus:border-neon-blue focus:outline-none" required>
                    <option value="">Select user...</option>
                    {players.map(p => <option key={p.player_id} value={p.player_id}>{p.player_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Idea Title *</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg text-white focus:border-neon-blue focus:outline-none" required disabled={isSubmitting} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg text-white focus:border-neon-blue focus:outline-none resize-none" disabled={isSubmitting} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Points *</label>
                  <input type="number" value={points} onChange={(e) => setPoints(e.target.value)} min="1" className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg text-white focus:border-neon-blue focus:outline-none" required disabled={isSubmitting} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg text-white focus:border-neon-blue focus:outline-none" disabled={isSubmitting} />
                </div>
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
