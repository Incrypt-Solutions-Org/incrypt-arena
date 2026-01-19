/**
 * AttendancePanel - Admin panel to view, edit, and delete attendance records
 * Also includes the Log Attendance form (merged for fewer tabs)
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Edit, Trash2, Check, X, Clock, Plus, ChevronUp } from 'lucide-react';
import { db } from '../../lib/supabaseApi';
import { useAuth } from '../../contexts/AuthContext';
import { AttendanceForm } from './AttendanceForm';
import type { LeaderboardEntry } from '../../types';

interface AttendanceRecord {
  id: string;
  player_id: string;
  player_name: string;
  check_in_date: string;
  check_in_time: string | null;
  is_early_bird: boolean;
  points: number;
  players?: { name: string };
}

interface AttendancePanelProps {
  players: LeaderboardEntry[];
  onRefresh?: () => void;
}

export function AttendancePanel({ players, onRefresh }: AttendancePanelProps) {
  const { session } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editEarlyBird, setEditEarlyBird] = useState(false);
  const [editPoints, setEditPoints] = useState('1');
  const [showAddForm, setShowAddForm] = useState(false);

  const loadAttendance = async () => {
    setIsLoading(true);
    if (db.isConfigured()) {
      try {
        const { data } = await db.select<AttendanceRecord[]>('attendance', {
          columns: '*,players:player_id(name)',
          order: 'check_in_date.desc,check_in_time.desc',
        });
        if (data) {
          setAttendance(data.map((a) => ({ ...a, player_name: a.players?.name || 'Unknown' })));
        }
      } catch (err) {
        console.error('Failed to load attendance:', err);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  const handleDelete = async (recordId: string) => {
    if (db.isConfigured()) {
      try {
        await db.remove('attendance', { 'id': `eq.${recordId}` }, { authToken: session?.access_token });
        setAttendance(attendance.filter(a => a.id !== recordId));
        setDeleteConfirm(null);
        onRefresh?.();
      } catch (err) {
        console.error('Failed to delete attendance:', err);
      }
    }
  };

  const startEdit = (record: AttendanceRecord) => {
    setEditingId(record.id);
    setEditEarlyBird(record.is_early_bird);
    setEditPoints(record.points.toString());
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditEarlyBird(false);
    setEditPoints('1');
  };

  const saveEdit = async (recordId: string) => {
    if (db.isConfigured()) {
      try {
        await db.update('attendance', {
          is_early_bird: editEarlyBird,
          points: parseInt(editPoints) || 1,
        }, { 'id': `eq.${recordId}` }, { authToken: session?.access_token });
        
        setAttendance(attendance.map(a => 
          a.id === recordId 
            ? { ...a, is_early_bird: editEarlyBird, points: parseInt(editPoints) || 1 } 
            : a
        ));
        setEditingId(null);
        onRefresh?.();
      } catch (err) {
        console.error('Failed to update attendance:', err);
      }
    }
  };

  const handleFormSuccess = () => {
    loadAttendance();
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-neon-blue" />
            Attendance Management
          </h2>
          <p className="text-sm text-gray-400 mt-1">View, edit, and delete attendance records</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`btn-primary flex items-center gap-2 ${showAddForm ? 'bg-gray-600 hover:bg-gray-500' : ''}`}
        >
          {showAddForm ? <ChevronUp className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showAddForm ? 'Hide Form' : 'Log Attendance'}</span>
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
              <AttendanceForm players={players} onSuccess={handleFormSuccess} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="cyber-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-neon-blue border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : attendance.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No attendance records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-cyber-darker border-b border-gray-700">
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Date</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Player</th>
                  <th className="px-4 py-3 text-center text-gray-400 font-medium">Time</th>
                  <th className="px-4 py-3 text-center text-gray-400 font-medium">Early Bird</th>
                  <th className="px-4 py-3 text-center text-gray-400 font-medium">Points</th>
                  <th className="px-4 py-3 text-center text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record, idx) => (
                  <motion.tr 
                    key={record.id} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: idx * 0.02 }} 
                    className="border-b border-gray-700/50 hover:bg-cyber-darker/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-white">
                      {new Date(record.check_in_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-gray-300 font-medium">{record.player_name}</td>
                    <td className="px-4 py-3 text-center text-gray-400 text-sm">{record.check_in_time?.slice(0, 5) || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      {editingId === record.id ? (
                        <button 
                          onClick={() => setEditEarlyBird(!editEarlyBird)}
                          className={`px-3 py-1 rounded text-xs font-medium ${editEarlyBird ? 'bg-gold/20 text-gold' : 'bg-gray-700 text-gray-400'}`}
                        >
                          {editEarlyBird ? '🌅 Yes' : 'No'}
                        </button>
                      ) : (
                        record.is_early_bird ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gold/20 text-gold text-xs">
                            <Clock className="w-3 h-3" /> Yes
                          </span>
                        ) : (
                          <span className="text-gray-500">No</span>
                        )
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {editingId === record.id ? (
                        <input
                          type="number"
                          value={editPoints}
                          onChange={(e) => setEditPoints(e.target.value)}
                          min="0"
                          className="w-14 px-2 py-1 bg-cyber-dark border border-gray-600 rounded text-white text-center text-sm"
                        />
                      ) : (
                        <span className="text-success font-medium">+{record.points}</span>
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
