/**
 * UsersManager - Wrapper for users management
 */
import { useState } from 'react';
import { UsersPanel } from './UsersPanel';
import { EditUserModal } from './modals/EditUserModal';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  far_away: boolean;
  total_points: number;
}

export function UsersManager() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <>
      <UsersPanel key={refreshKey} onOpenEditModal={(user) => { setSelectedUser(user); setIsEditModalOpen(true); }} />
      <EditUserModal isOpen={isEditModalOpen} user={selectedUser} onClose={() => { setIsEditModalOpen(false); setSelectedUser(null); }} onSuccess={() => setRefreshKey(prev => prev + 1)} />
    </>
  );
}
