import { createContext, useContext, useState, useEffect } from 'react';
import {
  Session,
  User as SupabaseUser,
  useSession,
  useSupabaseClient,
} from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';

export interface User {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  // Add any other fields you need from the user
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  session: Session | null;
  supabaseClient: any;
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
  const [loading, setLoading] = useState(true);
  const session = useSession();
  const supabaseClient = useSupabaseClient();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      if (session?.user) {
        try {
          const { data: profile, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error) {
            console.error('Error fetching profile:', error);
            // Handle error appropriately
          }

          setUser({
            id: session.user.id,
            email: session.user.email || '',
            first_name: profile?.first_name || '',
            last_name: profile?.last_name || '',
          });
        } catch (error) {
          console.error('Unexpected error fetching profile:', error);
          // Handle error appropriately
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    };

    fetchUser();
  }, [session, supabaseClient]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // After successful sign-in, the useEffect hook will update the user state
    } catch (error: any) {
      console.error('Error signing in:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabaseClient.auth.signOut();
      if (error) throw error;
      setUser(null);
      router.push('/'); // Redirect to home page after sign out
    } catch (error: any) {
      console.error('Error signing out:', error.message);
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
    supabaseClient,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
