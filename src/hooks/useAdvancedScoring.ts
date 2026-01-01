/**
 * useAdvancedScoring Hook
 * Handles special scoring calculations for streaks, champions, and double points
 */
import { useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface StreakInfo {
  playerId: string;
  playerName: string;
  consecutiveWeeks: number;
  bonusPoints: number;
}

interface ChampionInfo {
  playerId: string;
  playerName: string;
  attendanceCount: number;
  bonusPoints: number;
}

interface UseAdvancedScoringReturn {
  // Askora's Special Streak (2 consecutive Wednesdays = +1 bonus)
  calculateStreaks: () => Promise<StreakInfo[]>;
  
  // Attendance Champion (highest attendance at end of cycle = +10)
  calculateAttendanceChampion: () => Promise<ChampionInfo | null>;
  
  // Double Points Mode (one-time 2x multiplier for activities)
  applyDoublePoints: (activityParticipationId: string) => Promise<boolean>;
  
  isLoading: boolean;
  error: string | null;
}

export function useAdvancedScoring(): UseAdvancedScoringReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Calculate Askora's Special Streak
   * Players get +1 bonus for every 2 consecutive Wednesday check-ins
   */
  const calculateStreaks = useCallback(async (): Promise<StreakInfo[]> => {
    if (!isSupabaseConfigured()) {
      // Return mock data for development
      return [
        { playerId: '1', playerName: 'Hassan', consecutiveWeeks: 4, bonusPoints: 2 },
        { playerId: '2', playerName: 'Hisa', consecutiveWeeks: 2, bonusPoints: 1 },
      ];
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get active cycle
      const { data: cycle } = await supabase
        .from('cycles')
        .select('id')
        .eq('is_active', true)
        .single();

      if (!cycle) throw new Error('No active cycle');

      // Get all attendance records ordered by date for each player
      const { data: attendance, error: attendanceError } = await supabase
        .from('attendance')
        .select(`
          player_id,
          check_in_date,
          players!inner(name)
        `)
        .eq('cycle_id', cycle.id)
        .order('check_in_date', { ascending: true });

      if (attendanceError) throw attendanceError;

      // Group by player and calculate consecutive weeks
      const playerStreaks: Map<string, { name: string; dates: string[] }> = new Map();
      
      attendance?.forEach((record) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const playerData = record.players as any;
        const playerName = playerData?.name || 'Unknown';
        const existing = playerStreaks.get(record.player_id);
        if (existing) {
          existing.dates.push(record.check_in_date);
        } else {
          playerStreaks.set(record.player_id, { 
            name: playerName, 
            dates: [record.check_in_date] 
          });
        }
      });

      const streakInfos: StreakInfo[] = [];

      playerStreaks.forEach((info, playerId) => {
        // Sort dates and check for consecutive Wednesdays (7 days apart)
        const sortedDates = info.dates.sort();
        let maxConsecutive = 1;
        let currentStreak = 1;

        for (let i = 1; i < sortedDates.length; i++) {
          const prevDate = new Date(sortedDates[i - 1]);
          const currDate = new Date(sortedDates[i]);
          const daysDiff = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

          if (daysDiff === 7) {
            currentStreak++;
            maxConsecutive = Math.max(maxConsecutive, currentStreak);
          } else {
            currentStreak = 1;
          }
        }

        // +1 bonus for every 2 consecutive weeks
        const bonusPoints = Math.floor(maxConsecutive / 2);

        if (bonusPoints > 0) {
          streakInfos.push({
            playerId,
            playerName: info.name,
            consecutiveWeeks: maxConsecutive,
            bonusPoints,
          });
        }
      });

      setIsLoading(false);
      return streakInfos;
    } catch (err) {
      console.error('Failed to calculate streaks:', err);
      setError(err instanceof Error ? err.message : 'Failed to calculate streaks');
      setIsLoading(false);
      return [];
    }
  }, []);

  /**
   * Calculate Attendance Champion
   * Player with highest attendance at end of cycle gets +10 bonus
   */
  const calculateAttendanceChampion = useCallback(async (): Promise<ChampionInfo | null> => {
    if (!isSupabaseConfigured()) {
      return {
        playerId: '1',
        playerName: 'Hassan',
        attendanceCount: 24,
        bonusPoints: 10,
      };
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get active cycle
      const { data: cycle } = await supabase
        .from('cycles')
        .select('id')
        .eq('is_active', true)
        .single();

      if (!cycle) throw new Error('No active cycle');

      // Count attendance per player
      const { data: counts, error: countError } = await supabase
        .from('attendance')
        .select(`
          player_id,
          players!inner(name)
        `)
        .eq('cycle_id', cycle.id);

      if (countError) throw countError;

      // Group and count
      const playerCounts: Map<string, { name: string; count: number }> = new Map();
      
      counts?.forEach((record) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const playerData = record.players as any;
        const playerName = playerData?.name || 'Unknown';
        const existing = playerCounts.get(record.player_id) || { 
          name: playerName, 
          count: 0 
        };
        existing.count++;
        playerCounts.set(record.player_id, existing);
      });

      // Find the champion
      let champion: ChampionInfo | null = null;
      let maxCount = 0;

      playerCounts.forEach((info, playerId) => {
        if (info.count > maxCount) {
          maxCount = info.count;
          champion = {
            playerId,
            playerName: info.name,
            attendanceCount: info.count,
            bonusPoints: 10, // POINTS.ATTENDANCE_CHAMPION
          };
        }
      });

      setIsLoading(false);
      return champion;
    } catch (err) {
      console.error('Failed to calculate attendance champion:', err);
      setError(err instanceof Error ? err.message : 'Failed to calculate');
      setIsLoading(false);
      return null;
    }
  }, []);

  /**
   * Apply Double Points to an activity participation
   * One-time 2x multiplier per player per cycle
   */
  const applyDoublePoints = useCallback(async (activityParticipationId: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      console.log('Demo: Double points applied to', activityParticipationId);
      return true;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get the participation record
      const { data: participation, error: fetchError } = await supabase
        .from('activity_participations')
        .select('player_id, points, double_points_used')
        .eq('id', activityParticipationId)
        .single();

      if (fetchError) throw fetchError;
      if (!participation) throw new Error('Participation not found');

      if (participation.double_points_used) {
        setError('Double points already used for this activity');
        setIsLoading(false);
        return false;
      }

      // Check if player has used double points this cycle
      const { data: cycle } = await supabase
        .from('cycles')
        .select('id')
        .eq('is_active', true)
        .single();

      if (!cycle) throw new Error('No active cycle');

      const { data: existing } = await supabase
        .from('activity_participations')
        .select('id')
        .eq('player_id', participation.player_id)
        .eq('double_points_used', true)
        .limit(1);

      if (existing && existing.length > 0) {
        setError('Double points already used this cycle');
        setIsLoading(false);
        return false;
      }

      // Apply double points
      const { error: updateError } = await supabase
        .from('activity_participations')
        .update({
          points: participation.points * 2,
          double_points_used: true,
        })
        .eq('id', activityParticipationId);

      if (updateError) throw updateError;

      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Failed to apply double points:', err);
      setError(err instanceof Error ? err.message : 'Failed to apply');
      setIsLoading(false);
      return false;
    }
  }, []);

  return {
    calculateStreaks,
    calculateAttendanceChampion,
    applyDoublePoints,
    isLoading,
    error,
  };
}
