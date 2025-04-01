
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

// Mock banner data - in a real app, this would come from API/database
const defaultBanners = [
  {
    id: "1",
    imageUrl: "https://images.unsplash.com/photo-1606913084603-3e7702b01627?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    title: "Summer Specials",
    subtitle: "Fresh produce at unbeatable prices!",
    link: "/shop?category=fruits",
    active: true
  },
  {
    id: "2",
    imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1574&q=80",
    title: "Organic Vegetables",
    subtitle: "Straight from local farmers",
    link: "/shop?category=vegetables",
    active: true
  }
];

const AdminBanner = () => {
  const { user } = useAuth();
  const [banners, setBanners] = useState(defaultBanners);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    // Auto-rotation for banners every 5 seconds
    const interval = setInterval(() => {
      if (!isEditing && banners.length > 1) {
        setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [banners.length, isEditing]);
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // In a real app, you would upload this to your storage service
    // For demo purposes, we'll use a local URL
    const fileUrl = URL.createObjectURL(file);
    
    // Add new banner to the list
    setBanners([
      ...banners,
      {
        id: `new-${Date.now()}`,
        imageUrl: fileUrl,
        title: "New Promotion",
        subtitle: "Click to edit",
        link: "/shop",
        active: true
      }
    ]);
    
    toast.success("Banner added successfully!");
  };
  
  const removeBanner = (id: string) => {
    setBanners(banners.filter(banner => banner.id !== id));
    setCurrentBannerIndex(0); // Reset to first banner
    toast.success("Banner removed successfully!");
  };
  
  const currentBanner = banners[currentBannerIndex];
  
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
  
  return (
    <div className="relative w-full overflow-hidden rounded-xl">
      {/* Banner Image */}
      <div className="relative w-full h-80 overflow-hidden rounded-xl">
        <img
          src={currentBanner.imageUrl}
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
