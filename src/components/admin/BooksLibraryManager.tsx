/**
 * BooksLibraryManager Component
 * Wrapper that manages Books Library panel and modals
 */
import { useState } from 'react';
import { BooksLibraryPanel } from './BooksLibraryPanel';
import { AddBookModal } from './modals/AddBookModal';
import { EditBookModal } from './modals/EditBookModal';

interface Book {
  id: string;
  name: string;
  author: string | null;
  category: string | null;
  points_per_10_pages: number;
  created_at: string;
}

export function BooksLibraryManager() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (book: Book) => {
    setSelectedBook(book);
    setIsEditModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedBook(null);
  };

  const handleSuccess = () => {
    // Trigger refresh by changing key
    setRefreshKey(prev => prev + 1);
  };

  return (
    <>
      <BooksLibraryPanel
        key={refreshKey}
        onOpenAddModal={handleOpenAddModal}
        onOpenEditModal={handleOpenEditModal}
      />
      
      <AddBookModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSuccess={handleSuccess}
      />
      
      <EditBookModal
        isOpen={isEditModalOpen}
        book={selectedBook}
        onClose={handleCloseEditModal}
        onSuccess={handleSuccess}
      />
    </>
  );
}
