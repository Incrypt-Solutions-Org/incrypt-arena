/**
 * useAuth Hook - Role-Based Authentication
 * Manages authentication state with Supabase Auth
 * Fetches user role from players table
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface PlayerData {
  id: string;
  name: string;
  email: string;
  is_admin: boolean;
}

interface UseAuthReturn {
  user: User | null;
  playerData: PlayerData | null;
  isLoading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch player data from database
  const fetchPlayerData = useCallback(async (authUser: User) => {
    if (!isSupabaseConfigured()) return;

    try {
      const { data, error: dbError } = await supabase
        .from('players')
        .select('id, name, email, is_admin')
        .eq('auth_id', authUser.id)
        .single();

      if (dbError) {
        console.error('Player data fetch error:', dbError);
        // If no player record found, sign out orphaned auth session
        if (dbError.code === 'PGRST116') {
          console.warn('No player record found for auth user, signing out...');
          await supabase.auth.signOut();
          setUser(null);
          setPlayerData(null);
        }
        throw dbError;
      }
      if (data) setPlayerData(data);
    } catch (err) {
      console.error('Failed to fetch player data:', err);
      setPlayerData(null);
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }

    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchPlayerData(session.user);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setIsLoading(true);
        if (session?.user) {
          setUser(session.user);
          await fetchPlayerData(session.user);
        } else {
          setUser(null);
          setPlayerData(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchPlayerData]);

  /**
   * Sign in with email and password
   */
  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    setError(null);
    setIsLoading(true);

    if (!isSupabaseConfigured()) {
      setError('Supabase not configured');
      setIsLoading(false);
      return false;
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.user) {
        setUser(data.user);
        await fetchPlayerData(data.user);
      }

      setIsLoading(false);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
      setIsLoading(false);
      return false;
    }
  }, [fetchPlayerData]);

  /**
   * Sign up new user
   */
  const signUp = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    setError(null);
    setIsLoading(true);

    if (!isSupabaseConfigured()) {
      setError('Supabase not configured');
      setIsLoading(false);
      return false;
    }

    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      // 2. Create player record
      const { error: playerError } = await supabase.from('players').insert({
        auth_id: authData.user.id,
        name,
        email,
        is_admin: false,
      });

      if (playerError) throw playerError;

      // 3. Fetch the created player data
      await fetchPlayerData(authData.user);
      setUser(authData.user);

      setIsLoading(false);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
      setIsLoading(false);
      return false;
    }
  }, [fetchPlayerData]);

  /**
   * Sign out current user
   */
  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured()) return;

    try {
      await supabase.auth.signOut();
      setUser(null);
      setPlayerData(null);
      setError(null);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  }, []);

  return {
    user,
    playerData,
    isLoading,
    isAdmin: playerData?.is_admin || false,
    isAuthenticated: !!user && !!playerData,
    error,
    signIn,
    signOut,
    signUp,
  };
}
