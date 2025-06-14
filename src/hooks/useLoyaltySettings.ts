
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLoyaltySettings, updateLoyaltySettings } from "@/services/loyaltyService";
import { toast } from "@/hooks/use-toast";

export const useLoyaltySettings = () => {
  return useQuery({
    queryKey: ['loyalty-settings'],
    queryFn: getLoyaltySettings,
  });
};

export const useUpdateLoyaltySettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateLoyaltySettings,
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Loyalty point settings have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['loyalty-settings'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update loyalty settings. Please try again.",
        variant: "destructive",
      });
    }
  });
};
