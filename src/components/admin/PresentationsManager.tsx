/**
 * PresentationsManager Component
 * Wrapper that manages Presentations panel and edit modal
 */
import { useState } from 'react';
import { PresentationsPanel } from './PresentationsPanel';
import { EditPresentationModal } from './modals/EditPresentationModal';

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

export function PresentationsManager() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPresentation, setSelectedPresentation] = useState<PresentationRecord | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

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

  return (
    <>
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
    </>
  );
}
