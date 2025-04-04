
import { useEffect, useState } from 'react';
import { seedProducts, checkAndAssignRoleIfFirstUser } from '@/services/seedService';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

const InitialSetup = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [didSeed, setDidSeed] = useState(false);

  useEffect(() => {
    const setup = async () => {
      if (!user) return;
      
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
  }, [user]);
  
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
          {user?.role === 'admin' && " You have admin privileges."}
        </AlertDescription>
      </Alert>
    );
  }
  
  return null;
};

export default InitialSetup;
