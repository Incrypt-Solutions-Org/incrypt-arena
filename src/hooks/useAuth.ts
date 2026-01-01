/**
 * useAuth Hook
 * Manages authentication state with Supabase Auth
 * Note: Admins are managed via Supabase Auth only (not in the players table)
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

/**
 * Demo admin credentials for development without Supabase
 */
const DEMO_ADMIN = {
  email: 'admin@incrypt.com',
  password: 'gameofcode2026',
};

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      // Demo mode - check localStorage for simulated auth
      const demoUser = localStorage.getItem('demo_user');
      if (demoUser) {
        setUser(JSON.parse(demoUser));
        setIsAdmin(true);
      }
      setIsLoading(false);
      return;
    }

    // Get initial session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        // Any authenticated user in Supabase Auth is considered an admin
        setIsAdmin(true);
      }
      setIsLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          setIsAdmin(true);
        } else {
          setUser(null);
          setIsAdmin(false);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Sign in with email and password
   */
  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    setError(null);
    setIsLoading(true);

    // Demo mode authentication
    if (!isSupabaseConfigured()) {
      if (email === DEMO_ADMIN.email && password === DEMO_ADMIN.password) {
        const demoUser = { id: 'demo-admin', email } as User;
        localStorage.setItem('demo_user', JSON.stringify(demoUser));
        setUser(demoUser);
        setIsAdmin(true);
        setIsLoading(false);
        return true;
      } else {
        setError('Invalid credentials. Use admin@incrypt.com / gameofcode2026');
        setIsLoading(false);
        return false;
      }
    }

    // Supabase authentication
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.user) {
        // Any authenticated user in Supabase Auth is considered an admin
        setUser(data.user);
        setIsAdmin(true);
      }

      setIsLoading(false);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
      setIsLoading(false);
      return false;
    }
  }, []);

  /**
   * Sign out current user
   */
  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      localStorage.removeItem('demo_user');
      setUser(null);
      setIsAdmin(false);
      return;
    }

    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  }, []);

  return {
    user,
    isLoading,
    isAdmin,
    error,
    signIn,
    signOut,
  };
}
