
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Repeat } from "lucide-react";
import { AutoReplenishDialog } from "./AutoReplenishDialog";

interface AutoReplenishButtonProps {
  productId: string;
  productName: string;
}

const AutoReplenishButton = ({ productId, productName }: AutoReplenishButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setOpen(true)}
        className="flex-1"
      >
        <Repeat className="h-4 w-4 mr-2" />
        Auto-Replenish
      </Button>
      
      <AutoReplenishDialog
        open={open}
        onOpenChange={setOpen}
        productId={productId}
        productName={productName}
      />
    </>
  );
};

export default AutoReplenishButton;
