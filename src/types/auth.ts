
import { Session } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";

export interface User {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  addresses?: any[];
  photoURL?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dietaryPreferences?: string[];
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export interface AuthContextType {
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
