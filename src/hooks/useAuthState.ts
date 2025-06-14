
import { useState, useEffect } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { fetchUserProfile } from "@/services/authOperations";
import { User, AuthState } from "@/types/auth";

export const useAuthState = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true
  });

  const updateUserProfile = async (authUser: SupabaseUser, shouldRedirect: boolean = false) => {
    try {
      const userData = await fetchUserProfile(authUser);
      setAuthState(prev => ({ ...prev, user: userData }));
      return { userData, shouldRedirect };
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      return { userData: null, shouldRedirect: false };
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuthState(prev => ({ ...prev, session }));
        if (session?.user) {
          updateUserProfile(session.user, false); // Don't redirect on auth state change
        } else {
          setAuthState(prev => ({ ...prev, user: null, loading: false }));
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(prev => ({ ...prev, session }));
      if (session?.user) {
        updateUserProfile(session.user, false); // Don't redirect on initial load
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { authState, setAuthState, updateUserProfile };
};
