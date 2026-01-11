/**
 * UsersPanel - View and manage users/players
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Edit } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  far_away: boolean;
  total_points: number;
}

interface UsersPanelProps {
  onOpenEditModal: (user: UserRecord) => void;
}

export function UsersPanel({ onOpenEditModal }: UsersPanelProps) {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadUsers = async () => {
    setIsLoading(true);
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('players').select('*').order('name');
        if (!error && data) {
          // Get total points from leaderboard
          const { data: lbData } = await supabase.from('leaderboard').select('player_id, total_points');
          const pointsMap = new Map(lbData?.map(l => [l.player_id, l.total_points]) || []);
          setUsers(data.map(u => ({ ...u, total_points: pointsMap.get(u.id) || 0 })));
        }
      } catch (err) {
        console.error('Failed to load users:', err);
      }
    } else {
      setUsers([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-neon-blue" />
          Users Management
        </h2>
        <p className="text-sm text-gray-400 mt-1">Manage user settings and far away status</p>
      </div>

      <div className="cyber-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center"><div className="w-6 h-6 border-2 border-neon-blue border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-cyber-darker border-b border-gray-700">
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">User Name</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Email</th>
                  <th className="px-4 py-3 text-center text-gray-400 font-medium">Far Away</th>
                  <th className="px-4 py-3 text-center text-gray-400 font-medium">Total Points</th>
                  <th className="px-4 py-3 text-center text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <motion.tr key={user.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="border-b border-gray-700/50 hover:bg-cyber-darker/30 transition-colors">
                    <td className="px-4 py-3 text-white font-medium">{user.name}</td>
                    <td className="px-4 py-3 text-gray-300">{user.email}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${user.far_away ? 'bg-neon-blue/20 text-neon-blue' : 'bg-gray-700 text-gray-400'}`}>
                        {user.far_away ? '✓ Yes (2× pts)' : '✗ No'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-300 font-medium">{user.total_points}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center">
                        <button onClick={() => onOpenEditModal(user)} className="p-2 text-neon-blue hover:bg-neon-blue/20 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
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
