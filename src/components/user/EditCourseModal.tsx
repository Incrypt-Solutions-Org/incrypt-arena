/**
 * EditCourseModal - User version for editing their own courses
 */
import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface Course {
  id: string;
  name: string;
  course_url: string | null;
  notes_link: string | null;
  total_hours: number;
  completion_percent: number;
}

interface EditCourseModalProps {
  isOpen: boolean;
  course: Course | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditCourseModal({ isOpen, course, onClose, onSuccess }: EditCourseModalProps) {
  const [name, setName] = useState('');
  const [courseUrl, setCourseUrl] = useState('');
  const [notesUrl, setNotesUrl] = useState('');
  const [hours, setHours] = useState('');
  const [completion, setCompletion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (course) {
      setName(course.name);
      setCourseUrl(course.course_url || '');
      setNotesUrl(course.notes_link || '');
      setHours(course.total_hours.toString());
      setCompletion(course.completion_percent.toString());
    }
  }, [course]);

  const calculatedPoints = Math.floor((parseFloat(hours || '0') * parseFloat(completion || '0') / 100) * 4);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;

    const completionNum = parseFloat(completion);
    if (completionNum < 60) {
      setError('Minimum 60% completion required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (isSupabaseConfigured()) {
        await supabase.from('courses').update({
          name: name.trim(),
          course_url: courseUrl.trim() || null,
          notes_link: notesUrl.trim() || null,
          total_hours: parseFloat(hours),
          completion_percent: completionNum,
        }).eq('id', course.id);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to update course:', err);
      setError('Failed to update course. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && course && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="cyber-card p-6 max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold text-white">Edit Course</h2>
                <button onClick={onClose} disabled={isSubmitting}><X className="w-5 h-5 text-gray-400 hover:text-white" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Course Name *</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg text-white focus:border-neon-blue focus:outline-none" required disabled={isSubmitting} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Course URL</label>
                  <input type="url" value={courseUrl} onChange={(e) => setCourseUrl(e.target.value)} className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg text-white focus:border-neon-blue focus:outline-none" disabled={isSubmitting} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Notes URL</label>
                  <input type="url" value={notesUrl} onChange={(e) => setNotesUrl(e.target.value)} className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg text-white focus:border-neon-blue focus:outline-none" disabled={isSubmitting} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Number of Hours *</label>
                  <input type="number" step="0.5" value={hours} onChange={(e) => setHours(e.target.value)} className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg text-white focus:border-neon-blue focus:outline-none" required disabled={isSubmitting} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Completion Percentage * (min 60%)</label>
                  <input type="number" min="60" max="100" value={completion} onChange={(e) => setCompletion(e.target.value)} className="w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg text-white focus:border-neon-blue focus:outline-none" required disabled={isSubmitting} />
                </div>
                {parseFloat(completion) >= 60 && parseFloat(hours) > 0 && (
                  <div className="p-3 bg-success/20 border border-success/50 rounded-lg text-center">
                    <span className="text-success font-medium">Points: +{calculatedPoints}</span>
                  </div>
                )}
                {error && <div className="p-3 bg-danger/20 border border-danger/50 rounded-lg text-danger text-sm">{error}</div>}
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
