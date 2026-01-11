/**
 * BooksLibraryPanel Component
 * Admin panel for managing the master books catalog
 * CRUD operations: List, Add, Edit, Delete
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Edit, Trash2, Search } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface Book {
  id: string;
  name: string;
  author: string | null;
  category: string | null;
  points_per_10_pages: number;
  created_at: string;
}

interface BooksLibraryPanelProps {
  onOpenAddModal: () => void;
  onOpenEditModal: (book: Book) => void;
}

export function BooksLibraryPanel({ onOpenAddModal, onOpenEditModal }: BooksLibraryPanelProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadBooks = async () => {
    setIsLoading(true);
    
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('books_library')
          .select('*')
          .order('name');

        if (!error && data) {
          setBooks(data);
        }
      } catch (err) {
        console.error('Failed to load books:', err);
      }
    } else {
      // Demo data
      setBooks([
        {
          id: '1',
          name: 'Clean Code',
          author: 'Robert C. Martin',
          category: 'Software',
          points_per_10_pages: 1,
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'The Lean Startup',
          author: 'Eric Ries',
          category: 'Business',
          points_per_10_pages: 1,
          created_at: new Date().toISOString(),
        },
      ]);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const handleDelete = async (bookId: string) => {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('books_library')
          .delete()
          .eq('id', bookId);

        if (!error) {
          setBooks(books.filter(b => b.id !== bookId));
          setDeleteConfirm(null);
        }
      } catch (err) {
        console.error('Failed to delete book:', err);
      }
    }
  };

  const filteredBooks = books.filter(book =>
    book.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (book.author && book.author.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (book.category && book.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-neon-blue" />
            Books Library
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Master catalog of available books
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Book</span>
        </button>
      </div>

      {/* Search */}
      <div className="cyber-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search books..."
            className="w-full pl-10 pr-4 py-2 bg-cyber-darker border border-gray-700 rounded-lg
                     text-white focus:border-neon-blue focus:outline-none"
          />
        </div>
      </div>

      {/* Books Table */}
      <div className="cyber-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-neon-blue border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            {searchTerm ? 'No books found matching your search.' : 'No books in library yet.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-cyber-darker border-b border-gray-700">
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Book Name</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Author</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Category</th>
                  <th className="px-4 py-3 text-center text-gray-400 font-medium">Points/10 Pages</th>
                  <th className="px-4 py-3 text-center text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((book, idx) => (
                  <motion.tr
                    key={book.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-gray-700/50 hover:bg-cyber-darker/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-white font-medium">{book.name}</td>
                    <td className="px-4 py-3 text-gray-300">{book.author || '—'}</td>
                    <td className="px-4 py-3 text-gray-300">{book.category || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-neon-blue font-medium">{book.points_per_10_pages}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onOpenEditModal(book)}
                          className="p-2 text-neon-blue hover:bg-neon-blue/20 rounded-lg transition-colors"
                          title="Edit book"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {deleteConfirm === book.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDelete(book.id)}
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
                            onClick={() => setDeleteConfirm(book.id)}
                            className="p-2 text-danger hover:bg-danger/20 rounded-lg transition-colors"
                            title="Delete book"
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
        Showing {filteredBooks.length} of {books.length} book{books.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
