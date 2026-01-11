/**
 * IdeasManager - Wrapper for ideas management
 */
import { useState } from 'react';
import { IdeasPanel } from './IdeasPanel';
import { AddIdeaModal } from './modals/AddIdeaModal';
import { EditIdeaModal } from './modals/EditIdeaModal';
import type { LeaderboardEntry } from '../../types';

interface IdeaRecord {
  id: string;
  player_id: string;
  title: string;
  description: string | null;
  points: number;
  date: string;
  player_name: string;
}

interface IdeasManagerProps {
  players: LeaderboardEntry[];
}

export function IdeasManager({ players }: IdeasManagerProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<IdeaRecord | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const playersForModal = players.map(p => ({ player_id: p.player_id, player_name: p.player_name }));

  return (
    <>
      <IdeasPanel key={refreshKey} onOpenAddModal={() => setIsAddModalOpen(true)} onOpenEditModal={(idea) => { setSelectedIdea(idea); setIsEditModalOpen(true); }} />
      <AddIdeaModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={() => setRefreshKey(prev => prev + 1)} players={playersForModal} />
      <EditIdeaModal isOpen={isEditModalOpen} idea={selectedIdea} onClose={() => { setIsEditModalOpen(false); setSelectedIdea(null); }} onSuccess={() => setRefreshKey(prev => prev + 1)} />
    </>
  );
}
