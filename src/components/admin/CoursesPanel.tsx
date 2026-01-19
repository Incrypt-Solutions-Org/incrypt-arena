/**
 * CoursesPanel - Admin panel to view, edit, and delete course records
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Edit, Trash2, Check, X, ExternalLink } from 'lucide-react';
import { db } from '../../lib/supabaseApi';
import { useAuth } from '../../contexts/AuthContext';

interface CourseRecord {
  id: string;
  player_id: string;
  player_name: string;
  name: string;
  course_url: string | null;
  total_hours: number;
  completion_percent: number;
  points: number;
  verified: boolean;
  created_at: string;
  players?: { name: string };
}

export function CoursesPanel() {
  const { session } = useAuth();
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPoints, setEditPoints] = useState('0');
  const [editVerified, setEditVerified] = useState(false);

  const loadCourses = async () => {
    setIsLoading(true);
    if (db.isConfigured()) {
      try {
        const { data } = await db.select<CourseRecord[]>('courses', {
          columns: '*,players:player_id(name)',
          order: 'created_at.desc',
        });
        if (data) {
          setCourses(data.map((c) => ({ ...c, player_name: c.players?.name || 'Unknown' })));
        }
      } catch (err) {
        console.error('Failed to load courses:', err);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleDelete = async (recordId: string) => {
    if (db.isConfigured()) {
      try {
        await db.remove('courses', { 'id': `eq.${recordId}` }, { authToken: session?.access_token });
        setCourses(courses.filter(c => c.id !== recordId));
        setDeleteConfirm(null);
      } catch (err) {
        console.error('Failed to delete course:', err);
      }
    }
  };

  const startEdit = (record: CourseRecord) => {
    setEditingId(record.id);
    setEditPoints(record.points.toString());
    setEditVerified(record.verified);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditPoints('0');
    setEditVerified(false);
  };

  const saveEdit = async (recordId: string) => {
    if (db.isConfigured()) {
      try {
        await db.update('courses', {
          points: parseInt(editPoints) || 0,
          verified: editVerified,
        }, { 'id': `eq.${recordId}` }, { authToken: session?.access_token });
        
        setCourses(courses.map(c => 
          c.id === recordId 
            ? { ...c, points: parseInt(editPoints) || 0, verified: editVerified } 
            : c
        ));
        setEditingId(null);
      } catch (err) {
        console.error('Failed to update course:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-neon-blue" />
          Courses Management
        </h2>
        <p className="text-sm text-gray-400 mt-1">View, verify, and manage course submissions</p>
      </div>

      <div className="cyber-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-neon-blue border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : courses.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No course records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-cyber-darker border-b border-gray-700">
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Player</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Course</th>
                  <th className="px-4 py-3 text-center text-gray-400 font-medium">Hours</th>
                  <th className="px-4 py-3 text-center text-gray-400 font-medium">Done %</th>
                  <th className="px-4 py-3 text-center text-gray-400 font-medium">Points</th>
                  <th className="px-4 py-3 text-center text-gray-400 font-medium">Verified</th>
                  <th className="px-4 py-3 text-center text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((record, idx) => (
                  <motion.tr 
                    key={record.id} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: idx * 0.02 }} 
                    className="border-b border-gray-700/50 hover:bg-cyber-darker/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-300 font-medium">{record.player_name}</td>
                    <td className="px-4 py-3 text-white">
                      <div className="flex items-center gap-2">
                        <span>{record.name}</span>
                        {record.course_url && (
                          <a href={record.course_url} target="_blank" rel="noopener noreferrer" className="text-neon-blue hover:text-white">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-400">{record.total_hours}h</td>
                    <td className="px-4 py-3 text-center text-gray-400">{record.completion_percent}%</td>
                    <td className="px-4 py-3 text-center">
                      {editingId === record.id ? (
                        <input
                          type="number"
                          value={editPoints}
                          onChange={(e) => setEditPoints(e.target.value)}
                          min="0"
                          className="w-16 px-2 py-1 bg-cyber-dark border border-gray-600 rounded text-white text-center text-sm"
                        />
                      ) : (
                        <span className="text-success font-medium">+{record.points}</span>
                      )}
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
