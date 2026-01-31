import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleSession = useCallback(async (session) => {
    setSession(session);
    setUser(session?.user ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        handleSession(session);
      } catch (error) {
        console.error("Error getting session:", error);
        setLoading(false);
      }
    };

    getSession();

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Handle signed out event explicitly to double-ensure state clearing
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          setLoading(false);
        } else {
          handleSession(session);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [handleSession]);

  const signUp = useCallback(async (email, password, options) => {
    const { error } = await supabase.auth.signUp({
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

    return { error };
  }, [toast]);

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign in Failed",
        description: error.message || "Something went wrong",
      });
    }

    return { error };
  }, [toast]);

  const signOut = useCallback(async () => {
    try {
      // 1. CRITICAL FIX: Explicitly clear local state FIRST.
      // This ensures the UI updates immediately to "logged out" even if the 
      // server request fails because the session token is already invalid.
      setUser(null);
      setSession(null);
      
      // 2. Attempt Supabase sign out
      const { error } = await supabase.auth.signOut();

      // 3. Handle specific "Session not found" errors gracefully
      if (error) {
        // If the session doesn't exist on server, we are effectively logged out anyway.
        // We only log this as a warning, not an error that stops the flow.
        console.warn("Supabase signOut notice:", error.message);
      }
      
      return { error: null }; // Return success to consumers since we are locally logged out
    } catch (err) {
      console.error("Unexpected error during sign out:", err);
      // Ensure we are logged out locally even on crash
      setUser(null);
      setSession(null);
      return { error: null };
    }
  }, []);

  const value = useMemo(() => ({
    user,
    session,
    loading,
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