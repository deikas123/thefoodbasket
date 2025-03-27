
import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthContextType, User, UserRole, RegisterFormData, Address } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (session?.user) {
          const userData = await fetchUserProfile(session.user.id);
          setUser(userData);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const userData = await fetchUserProfile(session.user.id);
          setUser(userData);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);
  
  // Fetch user profile data including addresses
  const fetchUserProfile = async (userId: string): Promise<User> => {
    // Fetch profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error("Error fetching profile:", profileError);
      throw profileError;
    }
    
    // Get email and role from auth.users
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError) {
      console.error("Error fetching user data:", userError);
      throw userError;
    }
    
    // Fetch addresses
    const { data: addressesData, error: addressesError } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId);
    
    if (addressesError) {
      console.error("Error fetching addresses:", addressesError);
      throw addressesError;
    }
    
    // Convert from database format to app format
    const addresses: Address[] = addressesData ? addressesData.map(addr => ({
      id: addr.id,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      zipCode: addr.zip_code,
      isDefault: addr.is_default
    })) : [];
    
    // Determine user role from metadata or default to "customer"
    const userRole = (userData?.user?.app_metadata?.role as UserRole) || "customer";
    
    return {
      id: userId,
      email: userData?.user?.email || "",
      firstName: profile?.first_name || "",
      lastName: profile?.last_name || "",
      role: userRole,
      addresses: addresses,
      phone: profile?.phone || undefined,
      dietaryPreferences: profile?.dietary_preferences || undefined,
      loyaltyPoints: profile?.loyalty_points || 0,
      createdAt: profile?.created_at || new Date().toISOString()
    };
  };
  
  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      if (!data.user) {
        throw new Error("Login failed. User not found.");
      }
      
      // User data is fetched via the auth state change listener
      
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Register function
  const register = async (userData: RegisterFormData) => {
    setIsLoading(true);
    
    try {
      // Register the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: userData.role || "customer"
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (!data.user) {
        throw new Error("Registration failed. Please try again.");
      }
      
      // User profile is created via the database trigger we set up
      
      toast({
        title: "Registration successful!",
        description: "Your account has been created.",
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      throw new Error(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Logout function
  const logout = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      setUser(null);
      
      toast({
        title: "Logged out",
        description: "You've been successfully logged out.",
      });
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: error.message || "Logout failed. Please try again.",
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
      // Update profile data
      if (userData.firstName !== undefined || 
          userData.lastName !== undefined || 
          userData.phone !== undefined ||
          userData.dietaryPreferences !== undefined) {
        
        const { error } = await supabase
          .from('profiles')
          .update({
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone: userData.phone,
            dietary_preferences: userData.dietaryPreferences
          })
          .eq('id', user.id);
        
        if (error) throw error;
      }
      
      // If addresses are provided, they're already handled by the AddressFormDialog component
      
      // Refetch the user profile to get the updated data
      const updatedUser = await fetchUserProfile(user.id);
      
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
