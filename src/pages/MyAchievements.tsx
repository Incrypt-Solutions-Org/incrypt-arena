/**
 * My Achievements Page
 * Personal tracking page for logged-in users
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, GraduationCap, PenTool, Trophy, Calendar, Presentation as PresentationIcon, AlertTriangle, Award } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { AddCourseModal } from '../components/user/AddCourseModal';
import { AddBookModal } from '../components/user/AddBookModal';
import { AddBlogModal } from '../components/user/AddBlogModal';
import { CheckInCard } from '../components/user/CheckInCard';

const PERFORMANCE_TABS = [
  { id: 'attendance', label: 'Attendance', icon: Calendar },
  { id: 'activities', label: 'Activities', icon: Trophy },
  { id: 'presentations', label: 'Presentations', icon: PresentationIcon },
  { id: 'courses', label: 'Courses', icon: GraduationCap },
  { id: 'books', label: 'Books', icon: BookOpen },
  { id: 'blogs', label: 'Blogs', icon: PenTool },
  { id: 'penalties', label: 'Penalties', icon: AlertTriangle },
  { id: 'rewards', label: 'Rewards', icon: Award },
] as const;

type PerformanceTabId = typeof PERFORMANCE_TABS[number]['id'];

export default function MyAchievements() {
  const { user, playerData } = useAuth();
 const [activeTab, setActiveTab] = useState<PerformanceTabId>('attendance');
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [isAddBlogOpen, setIsAddBlogOpen] = useState(false);

  if (!user || !playerData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyber-dark via-cyber-darker to-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Please log in to view your achievements</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyber-dark via-cyber-darker to-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="cyber-card p-6">
          <h1 className="font-display text-3xl font-bold text-white mb-2">My Achievements</h1>
          <p className="text-gray-400">Track and manage your personal performance</p>
        </motion.div>

        {/* Wednesday Check-In Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <CheckInCard userId={playerData.id} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="cyber-card p-6">
          <h2 className="text-xl font-bold text-white mb-4">Add New Achievement</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button onClick={() => setIsAddCourseOpen(true)} className="p-4 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 border border-neon-blue/30 rounded-lg hover:border-neon-blue transition-all group">
              <GraduationCap className="w-8 h-8 text-neon-blue mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-white font-medium">Add Course</span>
            </button>
            <button onClick={() => setIsAddBookOpen(true)} className="p-4 bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 border border-neon-purple/30 rounded-lg hover:border-neon-purple transition-all group">
              <BookOpen className="w-8 h-8 text-neon-purple mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-white font-medium">Add Book</span>
            </button>
            <button onClick={() => setIsAddBlogOpen(true)} className="p-4 bg-gradient-to-r from-neon-pink/20 to-success/20 border border-neon-pink/30 rounded-lg hover:border-neon-pink transition-all group">
              <PenTool className="w-8 h-8 text-neon-pink mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-white font-medium">Add Blog</span>
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="cyber-card p-6">
          <h2 className="text-xl font-bold text-white mb-4">My Performance</h2>
          <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-700 pb-4">
            {PERFORMANCE_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === tab.id ? 'bg-neon-blue text-cyber-dark font-bold' : 'bg-cyber-darker text-gray-400 hover:text-white hover:bg-gray-700'}`}>
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
          <div className="min-h-[400px]">
            {activeTab === 'attendance' && <div className="text-gray-400">Attendance records coming soon...</div>}
            {activeTab === 'activities' && <div className="text-gray-400">Activities records coming soon...</div>}
            {activeTab === 'presentations' && <div className="text-gray-400">Presentations records coming soon...</div>}
            {activeTab === 'courses' && <div className="text-gray-400">Courses records coming soon...</div>}
            {activeTab === 'books' && <div className="text-gray-400">Books records coming soon...</div>}
            {activeTab === 'blogs' && <div className="text-gray-400">Blogs records coming soon...</div>}
            {activeTab === 'penalties' && <div className="text-gray-400">Penalties records coming soon...</div>}
            {activeTab === 'rewards' && <div className="text-gray-400">Rewards records coming soon...</div>}
          </div>
        </motion.div>
      </div>

      <AddCourseModal isOpen={isAddCourseOpen} onClose={() => setIsAddCourseOpen(false)} onSuccess={() => {}} userId={playerData.id} />
      <AddBookModal isOpen={isAddBookOpen} onClose={() => setIsAddBookOpen(false)} onSuccess={() => {}} userId={playerData.id} />
      <AddBlogModal isOpen={isAddBlogOpen} onClose={() => setIsAddBlogOpen(false)} onSuccess={() => {}} userId={playerData.id} />
    </div>
  );
}
