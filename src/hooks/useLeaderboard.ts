/**
 * useLeaderboard Hook
 * Fetches leaderboard data using direct fetch API
 */
import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/supabaseApi';
import type { LeaderboardEntry } from '../types';

interface UseLeaderboardReturn {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
  totalPlayers: number;
  refetch: () => Promise<void>;
}

// Mock data for demo mode
const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    player_id: '1',
    player_name: 'Hassan',
    avatar_url: undefined,
    attendance_points: 45,
    activity_points: 30,
    course_points: 40,
    blog_points: 20,
    book_points: 10,
    presentation_points: 0,
    idea_points: 0,
    top_performer_points: 0,
    penalty_points: 0,
    total_points: 145,
    rank: 1,
    is_last_place: false,
  },
  {
    player_id: '2',
    player_name: 'Hisa',
    avatar_url: undefined,
    attendance_points: 40,
    activity_points: 25,
    course_points: 35,
    blog_points: 15,
    book_points: 5,
    presentation_points: 0,
    idea_points: 0,
    top_performer_points: 0,
    penalty_points: 0,
    total_points: 120,
    rank: 2,
    is_last_place: false,
  },
  {
    player_id: '3',
    player_name: 'Haytham',
    avatar_url: undefined,
    attendance_points: 35,
    activity_points: 20,
    course_points: 25,
    blog_points: 10,
    book_points: 5,
    presentation_points: 0,
    idea_points: 0,
    top_performer_points: 0,
    penalty_points: 0,
    total_points: 95,
    rank: 3,
    is_last_place: false,
  },
  {
    player_id: '4',
    player_name: 'Nagar',
    avatar_url: undefined,
    attendance_points: 30,
    activity_points: 15,
    course_points: 20,
    blog_points: 10,
    book_points: 5,
    presentation_points: 0,
    idea_points: 0,
    top_performer_points: 0,
    penalty_points: 0,
    total_points: 80,
    rank: 4,
    is_last_place: false,
  },
  {
    player_id: '5',
    player_name: 'Hesham',
    avatar_url: undefined,
    attendance_points: 25,
    activity_points: 15,
    course_points: 15,
    blog_points: 5,
    book_points: 5,
    presentation_points: 0,
    idea_points: 0,
    top_performer_points: 0,
    penalty_points: 0,
    total_points: 65,
    rank: 5,
    is_last_place: false,
  },
  {
    player_id: '6',
    player_name: 'Ghallab',
    avatar_url: undefined,
    attendance_points: 20,
    activity_points: 15,
    course_points: 10,
    blog_points: 5,
    book_points: 5,
    presentation_points: 0,
    idea_points: 0,
    top_performer_points: 0,
    penalty_points: 0,
    total_points: 55,
    rank: 6,
    is_last_place: false,
  },
  {
    player_id: '7',
    player_name: 'Fahim',
    avatar_url: undefined,
    attendance_points: 15,
    activity_points: 10,
    course_points: 10,
    blog_points: 5,
    book_points: 5,
    presentation_points: 0,
    idea_points: 0,
    top_performer_points: 0,
    penalty_points: 0,
    total_points: 45,
    rank: 7,
    is_last_place: false,
  },
  {
    player_id: '8',
    player_name: 'Askora',
    avatar_url: undefined,
    attendance_points: 10,
    activity_points: 5,
    course_points: 5,
    blog_points: 5,
    book_points: 5,
    presentation_points: 0,
    idea_points: 0,
    top_performer_points: 0,
    penalty_points: 0,
    total_points: 30,
    rank: 8,
    is_last_place: true,
  },
];

export function useLeaderboard(): UseLeaderboardReturn {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (!db.isConfigured()) {
      setEntries(MOCK_LEADERBOARD);
      setIsLoading(false);
      return;
    }

    const { data, error: fetchError } = await db.select<LeaderboardEntry[]>('leaderboard', {
      order: 'total_points.desc',
    });

    if (fetchError) {
      setError(fetchError.message);
      setEntries(MOCK_LEADERBOARD);
    } else {
      const processedEntries = (data || []).map((entry, index, arr) => ({
        ...entry,
        rank: index + 1,
        is_last_place: index === arr.length - 1 && arr.length > 1,
      }));
      setEntries(processedEntries);
    }

    setIsLoading(false);
  }, []);

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
