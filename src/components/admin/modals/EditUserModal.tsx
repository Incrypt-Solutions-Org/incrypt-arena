/**
 * EditUserModal - Edit user email and far_away status
 */
import { useState, useEffect } from 'react';
import { X, Save, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  far_away: boolean;
}

interface EditUserModalProps {
  isOpen: boolean;
  user: UserRecord | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditUserModal({ isOpen, user, onClose, onSuccess }: EditUserModalProps) {
  const [email, setEmail] = useState('');
  const [farAway, setFarAway] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setFarAway(user.far_away);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !email.trim()) return;

    setIsSubmitting(true);
    try {
      if (isSupabaseConfigured()) {
        await supabase.from('players').update({ email: email.trim(), far_away: farAway }).eq('id', user.id);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to update user:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && user && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="cyber-card p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-xl font-bold text-white">Edit User</h2>
                  <p className="text-xs text-gray-400 mt-1">{user.name}</p>
                </div>
                <button onClick={onClose} disabled={isSubmitting}><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg text-white focus:border-neon-blue focus:outline-none" required disabled={isSubmitting} />
                </div>
                
                <div className="p-4 bg-neon-blue/10 rounded-lg border border-neon-blue/30">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={farAway} onChange={(e) => setFarAway(e.target.checked)} disabled={isSubmitting} className="mt-1 w-4 h-4 rounded border-gray-600 bg-cyber-darker text-neon-blue focus:ring-neon-blue focus:ring-offset-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-neon-blue" />
                        <span className="font-medium text-white">Lives Far Away</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Apply 2× multiplier for attendance and early bird points due to long commute
                      </p>
                    </div>
                  </label>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 btn-primary flex items-center justify-center gap-2">
                    {isSubmitting ? <div className="w-4 h-4 border-2 border-cyber-dark border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Update</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
