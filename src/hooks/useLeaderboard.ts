/**
 * useLeaderboard Hook
 * Fetches and subscribes to real-time leaderboard data from Supabase
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { LeaderboardEntry } from '../types';

interface UseLeaderboardReturn {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
  totalPlayers: number;
  refetch: () => Promise<void>;
}

/**
 * Mock data for development when Supabase is not configured
 */
const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    player_id: '1',
    player_name: 'Hassan',
    total_points: 145,
    rank: 1,
    attendance_points: 50,
    activity_points: 40,
    course_points: 30,
    blog_points: 20,
    book_points: 0,
    top_performer_points: 0,
    presentation_points: 10,
    idea_points: 5,
    penalty_points: -10,
    is_last_place: false,
  },
  {
    player_id: '2',
    player_name: 'Hisa',
    total_points: 120,
    rank: 2,
    attendance_points: 40,
    activity_points: 35,
    course_points: 25,
    blog_points: 15,
    book_points: 0,
    top_performer_points: 0,
    presentation_points: 10,
    idea_points: 0,
    penalty_points: -5,
    is_last_place: false,
  },
  {
    player_id: '3',
    player_name: 'Haytham',
    total_points: 95,
    rank: 3,
    attendance_points: 35,
    activity_points: 30,
    course_points: 20,
    blog_points: 10,
    book_points: 0,
    top_performer_points: 0,
    presentation_points: 5,
    idea_points: 0,
    penalty_points: -5,
    is_last_place: false,
  },
  {
    player_id: '4',
    player_name: 'Nagar',
    total_points: 80,
    rank: 4,
    attendance_points: 30,
    activity_points: 25,
    course_points: 15,
    blog_points: 10,
    book_points: 0,
    top_performer_points: 0,
    presentation_points: 5,
    idea_points: 0,
    penalty_points: -5,
    is_last_place: false,
  },
  {
    player_id: '5',
    player_name: 'Hesham',
    total_points: 65,
    rank: 5,
    attendance_points: 25,
    activity_points: 20,
    course_points: 15,
    blog_points: 5,
    book_points: 0,
    top_performer_points: 0,
    presentation_points: 5,
    idea_points: 0,
    penalty_points: -5,
    is_last_place: false,
  },
  {
    player_id: '6',
    player_name: 'Ghallab',
    total_points: 55,
    rank: 6,
    attendance_points: 20,
    activity_points: 20,
    course_points: 10,
    blog_points: 5,
    book_points: 0,
    top_performer_points: 0,
    presentation_points: 5,
    idea_points: 0,
    penalty_points: -5,
    is_last_place: false,
  },
  {
    player_id: '7',
    player_name: 'Fahim',
    total_points: 40,
    rank: 7,
    attendance_points: 15,
    activity_points: 15,
    course_points: 10,
    blog_points: 0,
    book_points: 0,
    top_performer_points: 0,
    presentation_points: 5,
    idea_points: 0,
    penalty_points: -5,
    is_last_place: false,
  },
  {
    player_id: '8',
    player_name: 'Askora',
    total_points: 25,
    rank: 8,
    attendance_points: 10,
    activity_points: 10,
    course_points: 5,
    blog_points: 0,
    book_points: 0,
    top_performer_points: 0,
    presentation_points: 5,
    idea_points: 0,
    penalty_points: -5,
    is_last_place: true,
  },
];

export function useLeaderboard(): UseLeaderboardReturn {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch leaderboard data from Supabase or use mock data
   */
  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Use mock data if Supabase is not configured
    if (!isSupabaseConfigured()) {
      setEntries(MOCK_LEADERBOARD);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('leaderboard')
        .select('*')
        .order('total_points', { ascending: false });

      if (fetchError) throw fetchError;

      // Process data to mark last place
      const processedEntries: LeaderboardEntry[] = (data || []).map((entry, index, arr) => ({
        ...entry,
        rank: index + 1,
        is_last_place: index === arr.length - 1 && arr.length > 1,
      }));

      setEntries(processedEntries);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard');
      // Fall back to mock data on error
      setEntries(MOCK_LEADERBOARD);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);



  return {
    entries,
    isLoading,
    error,
    totalPlayers: entries.length,
    refetch: fetchLeaderboard,
  };
}
