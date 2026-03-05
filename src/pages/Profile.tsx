
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import ProfileTabs from "@/components/profile/ProfileTabs";
import BottomNavigation from "@/components/mobile/BottomNavigation";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen pb-20 md:pb-0">
      <Header />
      
      <main className="flex-grow pt-16 md:pt-24 pb-4 md:pb-16">
        <div className="container mx-auto px-3 md:px-4">
          <div className="flex flex-col md:flex-row gap-3 md:gap-6">
            <ProfileSidebar />
            <div className="flex-1 min-w-0">
              <ProfileTabs />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      <BottomNavigation />
    </div>
  );
};

export default Profile;
