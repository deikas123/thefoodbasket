
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Repeat } from "lucide-react";
import AddToAutoReplenishModal from "./AddToAutoReplenishModal";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

interface AddToAutoReplenishButtonProps {
  productId: string;
  productName: string;
}

const AddToAutoReplenishButton = ({ 
  productId, 
  productName 
}: AddToAutoReplenishButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleClick = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to use the Auto Replenish feature",
        variant: "destructive",
      });
      navigate("/login", { state: { from: `/product/${productId}` } });
      return;
    }
    
    setIsModalOpen(true);
  };

  return (
    <>
      <Button 
        variant="outline" 
        className="gap-2"
        onClick={handleClick}
      >
        <Repeat className="h-4 w-4" />
        Auto Replenish
      </Button>
      
      <AddToAutoReplenishModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productId={productId}
        productName={productName}
      />
    </>
  );
};

export default AddToAutoReplenishButton;
