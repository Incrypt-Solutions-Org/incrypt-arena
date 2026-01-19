/**
 * PresentationsManager Component
 * Wrapper that manages Presentations panel, edit modal, and add form
 * Also includes the Add Presentation form (merged for fewer tabs)
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronUp, Presentation } from 'lucide-react';
import { PresentationsPanel } from './PresentationsPanel';
import { PresentationForm } from './PresentationForm';
import { BestPresentationPrize } from './BestPresentationPrize';
import { EditPresentationModal } from './modals/EditPresentationModal';
import type { LeaderboardEntry } from '../../types';

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

interface PresentationsManagerProps {
  players: LeaderboardEntry[];
}

export function PresentationsManager({ players }: PresentationsManagerProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPresentation, setSelectedPresentation] = useState<PresentationRecord | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleOpenEditModal = (presentation: PresentationRecord) => {
    setSelectedPresentation(presentation);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedPresentation(null);
  };

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
            <Presentation className="w-5 h-5 text-neon-blue" />
            Presentations Management
          </h2>
          <p className="text-sm text-gray-400 mt-1">View, edit, and manage presentation records</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`btn-primary flex items-center gap-2 ${showAddForm ? 'bg-gray-600 hover:bg-gray-500' : ''}`}
        >
          {showAddForm ? <ChevronUp className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showAddForm ? 'Hide Form' : 'Add Presentation'}</span>
        </button>
      </div>

      {/* Collapsible Add Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden space-y-6"
          >
            <div className="border border-neon-blue/30 rounded-lg p-4 bg-cyber-darker/50">
              <PresentationForm players={players} onSuccess={handleFormSuccess} />
            </div>
            
            {/* Best Presentation Prize */}
            <BestPresentationPrize players={players} onSuccess={handleFormSuccess} />
          </motion.div>
        )}
      </AnimatePresence>

      <PresentationsPanel
        key={refreshKey}
        onOpenEditModal={handleOpenEditModal}
      />
      
      <EditPresentationModal
        isOpen={isEditModalOpen}
        presentation={selectedPresentation}
        onClose={handleCloseEditModal}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
