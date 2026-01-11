/**
 * PresentationsPanel Component
 * Admin panel for viewing and managing all presentations
 * Shows list with edit/delete capabilities
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Presentation, Edit, Trash2, Calendar, Users } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface PresentationRecord {
  id: string;
  player_id: string;
  second_presenter_id: string | null;
  topic: string;
  date: string;
  points: number;
  is_solo: boolean;
  presentation_order: number;
  slides_url: string | null;
  youtube_url: string | null;
  eval_link: string | null;
  player_name: string;
  second_presenter_name: string | null;
}

interface PresentationsPanelProps {
  onOpenEditModal: (presentation: PresentationRecord) => void;
}

export function PresentationsPanel({ onOpenEditModal }: PresentationsPanelProps) {
  const [presentations, setPresentations] = useState<PresentationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadPresentations = async () => {
    setIsLoading(true);
    
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('presentations')
          .select(`
            *,
            players:player_id (name),
            second_presenter:second_presenter_id (name)
          `)
          .order('date', { ascending: false });

        if (!error && data) {
          const formatted = data.map((p: any) => ({
            ...p,
            player_name: p.players?.name || 'Unknown',
            second_presenter_name: p.second_presenter?.name || null,
          }));
          setPresentations(formatted);
        }
      } catch (err) {
        console.error('Failed to load presentations:', err);
      }
    } else {
      // Demo data
      setPresentations([
        {
          id: '1',
          player_id: '1',
          second_presenter_id: null,
          topic: 'Docker Fundamentals',
          date: '2024-12-15',
          points: 30,
          is_solo: true,
          presentation_order: 1,
          slides_url: null,
          youtube_url: null,
          eval_link: null,
          player_name: 'Hassan',
          second_presenter_name: null,
        },
      ]);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    loadPresentations();
  }, []);

  const handleDelete = async (presentationId: string) => {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('presentations')
          .delete()
          .eq('id', presentationId);

        if (!error) {
          setPresentations(presentations.filter(p => p.id !== presentationId));
          setDeleteConfirm(null);
        }
      } catch (err) {
        console.error('Failed to delete presentation:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
            <Presentation className="w-5 h-5 text-neon-blue" />
            Presentations Management
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            View and manage all presentation records
          </p>
        </div>
      </div>

      {/* Presentations Table */}
      <div className="cyber-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-neon-blue border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : presentations.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No presentations recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-cyber-darker border-b border-gray-700">
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Topic</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Presenter(s)</th>
                  <th className="px-4 py-3 text-center text-gray-400 font-medium">Date</th>
                  <th className="px-4 py-3 text-center text-gray-400 font-medium">Type</th>
                  <th className="px-4 py-3 text-center text-gray-400 font-medium">Points</th>
                  <th className="px-4 py-3 text-center text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {presentations.map((presentation, idx) => (
                  <motion.tr
                    key={presentation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-gray-700/50 hover:bg-cyber-darker/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-white font-medium">{presentation.topic}</td>
                    <td className="px-4 py-3 text-gray-300">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-gray-500" />
                        <span>
                          {presentation.player_name}
                          {presentation.second_presenter_name && (
                            <> & {presentation.second_presenter_name}</>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-300">
                      <div className="flex items-center justify-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-500" />
                        <span>{new Date(presentation.date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        presentation.is_solo
                          ? 'bg-neon-blue/20 text-neon-blue'
                          : 'bg-neon-purple/20 text-neon-purple'
                      }`}>
                        {presentation.is_solo ? 'Solo' : 'Pair'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-success font-medium">+{presentation.points}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onOpenEditModal(presentation)}
                          className="p-2 text-neon-blue hover:bg-neon-blue/20 rounded-lg transition-colors"
                          title="Edit presentation"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {deleteConfirm === presentation.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDelete(presentation.id)}
                              className="px-3 py-1 text-xs bg-danger text-white rounded hover:bg-danger/80"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-500"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(presentation.id)}
                            className="p-2 text-danger hover:bg-danger/20 rounded-lg transition-colors"
                            title="Delete presentation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Summary */}
      <div className="text-sm text-gray-400 text-center">
        {presentations.length} presentation{presentations.length !== 1 ? 's' : ''} recorded
      </div>
    </div>
  );
}
