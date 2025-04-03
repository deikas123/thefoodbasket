
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
        
        // Verify if there's an actual Supabase session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error fetching session:", error);
          // Don't throw here, just continue with localStorage user if available
        }
        
        if (session?.user) {
          // If we have a valid session but no stored user data, fetch it
          if (!storedUser) {
            // For demo purposes, fetch from mock user data
            // In a real app, you would fetch from Supabase
            const mockUsers = [
              {
                id: "u1",
                email: "admin@foodbasket.com",
                firstName: "Admin",
                lastName: "User",
                role: "admin" as UserRole,
                addresses: [],
                loyaltyPoints: 0,
                createdAt: new Date().toISOString()
              },
              {
                id: "u2",
                email: "customer@example.com",
                firstName: "John",
                lastName: "Doe",
                role: "customer" as UserRole,
                addresses: [
                  {
                    id: "a1",
                    street: "123 Main St",
                    city: "Anytown",
                    state: "CA",
                    zipCode: "12345",
                    isDefault: true
                  }
                ],
                phone: "555-123-4567",
                dietaryPreferences: ["vegetarian"],
                loyaltyPoints: 100,
                createdAt: new Date().toISOString()
              }
            ];
            
            const mockUser = mockUsers.find(u => u.email === session.user.email);
            
            if (mockUser) {
              setUser(mockUser);
              localStorage.setItem("currentUser", JSON.stringify(mockUser));
            }
          }
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        // Keep existing user from localStorage if available
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // For demo purposes, use mock data
          const mockUsers = [
            {
              id: "u1",
              email: "admin@foodbasket.com",
              firstName: "Admin",
              lastName: "User",
              role: "admin" as UserRole,
              addresses: [],
              loyaltyPoints: 0,
              createdAt: new Date().toISOString()
            },
            {
              id: "u2",
              email: "customer@example.com", 
              firstName: "John",
              lastName: "Doe",
              role: "customer" as UserRole,
              addresses: [
                {
                  id: "a1",
                  street: "123 Main St",
                  city: "Anytown",
                  state: "CA",
                  zipCode: "12345",
                  isDefault: true
                }
              ],
              phone: "555-123-4567",
              dietaryPreferences: ["vegetarian"],
              loyaltyPoints: 100,
              createdAt: new Date().toISOString()
            }
          ];
          
          if (session?.user) {
            const mockUser = mockUsers.find(u => u.email === session.user.email);
            
            if (mockUser) {
              setUser(mockUser);
              localStorage.setItem("currentUser", JSON.stringify(mockUser));
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
  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    
    try {
      // For demo purposes, skip actual Supabase auth and use mock data
      const mockUsers = [
        {
          id: "u1",
          email: "admin@foodbasket.com",
          firstName: "Admin",
          lastName: "User",
          role: "admin" as UserRole,
          addresses: [],
          loyaltyPoints: 0,
          createdAt: new Date().toISOString()
        },
        {
          id: "u2",
          email: "customer@example.com",
          firstName: "John",
          lastName: "Doe",
          role: "customer" as UserRole,
          addresses: [
            {
              id: "a1",
              street: "123 Main St",
              city: "Anytown",
              state: "CA",
              zipCode: "12345",
              isDefault: true
            }
          ],
          phone: "555-123-4567",
          dietaryPreferences: ["vegetarian"],
          loyaltyPoints: 100,
          createdAt: new Date().toISOString()
        }
      ];
      
      const user = mockUsers.find(u => u.email === email);
      
      if (!user) {
        throw new Error("Invalid email or password");
      }
      
      // Save the user to localStorage
      localStorage.setItem("currentUser", JSON.stringify(user));
      setUser(user);
      
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
      
      return user;
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Register function
  const register = async (userData: RegisterFormData): Promise<User> => {
    setIsLoading(true);
    
    try {
      // For demo purposes, create a new mock user
      const newUser: User = {
        id: `u${Date.now()}`,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: (userData.role as UserRole) || "customer",
        addresses: [],
        loyaltyPoints: 0,
        createdAt: new Date().toISOString()
      };
      
      // Save to localStorage
      localStorage.setItem("currentUser", JSON.stringify(newUser));
      setUser(newUser);
      
      toast({
        title: "Registration successful!",
        description: "Your account has been created.",
      });
      
      return newUser;
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
      // Just clear local storage and state
      localStorage.removeItem("currentUser");
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
      // Update the user state with new data
      const updatedUser = { ...user, ...userData };
      
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
