
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Repeat } from "lucide-react";
import AddToAutoReplenishModal from "./AddToAutoReplenishModal";

interface AddToAutoReplenishButtonProps {
  productId: string;
  productName: string;
}

const AddToAutoReplenishButton: React.FC<AddToAutoReplenishButtonProps> = ({ 
  productId, 
  productName 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button 
        variant="outline" 
        className="gap-2"
        onClick={() => setIsModalOpen(true)}
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
