
import { supabase } from "@/integrations/supabase/client";
import { getUserRole } from "./userService";

// Sample products to seed the database
const sampleProducts = [
  {
    name: "Fresh Tomatoes",
    description: "Locally grown organic tomatoes, perfect for salads and cooking.",
    price: 3.99,
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dG9tYXRvZXN8ZW58MHx8MHx8fDA%3D",
    category: "vegetables",
    featured: true,
    stock: 50
  },
  {
    name: "Organic Bananas",
    description: "Sweet and nutritious organic bananas.",
    price: 2.49,
    image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmFuYW5hc3xlbnwwfHwwfHx8MA%3D%3D",
    category: "fruits",
    featured: true,
    stock: 100
  },
  {
    name: "Whole Milk",
    description: "Farm-fresh whole milk, pasteurized and homogenized.",
    price: 3.29,
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1pbGt8ZW58MHx8MHx8fDA%3D",
    category: "dairy",
    featured: false,
    stock: 30
  },
  {
    name: "Free-Range Eggs",
    description: "Farm-fresh free-range eggs from happy chickens.",
    price: 4.99,
    image: "https://images.unsplash.com/photo-1598965402089-897ce52e8355?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZWdnc3xlbnwwfHwwfHx8MA%3D%3D",
    category: "dairy",
    featured: false,
    stock: 24
  },
  {
    name: "Fresh Spinach",
    description: "Organic fresh spinach leaves, washed and ready to use.",
    price: 2.99,
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3BpbmFjaHxlbnwwfHwwfHx8MA%3D%3D",
    category: "vegetables",
    featured: true,
    stock: 40
  },
  {
    name: "Whole Grain Bread",
    description: "Freshly baked whole grain bread with seeds.",
    price: 3.99,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YnJlYWR8ZW58MHx8MHx8fDA%3D",
    category: "bakery",
    featured: false,
    stock: 20
  },
  {
    name: "Chicken Breast",
    description: "Boneless, skinless chicken breast from free-range chickens.",
    price: 8.99,
    image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2hpY2tlbiUyMGJyZWFzdHxlbnwwfHwwfHx8MA%3D%3D",
    category: "meat",
    featured: false,
    stock: 15
  },
  {
    name: "Fresh Avocados",
    description: "Ripe and ready to eat avocados.",
    price: 6.49,
    image: "https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXZvY2Fkb3xlbnwwfHwwfHx8MA%3D%3D",
    category: "fruits",
    featured: true,
    stock: 30
  }
];

export const seedProducts = async () => {
  try {
    // Check if products already exist
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error("Error checking products count:", countError);
      throw countError;
    }
    
    // Only seed if no products exist
    if (count === 0) {
      const { error } = await supabase
        .from('products')
        .insert(sampleProducts);
        
      if (error) {
        console.error("Error seeding products:", error);
        throw error;
      }
      
      console.log("Database seeded with initial products");
      return true;
    } else {
      console.log("Products already exist, skipping seed");
      return false;
    }
  } catch (error) {
    console.error("Error in seed function:", error);
    throw error;
  }
};

export const createAdminUser = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('user_roles')
      .insert([{ user_id: userId, role: 'admin' }]);
      
    if (error) {
      console.error("Error creating admin user:", error);
      throw error;
    }
    
    console.log("Admin role assigned to user:", userId);
    return true;
  } catch (error) {
    console.error("Error in createAdminUser function:", error);
    throw error;
  }
};

export const createDeliveryUser = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('user_roles')
      .insert([{ user_id: userId, role: 'delivery' }]);
      
    if (error) {
      console.error("Error creating delivery user:", error);
      throw error;
    }
    
    console.log("Delivery role assigned to user:", userId);
    return true;
  } catch (error) {
    console.error("Error in createDeliveryUser function:", error);
    throw error;
  }
};

export const checkAndAssignRoleIfFirstUser = async (userId: string) => {
  try {
    // Check if this is the first user
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error("Error checking user count:", countError);
      return;
    }
    
    // If this is the first or second user, make them an admin
    if (count <= 2) {
      // Check if user already has role
      const role = await getUserRole(userId);
      
      // If no role or customer role, make admin
      if (!role || role === 'customer') {
        await createAdminUser(userId);
      }
    }
  } catch (error) {
    console.error("Error checking first user:", error);
  }
};
