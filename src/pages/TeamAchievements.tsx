/**
 * Team Achievements Page
 * Shared view of all team members' achievements
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, PenTool, Presentation as PresentationIcon, Trophy, Calendar, Lightbulb } from 'lucide-react';
import { db } from '../lib/supabaseApi';
import { ClickableUrl } from '../components/ClickableUrl';

const TEAM_TABS = [
  { id: 'activities', label: 'Activities', icon: Trophy },
  { id: 'attendance', label: 'Attendance', icon: Calendar },
  { id: 'courses', label: 'Courses', icon: GraduationCap },
  { id: 'blogs', label: 'Blogs', icon: PenTool },
  { id: 'books', label: 'Books', icon: BookOpen },
  { id: 'presentations', label: 'Presentations', icon: PresentationIcon },
  { id: 'ideas', label: 'Ideas', icon: Lightbulb },
] as const;

type TeamTabId = typeof TEAM_TABS[number]['id'];

interface CourseRecord {
  id: string;
  name: string;
  player_name: string;
  course_url: string | null;
  notes_link: string | null;
  total_hours: number;
  completion_percent: number;
  players?: { name: string };
}

interface BlogRecord {
  id: string;
  name: string;
  url: string;
  player_name: string;
  players?: { name: string };
}

interface BookRecord {
  id: string;
  title: string;
  player_name: string;
  pages_read: number;
  notes_link: string | null;
  book_url: string | null;
  players?: { name: string };
}

interface PresentationRecord {
  id: string;
  topic: string;
  presenters: string;
  slides_url: string | null;
  eval_link: string | null;
  youtube_url: string | null;
  players?: { name: string };
  second_presenter?: { name: string };
}

interface ActivityRecord {
  id: string;
  name: string;
  date: string;
  activity_type: string;
  participations: { player_name: string; points: number; is_top_performer: boolean }[];
}

interface AttendanceRecord {
  id: string;
  player_name: string;
  check_in_date: string;
  points: number;
  is_early_bird: boolean;
  players?: { name: string };
}

interface IdeaRecord {
  id: string;
  title: string;
  description: string | null;
  idea_type: string | null;
  player_name: string;
  points: number;
  verified: boolean;
  players?: { name: string };
}

export default function TeamAchievements() {
  const [activeTab, setActiveTab] = useState<TeamTabId>('activities');
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [blogs, setBlogs] = useState<BlogRecord[]>([]);
  const [books, setBooks] = useState<BookRecord[]>([]);
  const [presentations, setPresentations] = useState<PresentationRecord[]>([]);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [ideas, setIdeas] = useState<IdeaRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    if (!db.isConfigured()) {
      setIsLoading(false);
      return;
    }

    try {
      if (activeTab === 'activities') {
        // Get activities with participations
        const { data: activitiesData } = await db.select<any[]>('activities', {
          columns: '*',
          order: 'date.desc',
        });
        if (activitiesData) {
          // Get participations for each activity
          const activitiesWithParticipations = await Promise.all(
            activitiesData.map(async (a) => {
              const { data: partData } = await db.select<any[]>('activity_participations', {
                columns: '*,players:player_id(name)',
                filters: { 'activity_id': `eq.${a.id}` },
              });
              return {
                ...a,
                participations: (partData || []).map(p => ({
                  player_name: p.players?.name || 'Unknown',
                  points: p.points,
                  is_top_performer: p.is_top_performer,
                })),
              };
            })
          );
          setActivities(activitiesWithParticipations);
        }
      } else if (activeTab === 'attendance') {
        const { data } = await db.select<AttendanceRecord[]>('attendance', {
          columns: '*,players:player_id(name)',
          order: 'check_in_date.desc',
        });
        setAttendance(data?.map((a) => ({ ...a, player_name: a.players?.name || 'Unknown' })) || []);
      } else if (activeTab === 'courses') {
        const { data } = await db.select<CourseRecord[]>('courses', {
          columns: '*,players:player_id(name)',
        });
        setCourses(data?.map((c) => ({ ...c, player_name: c.players?.name || 'Unknown' })) || []);
      } else if (activeTab === 'blogs') {
        const { data } = await db.select<BlogRecord[]>('blogs', {
          columns: '*,players:player_id(name)',
        });
        setBlogs(data?.map((b) => ({ ...b, player_name: b.players?.name || 'Unknown' })) || []);
      } else if (activeTab === 'books') {
        const { data } = await db.select<BookRecord[]>('books', {
          columns: '*,players:player_id(name)',
          filters: { 'verified': 'eq.true' },
        });
        setBooks(data?.map((b) => ({ ...b, player_name: b.players?.name || 'Unknown' })) || []);
      } else if (activeTab === 'presentations') {
        const { data } = await db.select<PresentationRecord[]>('presentations', {
          columns: '*,players:player_id(name),second_presenter:second_presenter_id(name)',
        });
        setPresentations(data?.map((p) => ({
          ...p,
          presenters: p.second_presenter ? `${p.players?.name} & ${p.second_presenter.name}` : p.players?.name || 'Unknown'
        })) || []);
      } else if (activeTab === 'ideas') {
        const { data } = await db.select<IdeaRecord[]>('ideas', {
          columns: '*,players:player_id(name)',
          filters: { 'verified': 'eq.true' },
          order: 'created_at.desc',
        });
        setIdeas(data?.map((i) => ({ ...i, player_name: i.players?.name || 'Unknown' })) || []);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyber-dark via-cyber-darker to-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="cyber-card p-6">
          <h1 className="font-display text-3xl font-bold text-white mb-2">Team Achievements</h1>
          <p className="text-gray-400">Explore what the team has accomplished</p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="cyber-card p-6">
          <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-700 pb-4">
            {TEAM_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === tab.id ? 'bg-neon-blue text-cyber-dark font-bold' : 'bg-cyber-darker text-gray-400 hover:text-white hover:bg-gray-700'}`}>
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {isLoading ? (
            <div className="p-8 text-center"><div className="w-6 h-6 border-2 border-neon-blue border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : (
            <div className="overflow-x-auto">
              {/* Activities Tab */}
              {activeTab === 'activities' && (
                <div className="space-y-4">
                  {activities.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">No activities recorded yet.</div>
                  ) : (
                    activities.map(a => (
                      <div key={a.id} className="p-4 bg-cyber-darker rounded-lg border border-gray-700">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-white font-bold">{a.name}</h3>
                            <p className="text-sm text-gray-400">{new Date(a.date).toLocaleDateString()}</p>
                          </div>
                          <span className="px-2 py-1 bg-neon-blue/20 text-neon-blue text-xs rounded">{a.activity_type}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {a.participations.map((p, i) => (
                            <div key={i} className={`px-3 py-1 rounded text-sm ${p.is_top_performer ? 'bg-gold/20 text-gold border border-gold/50' : 'bg-gray-700 text-gray-300'}`}>
                              {p.player_name} <span className="font-bold">+{p.points}</span>
                              {p.is_top_performer && ' ⭐'}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Attendance Tab */}
              {activeTab === 'attendance' && (
                <table className="w-full">
                  <thead>
                    <tr className="bg-cyber-darker border-b border-gray-700">
                      <th className="px-4 py-3 text-left text-gray-400 font-medium">Team Member</th>
                      <th className="px-4 py-3 text-left text-gray-400 font-medium">Check-in Date</th>
                      <th className="px-4 py-3 text-center text-gray-400 font-medium">Early Bird</th>
                      <th className="px-4 py-3 text-center text-gray-400 font-medium">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map(a => (
                      <tr key={a.id} className="border-b border-gray-700/50">
                        <td className="px-4 py-3 text-white">{a.player_name}</td>
                        <td className="px-4 py-3 text-gray-300">{new Date(a.check_in_date).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-center">
                          {a.is_early_bird ? <span className="text-gold">🌅 Yes</span> : <span className="text-gray-500">No</span>}
                        </td>
                        <td className="px-4 py-3 text-center text-success font-bold">+{a.points + (a.is_early_bird ? 1 : 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Courses Tab */}
              {activeTab === 'courses' && (
                <table className="w-full">
                  <thead>
                    <tr className="bg-cyber-darker border-b border-gray-700">
                      <th className="px-4 py-3 text-left text-gray-400 font-medium">Course Name</th>
                      <th className="px-4 py-3 text-left text-gray-400 font-medium">Team Member</th>
                      <th className="px-4 py-3 text-left text-gray-400 font-medium">Course URL</th>
                      <th className="px-4 py-3 text-left text-gray-400 font-medium">Notes URL</th>
                      <th className="px-4 py-3 text-center text-gray-400 font-medium">Hours</th>
                      <th className="px-4 py-3 text-center text-gray-400 font-medium">Completion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map(c => (
                      <tr key={c.id} className="border-b border-gray-700/50">
                        <td className="px-4 py-3 text-white">{c.name}</td>
                        <td className="px-4 py-3 text-gray-300">{c.player_name}</td>
                        <td className="px-4 py-3"><ClickableUrl url={c.course_url} label="View" /></td>
                        <td className="px-4 py-3"><ClickableUrl url={c.notes_link} label="Notes" /></td>
                        <td className="px-4 py-3 text-center text-gray-300">{c.total_hours}h</td>
                        <td className="px-4 py-3 text-center text-gray-300">{c.completion_percent}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Blogs Tab */}
              {activeTab === 'blogs' && (
                <table className="w-full">
                  <thead>
                    <tr className="bg-cyber-darker border-b border-gray-700">
                      <th className="px-4 py-3 text-left text-gray-400 font-medium">Blog Name</th>
                      <th className="px-4 py-3 text-left text-gray-400 font-medium">Team Member</th>
                      <th className="px-4 py-3 text-left text-gray-400 font-medium">Blog URL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blogs.map(b => (
                      <tr key={b.id} className="border-b border-gray-700/50">
                        <td className="px-4 py-3 text-white">{b.name}</td>
                        <td className="px-4 py-3 text-gray-300">{b.player_name}</td>
                        <td className="px-4 py-3"><ClickableUrl url={b.url} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Books Tab */}
              {activeTab === 'books' && (
                <table className="w-full">
                  <thead>
                    <tr className="bg-cyber-darker border-b border-gray-700">
                      <th className="px-4 py-3 text-left text-gray-400 font-medium">Book Name</th>
                      <th className="px-4 py-3 text-left text-gray-400 font-medium">Team Member</th>
                      <th className="px-4 py-3 text-center text-gray-400 font-medium">Pages</th>
                      <th className="px-4 py-3 text-left text-gray-400 font-medium">Notes URL</th>
                      <th className="px-4 py-3 text-left text-gray-400 font-medium">Book URL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.map(b => (
                      <tr key={b.id} className="border-b border-gray-700/50">
                        <td className="px-4 py-3 text-white">{b.title}</td>
                        <td className="px-4 py-3 text-gray-300">{b.player_name}</td>
                        <td className="px-4 py-3 text-center text-gray-300">{b.pages_read}</td>
                        <td className="px-4 py-3"><ClickableUrl url={b.notes_link} label="Notes" /></td>
                        <td className="px-4 py-3"><ClickableUrl url={b.book_url} label="View" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Presentations Tab */}
              {activeTab === 'presentations' && (
                <table className="w-full">
                  <thead>
                    <tr className="bg-cyber-darker border-b border-gray-700">
                      <th className="px-4 py-3 text-left text-gray-400 font-medium">Presentation</th>
                      <th className="px-4 py-3 text-left text-gray-400 font-medium">Presenter(s)</th>
                      <th className="px-4 py-3 text-left text-gray-400 font-medium">Slides</th>
                      <th className="px-4 py-3 text-left text-gray-400 font-medium">Evaluation</th>
                      <th className="px-4 py-3 text-left text-gray-400 font-medium">Recording</th>
                    </tr>
                  </thead>
                  <tbody>
                    {presentations.map(p => (
                      <tr key={p.id} className="border-b border-gray-700/50">
                        <td className="px-4 py-3 text-white">{p.topic}</td>
                        <td className="px-4 py-3 text-gray-300">{p.presenters}</td>
                        <td className="px-4 py-3"><ClickableUrl url={p.slides_url} label="View" /></td>
                        <td className="px-4 py-3"><ClickableUrl url={p.eval_link} label="Eval" /></td>
                        <td className="px-4 py-3"><ClickableUrl url={p.youtube_url} label="Watch" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Ideas Tab */}
              {activeTab === 'ideas' && (
                <table className="w-full">
                  <thead>
                    <tr className="bg-cyber-darker border-b border-gray-700">
                      <th className="px-4 py-3 text-left text-gray-400 font-medium">Title</th>
                      <th className="px-4 py-3 text-left text-gray-400 font-medium">Type</th>
                      <th className="px-4 py-3 text-left text-gray-400 font-medium">Team Member</th>
                      <th className="px-4 py-3 text-left text-gray-400 font-medium">Description</th>
                      <th className="px-4 py-3 text-center text-gray-400 font-medium">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ideas.length === 0 ? (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No approved ideas yet.</td></tr>
                    ) : (
                      ideas.map(i => (
                        <tr key={i.id} className="border-b border-gray-700/50">
                          <td className="px-4 py-3 text-white font-medium">{i.title}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${i.idea_type === 'tool' ? 'bg-neon-blue/20 text-neon-blue' : 'bg-gold/20 text-gold'}`}>
                              {i.idea_type === 'tool' ? '🔧 Tool' : '💡 Idea'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-300">{i.player_name}</td>
                          <td className="px-4 py-3 text-gray-400 text-sm max-w-xs truncate">{i.description || '—'}</td>
                          <td className="px-4 py-3 text-center text-success font-bold">+{i.points}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
