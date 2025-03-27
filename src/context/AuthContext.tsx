import React, { createContext, useContext, useState, useEffect } from "react";
import { User, AuthContextType, RegisterFormData, LoginFormData } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Session, User as SupabaseUser } from "@supabase/supabase-js";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (session?.user) {
          fetchUserProfile(session.user);
        } else {
          setUser(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);
  
  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();
      
      if (error) throw error;
      
      if (profile) {
        const { data: addresses, error: addressError } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', supabaseUser.id);
          
        if (addressError) throw addressError;
        
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          role: 'customer',
          addresses: addresses || [],
          phone: profile.phone || undefined,
          dietaryPreferences: profile.dietary_preferences || [],
          loyaltyPoints: profile.loyalty_points || 0,
          createdAt: profile.created_at || new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast({
        title: "Error loading profile",
        description: "There was an error loading your profile data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const register = async (userData: RegisterFormData) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
          }
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Registration successful",
        description: "Welcome to The Food Basket!",
      });
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    }
  };
  
  const updateProfile = async (userData: Partial<User>) => {
    try {
      setIsLoading(true);
      
      if (!user) throw new Error("No user is logged in");
      
      if (userData.firstName || userData.lastName || userData.phone || userData.dietaryPreferences) {
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
      }
      
      if (userData.addresses) {
        for (const address of userData.addresses) {
          if (address.id.startsWith('new_')) {
            const { id, ...addressData } = address;
            const { error } = await supabase
              .from('addresses')
              .insert({
                user_id: user.id,
                street: addressData.street,
                city: addressData.city,
                state: addressData.state,
                zip_code: addressData.zipCode,
                is_default: addressData.isDefault
              });
              
            if (error) throw error;
          } else {
            const { error } = await supabase
              .from('addresses')
              .update({
                street: address.street,
                city: address.city,
                state: address.state,
                zip_code: address.zipCode,
                is_default: address.isDefault
              })
              .eq('id', address.id)
              .eq('user_id', user.id);
              
            if (error) throw error;
          }
        }
      }
      
      if (session?.user) {
        await fetchUserProfile(session.user);
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      
      return user;
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
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
        updateProfile,
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
