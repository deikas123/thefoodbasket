
import React, { createContext, useContext, useState, useEffect } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { AuthContextType, User, RegisterFormData, LoginFormData } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { ProfileType, UserRole } from "@/types/supabase";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Get Supabase session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error fetching session:", error);
          setIsLoading(false);
          return;
        }
        
        if (session?.user) {
          await loadUserData(session.user);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session);
        
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserData(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);
  
  // Load user data including profile and role
  const loadUserData = async (supabaseUser: SupabaseUser) => {
    try {
      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();
        
      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw new Error("Failed to load user profile");
      }
      
      // Get user role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', supabaseUser.id);
        
      if (roleError) {
        console.error("Error fetching role:", roleError);
        throw new Error("Failed to load user role");
      }
      
      // Default role is customer
      const role = roleData && roleData.length > 0 ? roleData[0].role as UserRole : 'customer';
      
      // Create user object
      const userData: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        firstName: profileData?.first_name || '',
        lastName: profileData?.last_name || '',
        role: role,
        addresses: [],  // Will be loaded as needed
        loyaltyPoints: profileData?.loyalty_points || 0,
        createdAt: supabaseUser.created_at || new Date().toISOString(),
        phone: profileData?.phone || undefined,
        dietaryPreferences: profileData?.dietary_preferences || undefined
      };
      
      setUser(userData);
    } catch (error) {
      console.error("Error loading user data:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Login function
  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (!data.user) {
        throw new Error("No user returned after login");
      }
      
      // User data will be loaded via onAuthStateChange
      
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
      
      // Return placeholder, actual user will be set via auth state change
      return { id: data.user.id } as User;
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Register function
  const register = async (userData: RegisterFormData): Promise<User> => {
    setIsLoading(true);
    
    try {
      // Check if passwords match
      if (userData.confirmPassword && userData.password !== userData.confirmPassword) {
        throw new Error("Passwords don't match");
      }
      
      // Register with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName
          }
        }
      });
      
      if (error) throw error;
      
      if (!data.user) {
        throw new Error("No user returned after registration");
      }
      
      toast({
        title: "Registration successful!",
        description: "Your account has been created.",
      });
      
      // Return placeholder, actual user will be set via auth state change
      return { id: data.user.id } as User;
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Logout function
  const logout = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      toast({
        title: "Logged out",
        description: "You've been successfully logged out.",
      });
      
      setUser(null);
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update user profile
  const updateProfile = async (userData: Partial<User>): Promise<User> => {
    if (!user) {
      throw new Error("You must be logged in to update your profile");
    }
    
    try {
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: userData.firstName || user.firstName,
          last_name: userData.lastName || user.lastName,
          phone: userData.phone || user.phone,
          dietary_preferences: userData.dietaryPreferences || user.dietaryPreferences
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Update local user state
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      
      return updatedUser;
    } catch (error: any) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };
  
  return (
    <AuthContext.Provider 
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
