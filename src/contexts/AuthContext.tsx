/**
 * AuthContext - Shared Authentication State
 * Provides auth state to all components via React Context
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { db } from '../lib/supabaseApi';
import type { User, Session } from '@supabase/supabase-js';

interface PlayerData {
  id: string;
  name: string;
  email: string;
  is_admin: boolean;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  playerData: PlayerData | null;
  isLoading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  signUp: (name: string, email: string, password: string, isAdmin?: boolean) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Helper to wrap promises with timeout
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Auth timeout')), timeoutMs)
    ),
  ]);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch player data from database
  const fetchPlayerData = useCallback(async (authUser: User) => {
    if (!db.isConfigured()) return;

    try {
      const { data, error: dbError } = await db.select<PlayerData[]>('players', {
        columns: 'id,name,email,is_admin',
        filters: { 'auth_id': `eq.${authUser.id}` },
        limit: 1,
      });

      if (dbError) {
        console.error('Player data fetch error:', dbError);
        return;
      }

      if (data && data.length > 0) {
        setPlayerData(data[0]);
      } else {
        console.warn('No player record found for auth user');
        setPlayerData(null);
      }
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

    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await withTimeout(
          supabase.auth.getSession(),
          5000
        );
        
        if (!mounted) return;
        
        if (session?.user) {
          setSession(session);
          setUser(session.user);
          await fetchPlayerData(session.user);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;
        
        setIsLoading(true);
        if (session?.user) {
          setSession(session);
          setUser(session.user);
          await fetchPlayerData(session.user);
        } else {
          setSession(null);
          setUser(null);
          setPlayerData(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchPlayerData]);

  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    setError(null);
    setIsLoading(true);

    if (!isSupabaseConfigured()) {
      setError('Supabase not configured');
      setIsLoading(false);
      return false;
    }

    try {
      const { data, error: authError } = await withTimeout(
        supabase.auth.signInWithPassword({ email, password }),
        10000
      );

      if (authError) throw authError;

      if (data.user && data.session) {
        setSession(data.session);
        setUser(data.user);
        await fetchPlayerData(data.user);
      }

      setIsLoading(false);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      setError(message);
      setIsLoading(false);
      return false;
    }
  }, [fetchPlayerData]);

  const signUp = useCallback(async (name: string, email: string, password: string, isAdmin: boolean = false): Promise<boolean> => {
    setError(null);
    setIsLoading(true);

    if (!isSupabaseConfigured()) {
      setError('Supabase not configured');
      setIsLoading(false);
      return false;
    }

    try {
      const { data: authData, error: authError } = await withTimeout(
        supabase.auth.signUp({ email, password }),
        10000
      );

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');
      if (!authData.session) throw new Error('No session returned - email confirmation may be required');

      const { error: playerError } = await db.insert('players', {
        auth_id: authData.user.id,
        name,
        email,
        is_admin: isAdmin,
      }, { authToken: authData.session.access_token });

      if (playerError) throw new Error(playerError.message);

      // Immediately update state after successful signup
      setSession(authData.session);
      setUser(authData.user);
      await fetchPlayerData(authData.user);

      setIsLoading(false);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
      setIsLoading(false);
      return false;
    }
  }, [fetchPlayerData]);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured()) return;

    try {
      await withTimeout(supabase.auth.signOut(), 5000);
      setSession(null);
      setUser(null);
      setPlayerData(null);
      setError(null);
    } catch (err) {
      console.error('Sign out error:', err);
      setSession(null);
      setUser(null);
      setPlayerData(null);
    }
  }, []);

  const value: AuthContextType = {
    session,
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
