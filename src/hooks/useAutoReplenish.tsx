
import { useState } from "react";
import { toast } from "sonner";
import { addToAutoReplenish } from "@/services/autoReplenishService";

interface AddToAutoReplenishProps {
  productId: string;
  quantity: number;
  frequencyDays: number;
}

export const useAutoReplenish = () => {
  const [isLoading, setIsLoading] = useState(false);

  const addItem = async (props: AddToAutoReplenishProps) => {
    setIsLoading(true);
    try {
      await addToAutoReplenish(
        props.productId,
        props.quantity,
        props.frequencyDays
      );
      toast("Auto-replenishment set up successfully");
      return true;
    } catch (error) {
      console.error("Error adding to auto-replenish:", error);
      toast("Could not set up auto-replenishment. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addItem,
    isLoading
  };
};
