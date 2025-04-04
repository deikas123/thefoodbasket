// Note: Since this is a demo service, we're keeping the changes minimal.
// In a real application, you would need to update the database schema 
// to include a products table before using these functions.

import { supabase } from "@/integrations/supabase/client";
import { products as mockProducts } from "@/data/products";
import { UserRole } from "@/types";

export const initializeDatabase = async () => {
  try {
    console.log("Initializing database...");
    await createDemoUser();
    // Removed createProducts() call as there's no products table yet in Supabase
    await createDemoOrders();
    console.log("Database initialized successfully!");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

// Create a demo user for testing
const createDemoUser = async () => {
  const { data: existingUsers, error: queryError } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);
  
  if (queryError) {
    console.error("Error checking for existing users:", queryError);
    return;
  }
  
  // If there are already users, don't create more
  if (existingUsers && existingUsers.length > 0) {
    console.log("Users already exist, skipping user creation");
    return;
  }
  
  // In a real app, this would create a user via Supabase Auth
  // For demo purposes, we're just adding a profile directly
  const { data, error } = await supabase
    .from('profiles')
    .insert([
      {
        id: '00000000-0000-0000-0000-000000000000',
        first_name: 'Demo',
        last_name: 'User',
        phone: '+1234567890',
        loyalty_points: 100
      }
    ]);
  
  if (error) {
    console.error("Error creating demo user:", error);
  } else {
    console.log("Demo user created:", data);
  }
};

// Function to create demo orders
const createDemoOrders = async () => {
  const { data: existingOrders, error: queryError } = await supabase
    .from('orders')
    .select('*')
    .limit(1);
  
  if (queryError) {
    console.error("Error checking for existing orders:", queryError);
    return;
  }
  
  // If there are already orders, don't create more
  if (existingOrders && existingOrders.length > 0) {
    console.log("Orders already exist, skipping order creation");
    return;
  }
  
  // Demo order - note we're using a limited set of fields to match the schema
  const demoOrder = {
    user_id: '00000000-0000-0000-0000-000000000000',
    status: 'processing',
    items: [
      {
        productId: mockProducts[0].id,
        name: mockProducts[0].name,
        price: mockProducts[0].price,
        quantity: 2,
        image: mockProducts[0].image
      },
      {
        productId: mockProducts[1].id,
        name: mockProducts[1].name,
        price: mockProducts[1].price,
        quantity: 1,
        image: mockProducts[1].image
      }
    ],
    subtotal: mockProducts[0].price * 2 + mockProducts[1].price,
    delivery_fee: 5.99,
    total: mockProducts[0].price * 2 + mockProducts[1].price + 5.99,
    delivery_address: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345'
    },
    delivery_method: {
      id: 'standard',
      name: 'Standard Delivery',
      price: 5.99,
      estimatedDays: 3
    },
    payment_method: {
      id: 'card',
      name: 'Credit Card',
      last4: '4242'
    },
    estimated_delivery: '3 days'
  };
  
  const { data, error } = await supabase
    .from('orders')
    .insert([demoOrder]);
  
  if (error) {
    console.error("Error creating demo orders:", error);
  } else {
    console.log("Demo orders created");
  }
};

// Add the missing functions
export const seedProducts = async (): Promise<boolean> => {
  try {
    // Check if products already exist (using mock data since we don't have a products table yet)
    console.log("Checking if products need to be seeded...");
    
    // For now, we always return false since we don't have a products table
    // In a real implementation, this would check the actual database
    return false;
  } catch (error) {
    console.error("Error seeding products:", error);
    return false;
  }
};

export const checkAndAssignRoleIfFirstUser = async (userId: string): Promise<void> => {
  try {
    // Count existing users
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error("Error counting users:", countError);
      return;
    }
    
    // If this is one of the first few users, assign admin role
    if (count !== null && count <= 3) {
      console.log("Assigning admin role to user", userId);
      
      // Check if user_roles table exists
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([
          { user_id: userId, role: 'admin' }
        ]);
      
      if (roleError) {
        console.error("Error assigning role:", roleError);
      } else {
        console.log("Admin role assigned successfully");
      }
    }
  } catch (error) {
    console.error("Error in checkAndAssignRoleIfFirstUser:", error);
  }
};
