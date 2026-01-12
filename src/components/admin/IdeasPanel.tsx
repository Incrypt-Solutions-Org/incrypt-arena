/**
 * IdeasPanel - View and manage ideas with pending approval workflow
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Edit, Trash2, Plus, Check, Clock } from 'lucide-react';
import { db } from '../../lib/supabaseApi';
import { useAuth } from '../../contexts/AuthContext';

interface IdeaRecord {
  id: string;
  player_id: string;
  title: string;
  description: string | null;
  idea_type: string | null;
  points: number;
  verified: boolean;
  created_at: string;
  player_name: string;
  players?: { name: string };
}

interface IdeasPanelProps {
  onOpenAddModal: () => void;
  onOpenEditModal: (idea: IdeaRecord) => void;
}

export function IdeasPanel({ onOpenAddModal, onOpenEditModal }: IdeasPanelProps) {
  const { session } = useAuth();
  const [ideas, setIdeas] = useState<IdeaRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [approvePoints, setApprovePoints] = useState<{ [key: string]: string }>({});

  const loadIdeas = async () => {
    setIsLoading(true);
    if (db.isConfigured()) {
      try {
        const { data } = await db.select<IdeaRecord[]>('ideas', {
          columns: '*,players:player_id(name)',
          order: 'created_at.desc',
        });
        if (data) {
          setIdeas(data.map((i) => ({ ...i, player_name: i.players?.name || 'Unknown' })));
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
    if (db.isConfigured()) {
      try {
        await db.remove('ideas', { 'id': `eq.${ideaId}` }, { authToken: session?.access_token });
        setIdeas(ideas.filter(i => i.id !== ideaId));
        setDeleteConfirm(null);
      } catch (err) {
        console.error('Failed to delete idea:', err);
      }
    }
  };

  const handleApprove = async (ideaId: string) => {
    const pointsValue = parseInt(approvePoints[ideaId] || '0');
    if (pointsValue <= 0) {
      alert('Please enter a valid points value');
      return;
    }

    if (db.isConfigured()) {
      try {
        await db.update('ideas', { 'id': `eq.${ideaId}` }, {
          verified: true,
          points: pointsValue,
        }, { authToken: session?.access_token });
        
        // Update local state
        setIdeas(ideas.map(i => i.id === ideaId ? { ...i, verified: true, points: pointsValue } : i));
        setApprovePoints({ ...approvePoints, [ideaId]: '' });
      } catch (err) {
        console.error('Failed to approve idea:', err);
      }
    }
  };

  const pendingIdeas = ideas.filter(i => !i.verified);
  const approvedIdeas = ideas.filter(i => i.verified);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-white flex items-center gap-2"><Lightbulb className="w-5 h-5 text-gold" />Ideas Management</h2>
          <p className="text-sm text-gray-400 mt-1">Manage and approve employee ideas and tools</p>
        </div>
        <button onClick={onOpenAddModal} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /><span>Add Idea</span></button>
      </div>

      {/* Pending Approval Section */}
      {pendingIdeas.length > 0 && (
        <div className="cyber-card p-4 border-orange-500/30 bg-orange-500/5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-orange-400" />
            <h3 className="font-bold text-orange-400">Pending Approval ({pendingIdeas.length})</h3>
          </div>
          <div className="space-y-3">
            {pendingIdeas.map((idea) => (
              <motion.div
                key={idea.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-cyber-darker rounded-lg border border-gray-700"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium">{idea.title}</span>
                      {idea.idea_type && (
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${idea.idea_type === 'tool' ? 'bg-neon-blue/20 text-neon-blue' : 'bg-gold/20 text-gold'}`}>
                          {idea.idea_type === 'tool' ? '🔧 Tool' : '💡 Idea'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mb-1">by {idea.player_name}</p>
                    {idea.description && <p className="text-sm text-gray-300">{idea.description}</p>}
                    <p className="text-xs text-gray-500 mt-2">{new Date(idea.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={approvePoints[idea.id] || ''}
                      onChange={(e) => setApprovePoints({ ...approvePoints, [idea.id]: e.target.value })}
                      placeholder="Points"
                      min="1"
                      className="w-20 px-2 py-2 bg-cyber-dark border border-gray-600 rounded text-white text-center text-sm focus:border-success focus:outline-none"
                    />
                    <button
                      onClick={() => handleApprove(idea.id)}
                      className="px-3 py-2 bg-success hover:bg-success/80 text-white rounded flex items-center gap-1 text-sm font-medium"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(deleteConfirm === idea.id ? null : idea.id)}
                      className="p-2 text-danger hover:bg-danger/20 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {deleteConfirm === idea.id && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-700">
                    <span className="text-sm text-gray-400">Delete this idea?</span>
                    <button onClick={() => handleDelete(idea.id)} className="px-3 py-1 text-xs bg-danger text-white rounded">Yes, Delete</button>
                    <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1 text-xs bg-gray-600 text-white rounded">Cancel</button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Approved Ideas Table */}
      <div className="cyber-card overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-700 flex items-center gap-2">
          <Check className="w-4 h-4 text-success" />
          <span className="font-medium text-white">Approved Ideas ({approvedIdeas.length})</span>
        </div>
        {isLoading ? (
          <div className="p-8 text-center"><div className="w-6 h-6 border-2 border-neon-blue border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : approvedIdeas.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No approved ideas yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-cyber-darker border-b border-gray-700">
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Title</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Type</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">User</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Description</th>
                  <th className="px-4 py-3 text-center text-gray-400 font-medium">Points</th>
                  <th className="px-4 py-3 text-center text-gray-400 font-medium">Date</th>
                  <th className="px-4 py-3 text-center text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {approvedIdeas.map((idea, idx) => (
                  <motion.tr key={idea.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="border-b border-gray-700/50 hover:bg-cyber-darker/30 transition-colors">
                    <td className="px-4 py-3 text-white font-medium">{idea.title}</td>
                    <td className="px-4 py-3">
                      {idea.idea_type && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${idea.idea_type === 'tool' ? 'bg-neon-blue/20 text-neon-blue' : 'bg-gold/20 text-gold'}`}>
                          {idea.idea_type === 'tool' ? '🔧' : '💡'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-300">{idea.player_name}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm max-w-xs truncate">{idea.description || '—'}</td>
                    <td className="px-4 py-3 text-center"><span className="text-success font-medium">+{idea.points}</span></td>
                    <td className="px-4 py-3 text-center text-gray-300 text-sm">{new Date(idea.created_at).toLocaleDateString()}</td>
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
