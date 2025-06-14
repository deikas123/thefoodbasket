
import { supabase } from "@/integrations/supabase/client";

const defaultBanners = [
  {
    title: "Summer Specials",
    subtitle: "Fresh produce at unbeatable prices!",
    image: "https://images.unsplash.com/photo-1606913084603-3e7702b01627?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    link: "/shop?category=fruits",
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    active: true,
    priority: 1
  },
  {
    title: "Organic Vegetables",
    subtitle: "Straight from local farmers",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1574&q=80",
    link: "/shop?category=vegetables",
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    active: true,
    priority: 2
  }
];

export const seedDefaultBanners = async () => {
  try {
    // Check if banners already exist
    const { data: existingBanners } = await supabase
      .from("banners")
      .select("id")
      .limit(1);
    
    // Only seed if no banners exist
    if (!existingBanners || existingBanners.length === 0) {
      const { error } = await supabase
        .from("banners")
        .insert(defaultBanners);
      
      if (error) throw error;
      console.log("Default banners seeded successfully");
    }
  } catch (error) {
    console.error("Error seeding default banners:", error);
  }
};
