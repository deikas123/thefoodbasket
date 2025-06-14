
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const seedProducts = async (): Promise<boolean> => {
  try {
    // Check if products already exist
    const { data: existingProducts, error: checkError } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error("Error checking existing products:", checkError);
      return false;
    }

    // If products already exist, don't seed again
    if (existingProducts && existingProducts.length > 0) {
      console.log("Products already seeded, skipping...");
      return false;
    }

    // First, ensure categories exist
    await seedCategories();

    // Get category IDs for seeding products
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name');

    if (!categories || categories.length === 0) {
      console.error("No categories found for seeding products");
      return false;
    }

    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.name] = cat.id;
      return acc;
    }, {} as Record<string, string>);

    // Sample products data
    const productsData = [
      {
        name: "Fresh Organic Apples",
        description: "Crisp and sweet organic apples, perfect for snacking or baking.",
        price: 4.99,
        image: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=500",
        category_id: categoryMap["Fruits"] || categories[0].id,
        stock: 100,
        featured: true,
        rating: 4.5,
        num_reviews: 23
      },
      {
        name: "Premium Ground Beef",
        description: "High-quality ground beef, perfect for burgers and pasta dishes.",
        price: 12.99,
        image: "https://images.unsplash.com/photo-1588347818481-3e0b9e7fc3d0?w=500",
        category_id: categoryMap["Meat"] || categories[0].id,
        stock: 50,
        featured: true,
        rating: 4.8,
        num_reviews: 45
      },
      {
        name: "Whole Grain Bread",
        description: "Freshly baked whole grain bread with seeds and nuts.",
        price: 3.49,
        image: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=500",
        category_id: categoryMap["Bakery"] || categories[0].id,
        stock: 75,
        featured: false,
        rating: 4.2,
        num_reviews: 18
      },
      {
        name: "Fresh Salmon Fillet",
        description: "Wild-caught salmon fillet, rich in omega-3 fatty acids.",
        price: 18.99,
        image: "https://images.unsplash.com/photo-1551881899-562d9ff8c58c?w=500",
        category_id: categoryMap["Seafood"] || categories[0].id,
        stock: 30,
        featured: true,
        rating: 4.7,
        num_reviews: 32
      },
      {
        name: "Organic Mixed Vegetables",
        description: "Fresh organic mixed vegetables including carrots, broccoli, and bell peppers.",
        price: 6.99,
        image: "https://images.unsplash.com/photo-1596097781184-2ff15dd3bff1?w=500",
        category_id: categoryMap["Vegetables"] || categories[0].id,
        stock: 80,
        featured: false,
        rating: 4.3,
        num_reviews: 27
      }
    ];

    const { error: insertError } = await supabase
      .from('products')
      .insert(productsData);

    if (insertError) {
      console.error("Error seeding products:", insertError);
      return false;
    }

    console.log("Products seeded successfully!");
    return true;

  } catch (error) {
    console.error("Error in seedProducts:", error);
    return false;
  }
};

const seedCategories = async () => {
  // Check if categories already exist
  const { data: existingCategories } = await supabase
    .from('categories')
    .select('id')
    .limit(1);

  if (existingCategories && existingCategories.length > 0) {
    return;
  }

  const categoriesData = [
    {
      name: "Fruits",
      slug: "fruits",
      description: "Fresh and organic fruits",
      image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500"
    },
    {
      name: "Vegetables",
      slug: "vegetables", 
      description: "Fresh organic vegetables",
      image: "https://images.unsplash.com/photo-1598030393315-d2c7d5c89f8e?w=500"
    },
    {
      name: "Meat",
      slug: "meat",
      description: "Premium quality meat products",
      image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=500"
    },
    {
      name: "Seafood",
      slug: "seafood",
      description: "Fresh seafood and fish",
      image: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=500"
    },
    {
      name: "Bakery",
      slug: "bakery",
      description: "Fresh baked goods and bread",
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500"
    }
  ];

  await supabase.from('categories').insert(categoriesData);
};

export const checkAndAssignRoleIfFirstUser = async (userId: string): Promise<void> => {
  try {
    // Check total number of users with roles
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id')
      .limit(5); // Check first 5 users

    if (rolesError) {
      console.error("Error fetching user roles:", rolesError);
      return;
    }

    // If this user already has a role, skip
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (existingRole) {
      console.log("User already has a role assigned");
      return;
    }

    // If fewer than 3 users have roles, make this user an admin
    if (!userRoles || userRoles.length < 3) {
      const { error: assignError } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role: 'admin' }]);

      if (assignError) {
        // Check if it's a duplicate key error (which is fine)
        if (assignError.code === '23505') {
          console.log("User role already exists, skipping assignment");
          return;
        }
        console.error("Error assigning admin role:", assignError);
        return;
      }

      console.log("Admin role assigned to user:", userId);
      toast.success("Welcome! You've been assigned admin privileges.");
    } else {
      // Assign customer role for regular users
      const { error: assignError } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role: 'customer' }]);

      if (assignError) {
        // Check if it's a duplicate key error (which is fine)
        if (assignError.code === '23505') {
          console.log("User role already exists, skipping assignment");
          return;
        }
        console.error("Error assigning customer role:", assignError);
        return;
      }

      console.log("Customer role assigned to user:", userId);
    }
  } catch (error) {
    console.error("Error in checkAndAssignRoleIfFirstUser:", error);
  }
};
