
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  start_date: string;
  end_date: string;
  active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

const AdminBanner = () => {
  const { user } = useAuth();
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  
  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("active", true)
        .gte("end_date", new Date().toISOString())
        .lte("start_date", new Date().toISOString())
        .order("priority", { ascending: true });
      
      if (error) throw error;
      return data as Banner[];
    }
  });
  
  useEffect(() => {
    // Auto-rotation for banners every 5 seconds
    const interval = setInterval(() => {
      if (!isEditing && banners.length > 1) {
        setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [banners.length, isEditing]);
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // In a real app, you would upload this to your storage service
    // For demo purposes, we'll use a local URL
    const fileUrl = URL.createObjectURL(file);
    
    try {
      const { error } = await supabase
        .from("banners")
        .insert([{
          title: "New Promotion",
          subtitle: "Click to edit",
          image: fileUrl,
          link: "/shop",
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          active: true,
          priority: banners.length + 1
        }]);
      
      if (error) throw error;
      toast.success("Banner added successfully!");
    } catch (error) {
      toast.error("Failed to add banner");
    }
  };
  
  const removeBanner = async (id: string) => {
    try {
      const { error } = await supabase
        .from("banners")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      setCurrentBannerIndex(0); // Reset to first banner
      toast.success("Banner removed successfully!");
    } catch (error) {
      toast.error("Failed to remove banner");
    }
  };
  
  if (isLoading) {
    return (
      <div className="w-full h-80 bg-primary/5 flex items-center justify-center rounded-xl">
        <p className="text-muted-foreground">Loading banners...</p>
      </div>
    );
  }
  
  if (!banners.length) {
    return (
      <div className="w-full h-64 bg-primary/5 flex flex-col items-center justify-center rounded-xl">
        <p className="text-muted-foreground mb-4">No promotional banners available</p>
        {user?.role === "admin" && (
          <div>
            <label htmlFor="banner-upload" className="cursor-pointer">
              <Button variant="outline" className="gap-2">
                <Upload size={16} />
                Upload Banner
              </Button>
              <input 
                id="banner-upload" 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>
    );
  }
  
  const currentBanner = banners[currentBannerIndex];
  
  return (
    <div className="relative w-full overflow-hidden rounded-xl">
      {/* Banner Image */}
      <div className="relative w-full h-80 overflow-hidden rounded-xl">
        <img
          src={currentBanner.image}
          alt={currentBanner.title}
          className="w-full h-full object-cover transition-transform duration-700 transform hover:scale-105"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        
        {/* Banner content */}
        <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16">
          <div className="max-w-lg">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 drop-shadow-md">
              {currentBanner.title}
            </h2>
            <p className="text-white/90 text-base md:text-xl mb-6 drop-shadow-md">
              {currentBanner.subtitle}
            </p>
            <Button size="lg" className="button-animation">
              Shop Now
            </Button>
          </div>
        </div>
        
        {/* Admin controls */}
        {user?.role === "admin" && (
          <div className="absolute top-4 right-4 flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
              onClick={() => removeBanner(currentBanner.id)}
            >
              <X className="h-5 w-5 text-white" />
            </Button>
            <label htmlFor="banner-upload" className="cursor-pointer">
              <Button 
                variant="ghost" 
                size="icon" 
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
              >
                <Upload className="h-5 w-5 text-white" />
              </Button>
              <input 
                id="banner-upload" 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>
      
      {/* Banner pagination indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
          {banners.map((banner, index) => (
            <button
              key={banner.id}
              className={`w-6 h-1.5 rounded-full transition-all ${
                index === currentBannerIndex ? "bg-white" : "bg-white/40"
              }`}
              onClick={() => setCurrentBannerIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBanner;
