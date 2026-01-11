/**
 * BlogsManager - Wrapper for blogs management
 */
import { useState } from 'react';
import { BlogsPanel } from './BlogsPanel';
import { EditBlogModal } from './modals/EditBlogModal';

interface BlogRecord {
  id: string;
  player_id: string;
  name: string;
  url: string;
  is_first: boolean;
  points: number;
  created_at: string;
  player_name: string;
}

export function BlogsManager() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<BlogRecord | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleOpenEditModal = (blog: BlogRecord) => {
    setSelectedBlog(blog);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedBlog(null);
  };

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <>
      <BlogsPanel key={refreshKey} onOpenEditModal={handleOpenEditModal} />
      <EditBlogModal isOpen={isEditModalOpen} blog={selectedBlog} onClose={handleCloseEditModal} onSuccess={handleSuccess} />
    </>
  );
}
