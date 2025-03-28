
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
        // First check localStorage for saved user data
        const storedUser = localStorage.getItem("currentUser");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (session?.user) {
          // If we have a valid session but no stored user data, fetch it
          if (!storedUser) {
            const { data } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (data) {
              // Create user object and save to state and localStorage
              const userData: User = {
                id: session.user.id,
                email: session.user.email || "",
                firstName: data.first_name || "",
                lastName: data.last_name || "",
                role: (session.user.app_metadata?.role as UserRole) || "customer",
                addresses: [],
                loyaltyPoints: data.loyalty_points || 0,
                createdAt: data.created_at || new Date().toISOString()
              };
              
              setUser(userData);
              localStorage.setItem("currentUser", JSON.stringify(userData));
            }
          }
        } else {
          // No session, clear user data
          setUser(null);
          localStorage.removeItem("currentUser");
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        localStorage.removeItem("currentUser");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            const { data } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (data) {
              // Create user object and save to state and localStorage
              const userData: User = {
                id: session.user.id,
                email: session.user.email || "",
                firstName: data.first_name || "",
                lastName: data.last_name || "",
                role: (session.user.app_metadata?.role as UserRole) || "customer",
                addresses: [],
                loyaltyPoints: data.loyalty_points || 0,
                createdAt: data.created_at || new Date().toISOString()
              };
              
              // Fetch addresses
              const { data: addressesData } = await supabase
                .from('addresses')
                .select('*')
                .eq('user_id', session.user.id);
              
              if (addressesData) {
                // Convert from database format to app format
                userData.addresses = addressesData.map(addr => ({
                  id: addr.id,
                  street: addr.street,
                  city: addr.city,
                  state: addr.state,
                  zipCode: addr.zip_code,
                  isDefault: addr.is_default
                }));
              }
              
              setUser(userData);
              localStorage.setItem("currentUser", JSON.stringify(userData));
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem("currentUser");
        }
        setIsLoading(false);
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);
  
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
      
      // For testing purposes, simulate successful user creation
      const newUser: User = {
        id: data.user.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role || "customer",
        addresses: [],
        loyaltyPoints: 0,
        createdAt: new Date().toISOString()
      };
      
      setUser(newUser);
      localStorage.setItem("currentUser", JSON.stringify(newUser));
      
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
      localStorage.removeItem("currentUser");
      
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
      
      // Update the user state with new data
      const updatedUser = {
        ...user,
        ...userData
      };
      
      setUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      
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
