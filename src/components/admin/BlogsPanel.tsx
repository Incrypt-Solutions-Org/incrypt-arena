/**
 * BlogsPanel Component
 * View and manage all blog posts
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PenTool, Edit, ExternalLink } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface BlogRecord {
  id: string;
  player_id: string;
  name: string;
  url: string;
  is_first: boolean;
  points: number;
  created_at: string;
  player_name: string;
}

interface BlogsPanelProps {
  onOpenEditModal: (blog: BlogRecord) => void;
}

export function BlogsPanel({ onOpenEditModal }: BlogsPanelProps) {
  const [blogs, setBlogs] = useState<BlogRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadBlogs = async () => {
    setIsLoading(true);
    
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('blogs')
          .select(`
            *,
            players:player_id (name)
          `)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const formatted = data.map((b: any) => ({
            ...b,
            player_name: b.players?.name || 'Unknown',
          }));
          setBlogs(formatted);
        }
      } catch (err) {
        console.error('Failed to load blogs:', err);
      }
    } else {
      setBlogs([]);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
            <PenTool className="w-5 h-5 text-neon-blue" />
            Blogs Management
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            View and manage all blog posts
          </p>
        </div>
      </div>

      <div className="cyber-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-neon-blue border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : blogs.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No blogs posted yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-cyber-darker border-b border-gray-700">
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Blog Name</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">URL</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Author</th>
                  <th className="px-4 py-3 text-center text-gray-400 font-medium">First Blog</th>
                  <th className="px-4 py-3 text-center text-gray-400 font-medium">Points</th>
                  <th className="px-4 py-3 text-center text-gray-400 font-medium">Date</th>
                  <th className="px-4 py-3 text-center text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog, idx) => (
                  <motion.tr
                    key={blog.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-gray-700/50 hover:bg-cyber-darker/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-white font-medium">{blog.name}</td>
                    <td className="px-4 py-3">
                      <a
                        href={blog.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neon-blue hover:text-neon-blue/80 flex items-center gap-1 w-fit"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span className="truncate max-w-[200px]">{blog.url}</span>
                      </a>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{blog.player_name}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        blog.is_first
                          ? 'bg-gold/20 text-gold'
                          : 'bg-gray-700 text-gray-400'
                      }`}>
                        {blog.is_first ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-success font-medium">+{blog.points}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-300 text-sm">
                      {new Date(blog.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => onOpenEditModal(blog)}
                          className="p-2 text-neon-blue hover:bg-neon-blue/20 rounded-lg transition-colors"
                          title="Edit blog"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="text-sm text-gray-400 text-center">
        {blogs.length} blog{blogs.length !== 1 ? 's' : ''} posted
      </div>
    </div>
  );
}
