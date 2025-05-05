
import { createContext, useContext, useState, useEffect } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { getUserRole } from "@/services/roleService";

export interface User {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  addresses?: any[]; // Added for compatibility with existing code
  photoURL?: string; // Added for compatibility with existing code
  firstName?: string; // Added for compatibility with existing code
  lastName?: string; // Added for compatibility with existing code
  phone?: string; // Added for compatibility with existing code
  dietaryPreferences?: string[]; // Added for compatibility with existing code
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  session: Session | null;
  supabaseClient: typeof supabase;
  // Added for compatibility with existing code
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  updateProfile: (userData: Partial<User>) => Promise<User>;
  register: (userData: any) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (session?.user) {
          fetchUserProfile(session.user);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (authUser: SupabaseUser) => {
    try {
      // Get user profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      }

      // Get user role
      const userRole = await getUserRole(authUser.id);
      console.log("User role from database:", userRole);

      const userData: User = {
        id: authUser.id,
        email: authUser.email || '',
        first_name: profile?.first_name || '',
        last_name: profile?.last_name || '',
        role: userRole || 'customer',
        // Add compatibility fields
        firstName: profile?.first_name || '',
        lastName: profile?.last_name || '',
        photoURL: profile?.avatar_url || '',
        phone: profile?.phone || '',
        dietaryPreferences: profile?.dietary_preferences || [],
        addresses: profile?.addresses || [],
      };

      console.log("Setting user with role:", userData.role);
      setUser(userData);
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // Auth state change listener will handle the rest
    } catch (error: any) {
      console.error('Error signing in:', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      navigate('/'); // Redirect to home page after sign out
    } catch (error: any) {
      console.error('Error signing out:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<User> => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: userData.firstName || userData.first_name,
          last_name: userData.lastName || userData.last_name,
          phone: userData.phone,
          dietary_preferences: userData.dietaryPreferences
        })
        .eq('id', user.id);
        
      if (error) {
        throw error;
      }
      
      // Refresh user data
      if (session?.user) {
        await fetchUserProfile(session.user);
      }
      
      return user;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const register = async (userData: any) => {
    setLoading(true);
    try {
      const { email, password, firstName, lastName } = userData;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      });
      
      if (error) throw error;
      
      return data.user;
    } catch (error: any) {
      console.error('Error registering:', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    session,
    supabaseClient: supabase,
    // Added for compatibility with existing code
    login: signIn,
    logout: signOut,
    isAuthenticated: !!user,
    isLoading: loading,
    updateProfile,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
