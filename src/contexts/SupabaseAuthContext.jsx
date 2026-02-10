
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Centralized session handler to keep state in sync
  const handleSession = useCallback((currentSession) => {
    setSession(currentSession);
    setUser(currentSession?.user ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    let mounted = true;

    // 1. Initial Session Check
    const getSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
        }
        
        if (mounted) {
          handleSession(initialSession);
        }
      } catch (error) {
        console.error("Unexpected error getting session:", error);
        if (mounted) setLoading(false);
      }
    };

    getSession();

    // 2. Real-time Auth State Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        if (mounted) {
          handleSession(currentSession);
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [handleSession]);

  const signUp = useCallback(async (email, password, options) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign up Failed",
        description: error.message || "Something went wrong",
      });
    }

    return { data, error };
  }, [toast]);

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign in Failed",
        description: error.message || "Invalid credentials.",
      });
    }

    return { data, error };
  }, [toast]);

  // CRITICAL SECURITY FIX: Robust Sign Out
  const signOut = useCallback(async () => {
    try {
      // 1. Clear local state immediately to update UI
      setUser(null);
      setSession(null);
      setLoading(false);

      // 2. Call Supabase API
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // 3. Clear any potential persistent storage manually as a failsafe
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sb-access-token');
        localStorage.removeItem('sb-refresh-token');
        // Clear any app-specific keys if they existed
      }

      return { error: null };
    } catch (err) {
      console.error("Error during sign out:", err);
      // Force state clear even if API fails to ensure user is "logged out" in the UI
      setUser(null);
      setSession(null);
      return { error: err };
    }
  }, []);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut,
  }), [user, session, loading, signUp, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
