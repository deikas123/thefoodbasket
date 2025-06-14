import { createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "@/hooks/useAuthState";
import { signInUser, signOutUser, updateUserProfile, registerUser } from "@/services/authOperations";
import { AuthContextType, User } from "@/types/auth";

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
  const { authState, setAuthState, updateUserProfile } = useAuthState();
  const navigate = useNavigate();

  const handleRoleBasedRedirect = (userRole: string | undefined) => {
    if (userRole === 'admin') {
      navigate('/admin');
    } else if (userRole && userRole !== 'customer') {
      navigate('/staff');
    }
  };

  const signIn = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true }));
    try {
      const user = await signInUser(email, password);
      if (user) {
        const { userData } = await updateUserProfile(user, true);
        if (userData) {
          handleRoleBasedRedirect(userData.role);
        }
      }
    } catch (error: any) {
      console.error('Error signing in:', error.message);
      throw error;
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  const signOut = async () => {
    setAuthState(prev => ({ ...prev, loading: true }));
    try {
      await signOutUser();
      setAuthState(prev => ({ ...prev, user: null }));
      navigate('/');
    } catch (error: any) {
      console.error('Error signing out:', error.message);
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<User> => {
    if (!authState.user) throw new Error("User not authenticated");
    
    try {
      // Use the string overload of updateUserProfile
      await updateUserProfile(authState.user.id, userData);
      
      // Refresh the user data by fetching the updated profile
      if (authState.session?.user) {
        const result = await updateUserProfile(authState.session.user);
        return result.userData || authState.user;
      }
      
      return authState.user;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const register = async (userData: any) => {
    setAuthState(prev => ({ ...prev, loading: true }));
    try {
      const user = await registerUser(userData);
      return user;
    } catch (error: any) {
      console.error('Error registering:', error.message);
      throw error;
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  const value: AuthContextType = {
    user: authState.user,
    loading: authState.loading,
    signIn,
    signOut,
    session: authState.session,
    supabaseClient: supabase,
    // Added for compatibility with existing code
    login: signIn,
    logout: signOut,
    isAuthenticated: !!authState.user,
    isLoading: authState.loading,
    updateProfile,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {!authState.loading && children}
    </AuthContext.Provider>
  );
};
