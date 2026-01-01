/**
 * Admin Dashboard Page
 * Main admin interface for managing player points
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, Calendar, BookOpen, PenTool, Presentation, 
  Trophy, AlertTriangle, LogOut, Lightbulb, Zap
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useAdvancedScoring } from '../hooks/useAdvancedScoring';
import { AttendanceForm } from '../components/admin/AttendanceForm';
import { PointsForm } from '../components/admin/PointsForm';
import { ActivityForm } from '../components/admin/ActivityForm';
import { BookForm } from '../components/admin/BookForm';
import { IdeasForm } from '../components/IdeasForm';
import { StreaksPanel } from '../components/admin/StreaksPanel';

/**
 * Admin navigation tabs
 */
const ADMIN_TABS = [
  { id: 'attendance', label: 'Attendance', icon: Calendar },
  { id: 'activities', label: 'Activities', icon: Trophy },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'books', label: 'Books', icon: BookOpen },
  { id: 'blogs', label: 'Blogs', icon: PenTool },
  { id: 'presentations', label: 'Presentations', icon: Presentation },
  { id: 'penalties', label: 'Penalties', icon: AlertTriangle },
  { id: 'ideas', label: 'Ideas', icon: Lightbulb },
  { id: 'streaks', label: 'Streaks & Bonuses', icon: Zap },
] as const;

type TabId = typeof ADMIN_TABS[number]['id'];

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading, signOut } = useAuth();
  const { entries, totalPlayers } = useLeaderboard();
  const { calculateStreaks, calculateAttendanceChampion, isLoading: scoringLoading } = useAdvancedScoring();
  const [activeTab, setActiveTab] = useState<TabId>('attendance');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/admin');
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin');
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-12 h-12 border-4 border-neon-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-neon-blue" />
          <div>
            <h1 className="font-display text-2xl font-bold text-white">
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-400">
              {totalPlayers} players • Logged in as {user?.email}
            </p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="btn-secondary flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 p-2 cyber-card overflow-x-auto">
        {ADMIN_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap
              ${activeTab === id
                ? 'bg-neon-blue text-cyber-dark font-semibold'
                : 'text-gray-300 hover:bg-neon-blue/10 hover:text-neon-blue'
              }
            `}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'attendance' && (
          <AttendanceForm players={entries} />
        )}
        {activeTab === 'activities' && (
          <ActivityForm players={entries} />
        )}
        {activeTab === 'courses' && (
          <PointsForm 
            title="Course Points"
            description="Award points for completed courses. Formula: (Hours × Completion%) × 4"
            players={entries}
            category="course"
          />
        )}
        {activeTab === 'books' && (
          <BookForm players={entries} />
        )}
        {activeTab === 'blogs' && (
          <PointsForm 
            title="Blog Points"
            description="First blog: 30 pts, subsequent blogs: 20 pts each"
            players={entries}
            category="blog"
          />
        )}
        {activeTab === 'presentations' && (
          <PointsForm 
            title="Presentation Points"
            description="1st solo: 30 pts, 1st pair: 20 pts. Best presentation: +20 pts"
            players={entries}
            category="presentation"
          />
        )}
        {activeTab === 'penalties' && (
          <PointsForm 
            title="Penalties"
            description="Deductions: -1 per 5 absences, -1 per vacation day without Deel submission"
            players={entries}
            category="penalty"
            isNegative
          />
        )}
        {activeTab === 'ideas' && (
          <IdeasForm players={entries} />
        )}
        {activeTab === 'streaks' && (
          <StreaksPanel 
            calculateStreaks={calculateStreaks}
            calculateAttendanceChampion={calculateAttendanceChampion}
            isLoading={scoringLoading}
          />
        )}
      </motion.div>
    </div>
  );
}
