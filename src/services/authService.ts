
import { User, RegisterFormData, LoginFormData, UserRole } from "@/types";

// Simulate a database of users
let users: User[] = [
  {
    id: "u1",
    email: "admin@foodbasket.com",
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    addresses: [],
    loyaltyPoints: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: "u2",
    email: "customer@example.com",
    firstName: "John",
    lastName: "Doe",
    role: "customer",
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
  },
  {
    id: "u3",
    email: "delivery@foodbasket.com",
    firstName: "Delivery",
    lastName: "Person",
    role: "delivery",
    addresses: [],
    loyaltyPoints: 0,
    createdAt: new Date().toISOString()
  }
];

// Store the current user in localStorage
export const getCurrentUser = (): User | null => {
  const storedUser = localStorage.getItem("currentUser");
  return storedUser ? JSON.parse(storedUser) : null;
};

// Simulate login API call
export const login = async (credentials: LoginFormData): Promise<User> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Find the user by email
  const user = users.find(u => u.email === credentials.email);
  
  // In a real app, you would check the password here
  // For demo purposes, we're just checking if the user exists
  if (!user) {
    throw new Error("Invalid email or password");
  }
  
  // Save the user to localStorage (in a real app, you'd use a token)
  localStorage.setItem("currentUser", JSON.stringify(user));
  
  return user;
};

// Simulate register API call
export const register = async (userData: RegisterFormData): Promise<User> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Check if email already exists
  if (users.some(u => u.email === userData.email)) {
    throw new Error("Email already in use");
  }
  
  // Create a new user
  const newUser: User = {
    id: `u${users.length + 1}`,
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    role: userData.role || "customer",
    addresses: [],
    loyaltyPoints: 0,
    createdAt: new Date().toISOString()
  };
  
  // Add the user to our "database"
  users = [...users, newUser];
  
  // Save the user to localStorage
  localStorage.setItem("currentUser", JSON.stringify(newUser));
  
  return newUser;
};

// Simulate logout
export const logout = (): void => {
  localStorage.removeItem("currentUser");
};

// Update user profile
export const updateProfile = async (userData: Partial<User>): Promise<User> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error("User not authenticated");
  }
  
  // Update the user in our "database"
  const updatedUser = { ...currentUser, ...userData };
  users = users.map(u => u.id === updatedUser.id ? updatedUser : u);
  
  // Update localStorage
  localStorage.setItem("currentUser", JSON.stringify(updatedUser));
  
  return updatedUser;
};
