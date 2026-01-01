/**
 * useLeaderboard Hook Tests
 * Tests for the leaderboard data fetching hook
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useLeaderboard } from './useLeaderboard';

// Mock Supabase client
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({
          data: [
            { player_id: '1', player_name: 'Hassan', total_points: 100, rank: 1 },
            { player_id: '2', player_name: 'Hisa', total_points: 80, rank: 2 },
            { player_id: '3', player_name: 'Askora', total_points: 60, rank: 3 },
          ],
          error: null,
        })),
      })),
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    })),
    removeChannel: vi.fn(),
  },
  isSupabaseConfigured: vi.fn(() => true),
}));

describe('useLeaderboard Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns loading state initially', () => {
    const { result } = renderHook(() => useLeaderboard());
    
    expect(result.current.isLoading).toBe(true);
  });

  it('returns leaderboard entries after loading', async () => {
    const { result } = renderHook(() => useLeaderboard());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.entries).toHaveLength(3);
    expect(result.current.entries[0].player_name).toBe('Hassan');
  });

  it('marks the last player as isLastPlace', async () => {
    const { result } = renderHook(() => useLeaderboard());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Last entry should have is_last_place = true
    const lastEntry = result.current.entries[result.current.entries.length - 1];
    expect(lastEntry.is_last_place).toBe(true);
  });

  it('provides total players count', async () => {
    const { result } = renderHook(() => useLeaderboard());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.totalPlayers).toBe(3);
  });
});
