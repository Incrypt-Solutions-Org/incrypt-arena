/**
 * IdeasPanel - View and manage ideas
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Edit, Trash2, Plus } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface IdeaRecord {
  id: string;
  player_id: string;
  title: string;
  description: string | null;
  points: number;
  date: string;
  player_name: string;
}

interface IdeasPanelProps {
  onOpenAddModal: () => void;
  onOpenEditModal: (idea: IdeaRecord) => void;
}

export function IdeasPanel({ onOpenAddModal, onOpenEditModal }: IdeasPanelProps) {
  const [ideas, setIdeas] = useState<IdeaRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadIdeas = async () => {
    setIsLoading(true);
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('ideas').select(`*, players:player_id (name)`).order('date', { ascending: false });
        if (!error && data) {
          setIdeas(data.map((i: any) => ({ ...i, player_name: i.players?.name || 'Unknown' })));
        }
      } catch (err) {
        console.error('Failed to load ideas:', err);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadIdeas();
  }, []);

  const handleDelete = async (ideaId: string) => {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('ideas').delete().eq('id', ideaId);
        setIdeas(ideas.filter(i => i.id !== ideaId));
        setDeleteConfirm(null);
      } catch (err) {
        console.error('Failed to delete idea:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-gold" />
            Ideas Management
          </h2>
          <p className="text-sm text-gray-400 mt-1">Manage employee ideas and innovations</p>
        </div>
        <button onClick={onOpenAddModal} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Add Idea</span>
        </button>
      </div>

      <div className="cyber-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center"><div className="w-6 h-6 border-2 border-neon-blue border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : ideas.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No ideas submitted yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-cyber-darker border-b border-gray-700">
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Idea Title</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">User</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Description</th>
                  <th className="px-4 py-3 text-center text-gray-400 font-medium">Points</th>
                  <th className="px-4 py-3 text-center text-gray-400 font-medium">Date</th>
                  <th className="px-4 py-3 text-center text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ideas.map((idea, idx) => (
                  <motion.tr key={idea.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="border-b border-gray-700/50 hover:bg-cyber-darker/30 transition-colors">
                    <td className="px-4 py-3 text-white font-medium">{idea.title}</td>
                    <td className="px-4 py-3 text-gray-300">{idea.player_name}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm max-w-xs truncate">{idea.description || '—'}</td>
                    <td className="px-4 py-3 text-center"><span className="text-success font-medium">+{idea.points}</span></td>
                    <td className="px-4 py-3 text-center text-gray-300 text-sm">{new Date(idea.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => onOpenEditModal(idea)} className="p-2 text-neon-blue hover:bg-neon-blue/20 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                        {deleteConfirm === idea.id ? (
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleDelete(idea.id)} className="px-3 py-1 text-xs bg-danger text-white rounded">Confirm</button>
                            <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1 text-xs bg-gray-600 text-white rounded">Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(idea.id)} className="p-2 text-danger hover:bg-danger/20 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
