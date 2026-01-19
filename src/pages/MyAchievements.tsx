/**
 * My Achievements Page
 * Personal tracking page for logged-in users
 */
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, GraduationCap, PenTool, Trophy, Calendar, Presentation as PresentationIcon, AlertTriangle, Award, Check, Lightbulb } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/supabaseApi';
import { AddCourseModal } from '../components/user/AddCourseModal';
import { AddBookModal } from '../components/user/AddBookModal';
import { AddBlogModal } from '../components/user/AddBlogModal';
import { AddIdeaModal } from '../components/user/AddIdeaModal';
import { CheckInCard } from '../components/user/CheckInCard';

const PERFORMANCE_TABS = [
  { id: 'attendance', label: 'Attendance', icon: Calendar },
  { id: 'activities', label: 'Activities', icon: Trophy },
  { id: 'presentations', label: 'Presentations', icon: PresentationIcon },
  { id: 'courses', label: 'Courses', icon: GraduationCap },
  { id: 'books', label: 'Books', icon: BookOpen },
  { id: 'blogs', label: 'Blogs', icon: PenTool },
  { id: 'ideas', label: 'Ideas', icon: Lightbulb },
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
  const [isAddIdeaOpen, setIsAddIdeaOpen] = useState(false);

  const [attendance, setAttendance] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const ensureProtocol = (link: string) => {
    if (!link) return '';
    if (link.startsWith('http://') || link.startsWith('https://')) return link;
    return `https://${link}`;
  };

  const fetchAttendance = useCallback(async () => {
    if (!playerData?.id || !db.isConfigured()) return;
    setIsLoading(true);
    try {
      const { data } = await db.select('attendance', {
        columns: '*',
        filters: { 'player_id': `eq.${playerData.id}` },
        order: 'check_in_date.desc',
      });
      if (data) setAttendance(data as any[]);
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
    } finally {
      setIsLoading(false);
    }
  }, [playerData?.id]);

  const fetchActivities = useCallback(async () => {
    if (!playerData?.id || !db.isConfigured()) return;
    setIsLoading(true);
    try {
      const { data } = await db.select('activity_participations', {
        columns: '*,activities:activity_id(name,date,activity_type)',
        filters: { 'player_id': `eq.${playerData.id}` },
        order: 'created_at.desc',
      });
      if (data) setActivities(data as any[]);
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    } finally {
      setIsLoading(false);
    }
  }, [playerData?.id]);

  const fetchCourses = useCallback(async () => {
    if (!playerData?.id || !db.isConfigured()) return;
    setIsLoading(true);
    try {
      const { data } = await db.select('courses', {
        columns: '*',
        filters: { 'player_id': `eq.${playerData.id}` },
        order: 'created_at.desc',
      });
      if (data) setCourses(data as any[]);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setIsLoading(false);
    }
  }, [playerData?.id]);

  const fetchBooks = useCallback(async () => {
    if (!playerData?.id || !db.isConfigured()) return;
    setIsLoading(true);
    try {
      const { data } = await db.select('books', {
        columns: '*',
        filters: { 'player_id': `eq.${playerData.id}` },
        order: 'created_at.desc',
      });
      if (data) setBooks(data as any[]);
    } catch (err) {
      console.error('Failed to fetch books:', err);
    } finally {
      setIsLoading(false);
    }
  }, [playerData?.id]);

  const fetchBlogs = useCallback(async () => {
    if (!playerData?.id || !db.isConfigured()) return;
    setIsLoading(true);
    try {
      const { data } = await db.select('blogs', {
        columns: '*',
        filters: { 'player_id': `eq.${playerData.id}` },
        order: 'created_at.desc',
      });
      if (data) setBlogs(data as any[]);
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [playerData?.id]);

  const fetchIdeas = useCallback(async () => {
    if (!playerData?.id || !db.isConfigured()) return;
    setIsLoading(true);
    try {
      const { data } = await db.select('ideas', {
        columns: '*',
        filters: { 'player_id': `eq.${playerData.id}` },
        order: 'created_at.desc',
      });
      if (data) setIdeas(data as any[]);
    } catch (err) {
      console.error('Failed to fetch ideas:', err);
    } finally {
      setIsLoading(false);
    }
  }, [playerData?.id]);

  useEffect(() => {
    if (activeTab === 'attendance') {
      fetchAttendance();
    } else if (activeTab === 'activities') {
      fetchActivities();
    } else if (activeTab === 'courses') {
      fetchCourses();
    } else if (activeTab === 'books') {
      fetchBooks();
    } else if (activeTab === 'blogs') {
      fetchBlogs();
    } else if (activeTab === 'ideas') {
      fetchIdeas();
    }
  }, [activeTab, fetchAttendance, fetchActivities, fetchCourses, fetchBooks, fetchBlogs, fetchIdeas]);

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
          <CheckInCard userId={playerData.id} onSuccess={fetchAttendance} />
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
            <button onClick={() => setIsAddIdeaOpen(true)} className="p-4 bg-gradient-to-r from-gold/20 to-orange-500/20 border border-gold/30 rounded-lg hover:border-gold transition-all group">
              <Lightbulb className="w-8 h-8 text-gold mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-white font-medium">Add Idea/Tool</span>
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
            {activeTab === 'attendance' && (
              <div className="cyber-card overflow-hidden">
                {isLoading ? (
                  <div className="p-8 text-center"><div className="w-6 h-6 border-2 border-neon-blue border-t-transparent rounded-full animate-spin mx-auto" /></div>
                ) : attendance.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">No attendance records found.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-cyber-darker border-b border-gray-700">
                          <th className="px-4 py-3 text-left text-gray-400 font-medium">Date</th>
                          <th className="px-4 py-3 text-left text-gray-400 font-medium">Time</th>
                          <th className="px-4 py-3 text-center text-gray-400 font-medium">Points</th>
                          <th className="px-4 py-3 text-center text-gray-400 font-medium">Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendance.map((record, idx) => (
                          <motion.tr key={record.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="border-b border-gray-700/50 hover:bg-cyber-darker/30 transition-colors">
                            <td className="px-4 py-3 text-white font-medium">{new Date(record.check_in_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                            <td className="px-4 py-3 text-gray-300">{record.check_in_time?.slice(0, 5) || '—'}</td>
                             <td className="px-4 py-3 text-center"><span className="text-success font-medium">+{record.points}</span></td>
                             <td className="px-4 py-3 text-center">
                               {record.is_early_bird ? (
                                 <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gold/20 text-gold text-xs font-medium"><Award className="w-3 h-3" />Early Bird</span>
                               ) : (
                                 <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-neon-blue/20 text-neon-blue text-xs font-medium"><Check className="w-3 h-3" />Standard</span>
                               )}
                             </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'activities' && (
              <div className="cyber-card overflow-hidden">
                {isLoading ? (
                  <div className="p-8 text-center"><div className="w-6 h-6 border-2 border-neon-blue border-t-transparent rounded-full animate-spin mx-auto" /></div>
                ) : activities.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">No activities participated in yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-cyber-darker border-b border-gray-700">
                          <th className="px-4 py-3 text-left text-gray-400 font-medium">Activity</th>
                          <th className="px-4 py-3 text-left text-gray-400 font-medium">Type</th>
                          <th className="px-4 py-3 text-center text-gray-400 font-medium">Points</th>
                          <th className="px-4 py-3 text-center text-gray-400 font-medium">Top Performer</th>
                          <th className="px-4 py-3 text-left text-gray-400 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activities.map((record, idx) => (
                          <motion.tr key={record.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="border-b border-gray-700/50 hover:bg-cyber-darker/30 transition-colors">
                            <td className="px-4 py-3 text-white font-medium">{record.activities?.name || 'Unknown'}</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 bg-neon-blue/20 text-neon-blue text-xs rounded">{record.activities?.activity_type || '-'}</span>
                            </td>
                            <td className="px-4 py-3 text-center"><span className="text-success font-medium">+{record.points}</span></td>
                            <td className="px-4 py-3 text-center">
                              {record.is_top_performer ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gold/20 text-gold text-xs font-medium">⭐ Yes</span>
                              ) : (
                                <span className="text-gray-500">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-gray-300">{record.activities?.date ? new Date(record.activities.date).toLocaleDateString() : '-'}</td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'presentations' && <div className="text-gray-400">Presentations records coming soon...</div>}
            {activeTab === 'courses' && (
              <div className="cyber-card overflow-hidden">
                {isLoading ? (
                  <div className="p-8 text-center"><div className="w-6 h-6 border-2 border-neon-blue border-t-transparent rounded-full animate-spin mx-auto" /></div>
                ) : courses.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">No courses logged yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-cyber-darker border-b border-gray-700">
                          <th className="px-4 py-3 text-left text-gray-400 font-medium">Course Name</th>
                          <th className="px-4 py-3 text-center text-gray-400 font-medium">Hours</th>
                          <th className="px-4 py-3 text-center text-gray-400 font-medium">Completion</th>
                          <th className="px-4 py-3 text-center text-gray-400 font-medium">Points</th>
                          <th className="px-4 py-3 text-center text-gray-400 font-medium">Links</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courses.map((course, idx) => (
                          <motion.tr key={course.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="border-b border-gray-700/50 hover:bg-cyber-darker/30 transition-colors">
                            <td className="px-4 py-3 text-white font-medium">{course.name}</td>
                            <td className="px-4 py-3 text-center text-gray-300">{course.total_hours}h</td>
                            <td className="px-4 py-3 text-center text-gray-300">{course.completion_percent}%</td>
                             <td className="px-4 py-3 text-center"><span className="text-neon-blue font-bold">+{course.points}</span></td>
                             <td className="px-4 py-3 text-center">
                               <div className="flex items-center justify-center gap-2">
                                 {course.course_url && <a href={ensureProtocol(course.course_url)} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-cyber-darker rounded hover:text-white text-gray-400 transition-colors" title="Course Link"><GraduationCap className="w-4 h-4" /></a>}
                                 {course.notes_link && <a href={ensureProtocol(course.notes_link)} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-cyber-darker rounded hover:text-white text-gray-400 transition-colors" title="Notes Link"><PenTool className="w-4 h-4" /></a>}
                               </div>
                             </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'books' && (
              <div className="cyber-card overflow-hidden">
                {isLoading ? (
                  <div className="p-8 text-center"><div className="w-6 h-6 border-2 border-neon-blue border-t-transparent rounded-full animate-spin mx-auto" /></div>
                ) : books.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">No books read yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-cyber-darker border-b border-gray-700">
                          <th className="px-4 py-3 text-left text-gray-400 font-medium">Book Title</th>
                          <th className="px-4 py-3 text-center text-gray-400 font-medium">Pages</th>
                          <th className="px-4 py-3 text-center text-gray-400 font-medium">Progress</th>
                          <th className="px-4 py-3 text-center text-gray-400 font-medium">Points</th>
                          <th className="px-4 py-3 text-center text-gray-400 font-medium">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {books.map((book, idx) => (
                          <motion.tr key={book.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="border-b border-gray-700/50 hover:bg-cyber-darker/30 transition-colors">
                            <td className="px-4 py-3 text-white font-medium">{book.title}</td>
                            <td className="px-4 py-3 text-center text-gray-300">{book.pages_read} / {book.total_pages}</td>
                             <td className="px-4 py-3 text-center">
                               <div className="w-24 bg-gray-700 rounded-full h-2 mx-auto overflow-hidden">
                                 <div className="bg-neon-blue h-full" style={{ width: `${Math.min(100, (book.pages_read / book.total_pages) * 100)}%` }}></div>
                               </div>
                             </td>
                             <td className="px-4 py-3 text-center"><span className="text-neon-blue font-bold">+{book.points}</span></td>
                             <td className="px-4 py-3 text-center">
                               {book.notes_link ? (
                                 <a href={ensureProtocol(book.notes_link)} target="_blank" rel="noopener noreferrer" className="inline-flex p-1.5 bg-cyber-darker rounded hover:text-white text-gray-400 transition-colors" title="Notes Link"><PenTool className="w-4 h-4" /></a>
                               ) : <span className="text-gray-600">—</span>}
                             </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'blogs' && (
              <div className="cyber-card overflow-hidden">
                {isLoading ? (
                  <div className="p-8 text-center"><div className="w-6 h-6 border-2 border-neon-blue border-t-transparent rounded-full animate-spin mx-auto" /></div>
                ) : blogs.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">No blogs submitted yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-cyber-darker border-b border-gray-700">
                          <th className="px-4 py-3 text-left text-gray-400 font-medium">Blog Name</th>
                          <th className="px-4 py-3 text-center text-gray-400 font-medium">Type</th>
                          <th className="px-4 py-3 text-center text-gray-400 font-medium">Points</th>
                          <th className="px-4 py-3 text-center text-gray-400 font-medium">Link</th>
                        </tr>
                      </thead>
                      <tbody>
                        {blogs.map((blog, idx) => (
                          <motion.tr key={blog.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="border-b border-gray-700/50 hover:bg-cyber-darker/30 transition-colors">
                            <td className="px-4 py-3 text-white font-medium">{blog.name}</td>
                            <td className="px-4 py-3 text-center">
                              {blog.is_first ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gold/20 text-gold text-xs font-medium"><Award className="w-3 h-3" />First Blog</span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-neon-blue/20 text-neon-blue text-xs font-medium">Standard</span>
                              )}
                            </td>
                             <td className="px-4 py-3 text-center"><span className="text-neon-blue font-bold">+{blog.points}</span></td>
                             <td className="px-4 py-3 text-center">
                               {blog.url ? (
                                 <a href={ensureProtocol(blog.url)} target="_blank" rel="noopener noreferrer" className="inline-flex p-1.5 bg-cyber-darker rounded hover:text-white text-gray-400 transition-colors" title="Read Blog"><BookOpen className="w-4 h-4" /></a>
                               ) : <span className="text-gray-600">—</span>}
                             </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'ideas' && (
              <div>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : ideas.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Lightbulb className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No ideas submitted yet</p>
                    <button onClick={() => setIsAddIdeaOpen(true)} className="mt-4 text-gold hover:underline">Submit your first idea!</button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-cyber-darker text-left">
                          <th className="p-3 text-gray-400">Title</th>
                          <th className="p-3 text-gray-400">Type</th>
                          <th className="p-3 text-gray-400">Status</th>
                          <th className="p-3 text-gray-400">Points</th>
                          <th className="p-3 text-gray-400">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ideas.map((idea: any, idx: number) => (
                          <motion.tr key={idea.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }} className="border-b border-gray-700/50">
                            <td className="p-3">
                              <div className="text-white font-medium">{idea.title}</div>
                              {idea.description && <div className="text-gray-400 text-sm truncate max-w-xs">{idea.description}</div>}
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${idea.idea_type === 'tool' ? 'bg-neon-blue/20 text-neon-blue' : 'bg-gold/20 text-gold'}`}>
                                {idea.idea_type === 'tool' ? '🔧 Tool' : '💡 Idea'}
                              </span>
                            </td>
                            <td className="p-3">
                              {idea.verified ? (
                                <span className="px-2 py-1 rounded text-xs font-medium bg-success/20 text-success">✓ Approved</span>
                              ) : (
                                <span className="px-2 py-1 rounded text-xs font-medium bg-orange-500/20 text-orange-400">⏳ Pending</span>
                              )}
                            </td>
                            <td className="p-3">
                              <span className={`font-bold ${idea.points > 0 ? 'text-gold' : 'text-gray-500'}`}>
                                {idea.points > 0 ? `+${idea.points}` : '—'}
                              </span>
                            </td>
                            <td className="p-3 text-gray-400 text-sm">
                              {new Date(idea.created_at).toLocaleDateString()}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'penalties' && <div className="text-gray-400">Penalties records coming soon...</div>}
            {activeTab === 'rewards' && <div className="text-gray-400">Rewards records coming soon...</div>}
          </div>
        </motion.div>
      </div>

      <AddCourseModal isOpen={isAddCourseOpen} onClose={() => setIsAddCourseOpen(false)} onSuccess={fetchCourses} userId={playerData.id} />
      <AddBookModal isOpen={isAddBookOpen} onClose={() => setIsAddBookOpen(false)} onSuccess={fetchBooks} userId={playerData.id} />
      <AddBlogModal isOpen={isAddBlogOpen} onClose={() => setIsAddBlogOpen(false)} onSuccess={fetchBlogs} userId={playerData.id} />
      <AddIdeaModal isOpen={isAddIdeaOpen} onClose={() => setIsAddIdeaOpen(false)} onSuccess={fetchIdeas} />
    </div>
  );
}
