/**
 * BooksPanel - Admin panel to view, edit, and delete player book records
 * Also includes the Add Book form (merged for fewer tabs)
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Edit, Trash2, Check, X, ExternalLink, Plus, ChevronUp } from 'lucide-react';
import { db } from '../../lib/supabaseApi';
import { useAuth } from '../../contexts/AuthContext';
import { BookForm } from './BookForm';
import type { LeaderboardEntry } from '../../types';

interface BookRecord {
  id: string;
  player_id: string;
  player_name: string;
  title: string;
  author: string | null;
  category: string | null;
  pages_read: number;
  total_pages: number;
  notes_link: string | null;
  points: number;
  verified: boolean;
  created_at: string;
  players?: { name: string };
}

interface BooksPanelProps {
  players: LeaderboardEntry[];
}

export function BooksPanel({ players }: BooksPanelProps) {
  const { session } = useAuth();
  const [books, setBooks] = useState<BookRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPagesRead, setEditPagesRead] = useState('0');
  const [editVerified, setEditVerified] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const loadBooks = async () => {
    setIsLoading(true);
    if (db.isConfigured()) {
      try {
        const { data } = await db.select<BookRecord[]>('books', {
          columns: '*,players:player_id(name)',
          order: 'created_at.desc',
        });
        if (data) {
          setBooks(data.map((b) => ({ ...b, player_name: b.players?.name || 'Unknown' })));
        }
      } catch (err) {
        console.error('Failed to load books:', err);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const handleDelete = async (recordId: string) => {
    if (db.isConfigured()) {
      try {
        await db.remove('books', { 'id': `eq.${recordId}` }, { authToken: session?.access_token });
        setBooks(books.filter(b => b.id !== recordId));
        setDeleteConfirm(null);
      } catch (err) {
        console.error('Failed to delete book:', err);
      }
    }
  };

  const startEdit = (record: BookRecord) => {
    setEditingId(record.id);
    setEditPagesRead(record.pages_read.toString());
    setEditVerified(record.verified);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditPagesRead('0');
    setEditVerified(false);
  };

  const saveEdit = async (recordId: string) => {
    if (db.isConfigured()) {
      try {
        const pagesRead = parseInt(editPagesRead) || 0;
        await db.update('books', {
          pages_read: pagesRead,
          verified: editVerified,
        }, { 'id': `eq.${recordId}` }, { authToken: session?.access_token });
        
        setBooks(books.map(b => 
          b.id === recordId 
            ? { ...b, pages_read: pagesRead, verified: editVerified, points: Math.floor(pagesRead / 10) } 
            : b
        ));
        setEditingId(null);
      } catch (err) {
        console.error('Failed to update book:', err);
      }
    }
  };

  const getCategoryLabel = (cat: string | null) => {
    const labels: Record<string, string> = {
      'software': 'Software',
      'management': 'Management',
      'business': 'Business',
      'soft_skills': 'Soft Skills',
    };
    return cat ? labels[cat] || cat : '-';
  };

  const handleFormSuccess = () => {
    loadBooks();
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-neon-blue" />
            Books Management
          </h2>
          <p className="text-sm text-gray-400 mt-1">View, verify, and manage player book records</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`btn-primary flex items-center gap-2 ${showAddForm ? 'bg-gray-600 hover:bg-gray-500' : ''}`}
        >
          {showAddForm ? <ChevronUp className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showAddForm ? 'Hide Form' : 'Add Book'}</span>
        </button>
      </div>

      {/* Collapsible Add Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="border border-neon-blue/30 rounded-lg p-4 bg-cyber-darker/50">
              <BookForm players={players} onSuccess={handleFormSuccess} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="cyber-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-neon-blue border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : books.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No book records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-cyber-darker border-b border-gray-700">
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Player</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Book</th>
                  <th className="px-4 py-3 text-center text-gray-400 font-medium">Category</th>
                  <th className="px-4 py-3 text-center text-gray-400 font-medium">Progress</th>
                  <th className="px-4 py-3 text-center text-gray-400 font-medium">Points</th>
                  <th className="px-4 py-3 text-center text-gray-400 font-medium">Verified</th>
                  <th className="px-4 py-3 text-center text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((record, idx) => (
                  <motion.tr 
                    key={record.id} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: idx * 0.02 }} 
                    className="border-b border-gray-700/50 hover:bg-cyber-darker/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-300 font-medium">{record.player_name}</td>
                    <td className="px-4 py-3 text-white">
                      <div>
                        <span className="font-medium">{record.title}</span>
                        {record.author && <span className="text-gray-500 text-sm ml-2">by {record.author}</span>}
                        {record.notes_link && (
                          <a href={record.notes_link} target="_blank" rel="noopener noreferrer" className="ml-2 text-neon-blue hover:text-white inline-flex">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 bg-neon-purple/20 text-neon-purple text-xs rounded">{getCategoryLabel(record.category)}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {editingId === record.id ? (
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            value={editPagesRead}
                            onChange={(e) => setEditPagesRead(e.target.value)}
                            min="0"
                            max={record.total_pages}
                            className="w-16 px-2 py-1 bg-cyber-dark border border-gray-600 rounded text-white text-center text-sm"
                          />
                          <span className="text-gray-500">/ {record.total_pages}</span>
                        </div>
                      ) : (
                        <span className="text-gray-300">{record.pages_read} / {record.total_pages}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-success font-medium">+{record.points}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {editingId === record.id ? (
                        <button 
                          onClick={() => setEditVerified(!editVerified)}
                          className={`px-3 py-1 rounded text-xs font-medium ${editVerified ? 'bg-success/20 text-success' : 'bg-gray-700 text-gray-400'}`}
                        >
                          {editVerified ? '✓ Yes' : 'No'}
                        </button>
                      ) : (
                        record.verified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-success/20 text-success text-xs">✓</span>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        {editingId === record.id ? (
                          <>
                            <button onClick={() => saveEdit(record.id)} className="p-2 text-success hover:bg-success/20 rounded-lg transition-colors">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={cancelEdit} className="p-2 text-gray-400 hover:bg-gray-600/20 rounded-lg transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(record)} className="p-2 text-neon-blue hover:bg-neon-blue/20 rounded-lg transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            {deleteConfirm === record.id ? (
                              <div className="flex items-center gap-1">
                                <button onClick={() => handleDelete(record.id)} className="px-2 py-1 text-xs bg-danger text-white rounded">Yes</button>
                                <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 text-xs bg-gray-600 text-white rounded">No</button>
                              </div>
                            ) : (
                              <button onClick={() => setDeleteConfirm(record.id)} className="p-2 text-danger hover:bg-danger/20 rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </>
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
