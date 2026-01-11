/**
 * Team Achievements Page
 * Shared view of all team members' achievements
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, PenTool, Presentation as PresentationIcon } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ClickableUrl } from '../components/ClickableUrl';

const TEAM_TABS = [
  { id: 'courses', label: 'Courses', icon: GraduationCap },
  { id: 'blogs', label: 'Blogs', icon: PenTool },
  { id: 'books', label: 'Books', icon: BookOpen },
  { id: 'presentations', label: 'Presentations', icon: PresentationIcon },
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
}

interface BlogRecord {
  id: string;
  name: string;
  url: string;
  player_name: string;
}

interface BookRecord {
  id: string;
  title: string;
  player_name: string;
  pages_read: number;
  notes_link: string | null;
  book_url: string | null;
}

interface PresentationRecord {
  id: string;
  topic: string;
  presenters: string;
  slides_url: string | null;
  eval_link: string | null;
  youtube_url: string | null;
}

export default function TeamAchievements() {
  const [activeTab, setActiveTab] = useState<TeamTabId>('courses');
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [blogs, setBlogs] = useState<BlogRecord[]>([]);
  const [books, setBooks] = useState<BookRecord[]>([]);
  const [presentations, setPresentations] = useState<PresentationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    if (!isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }

    try {
      if (activeTab === 'courses') {
        const { data } = await supabase.from('courses').select('*, players:player_id (name)').eq('verified', true);
        setCourses(data?.map((c: any) => ({ ...c, player_name: c.players?.name || 'Unknown' })) || []);
      } else if (activeTab === 'blogs') {
        const { data } = await supabase.from('blogs').select('*, players:player_id (name)');
        setBlogs(data?.map((b: any) => ({ ...b, player_name: b.players?.name || 'Unknown' })) || []);
      } else if (activeTab === 'books') {
        const { data } = await supabase.from('books').select('*, players:player_id (name)').eq('verified', true);
        setBooks(data?.map((b: any) => ({ ...b, player_name: b.players?.name || 'Unknown' })) || []);
      } else if (activeTab === 'presentations') {
        const { data } = await supabase.from('presentations').select('*, players:player_id (name), second_presenter:second_presenter_id (name)');
        setPresentations(data?.map((p: any) => ({
          ...p,
          presenters: p.second_presenter ? `${p.players?.name} & ${p.second_presenter.name}` : p.players?.name
        })) || []);
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
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
