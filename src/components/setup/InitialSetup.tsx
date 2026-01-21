
import { useEffect, useState } from 'react';
import { seedProducts, checkAndAssignRoleIfFirstUser } from '@/services/seedService';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const InitialSetup = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [didSeed, setDidSeed] = useState(false);
  const location = useLocation();

  // Skip setup on login and register pages
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  // Get user directly from Supabase to avoid AuthContext dependency
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Don't run setup if we're on auth pages or if user isn't logged in
    if (isAuthPage || !user) return;
    
    const setup = async () => {
      // Only start loading once we have a user and we're not on an auth page
      setIsLoading(true);
      
      try {
        // Seed products if needed
        const seeded = await seedProducts();
        if (seeded) {
          setDidSeed(true);
        }
        
        // Check if this user should be an admin (if they're among first users)
        await checkAndAssignRoleIfFirstUser(user.id);
      } catch (error) {
        console.error("Setup error:", error);
        toast({
          title: "Setup Error",
          description: "There was a problem setting up initial data.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    setup();
  }, [user, isAuthPage]);
  
  // Don't render anything if we're on auth pages or no user is logged in
  if (isAuthPage || !user) {
    return null;
  }
  
  if (isLoading) {
    return (
      <div className="fixed bottom-10 right-10 p-4 bg-primary/10 rounded-lg shadow-lg z-50 max-w-xs flex items-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Setting up your store...</span>
      </div>
    );
  }
  
  if (didSeed) {
    return (
      <Alert className="fixed bottom-10 right-10 max-w-xs z-50">
        <AlertTitle>Store Setup Complete</AlertTitle>
        <AlertDescription>
          Your store has been set up with sample products.
        </AlertDescription>
      </Alert>
    );
  }
  
  return null;
};

export default InitialSetup;
