
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Truck, Package, CheckCircle, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const DeliveryLayout: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col bg-white border-r border-gray-200">
        <div className="flex items-center h-16 px-6 border-b">
          <Truck className="h-6 w-6 text-primary mr-2" />
          <span className="text-lg font-semibold">Delivery App</span>
        </div>
        
        <div className="flex flex-col flex-1 p-4">
          <nav className="space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => navigate('/delivery')}
            >
              <Package className="mr-2 h-5 w-5" />
              Dashboard
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => navigate('/delivery/history')}
            >
              <CheckCircle className="mr-2 h-5 w-5" />
              Delivery History
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => navigate('/delivery/profile')}
            >
              <User className="mr-2 h-5 w-5" />
              My Profile
            </Button>
          </nav>
        </div>
        
        <div className="p-4 border-t">
          <div className="px-2 pb-2">
            <div className="flex items-center">
              <div className="rounded-full h-8 w-8 bg-primary/10 text-primary flex items-center justify-center">
                {user.email?.[0].toUpperCase() || 'U'}
              </div>
              <div className="ml-2 overflow-hidden">
                <p className="text-sm font-medium truncate">{user.email}</p>
                <p className="text-xs text-muted-foreground">Delivery Driver</p>
              </div>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full mt-2"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b z-10 flex items-center justify-between px-4">
        <div className="flex items-center">
          <Truck className="h-5 w-5 text-primary mr-2" />
          <span className="text-lg font-semibold">Delivery App</span>
        </div>
        {/* Mobile menu button could go here */}
      </div>
      
      {/* Main content */}
      <div className="flex-1 md:p-6 p-4 md:pt-6 pt-16">
        <Outlet />
      </div>
    </div>
  );
};

export default DeliveryLayout;
