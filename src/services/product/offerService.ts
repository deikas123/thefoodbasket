
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface DailyOffer {
  id: string;
  product_id: string;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  product?: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
}

export interface OfferFormData {
  product_id: string;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  active: boolean;
}

// Get all daily offers with product information
export const getDailyOffers = async (): Promise<DailyOffer[]> => {
  try {
    const { data, error } = await supabase
      .from('daily_offers')
      .select(`
        *,
        product:product_id (
          id,
          name,
          price,
          image
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching daily offers:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error in getDailyOffers:", error);
    return [];
  }
};

// Create a new daily offer
export const createDailyOffer = async (offerData: OfferFormData): Promise<DailyOffer | null> => {
  try {
    const { data, error } = await supabase
      .from('daily_offers')
      .insert([offerData])
      .select(`
        *,
        product:product_id (
          id,
          name,
          price,
          image
        )
      `)
      .single();

    if (error) {
      console.error("Error creating daily offer:", error);
      toast({
        title: "Error",
        description: "Failed to create daily offer. " + error.message,
        variant: "destructive",
      });
      return null;
    }

    toast({
      title: "Success",
      description: "Daily offer created successfully!",
    });

    return data;
  } catch (error) {
    console.error("Error in createDailyOffer:", error);
    return null;
  }
};

// Update an existing daily offer
export const updateDailyOffer = async (
  id: string,
  offerData: Partial<OfferFormData>
): Promise<DailyOffer | null> => {
  try {
    const { data, error } = await supabase
      .from('daily_offers')
      .update(offerData)
      .eq('id', id)
      .select(`
        *,
        product:product_id (
          id,
          name,
          price,
          image
        )
      `)
      .single();

    if (error) {
      console.error("Error updating daily offer:", error);
      toast({
        title: "Error",
        description: "Failed to update daily offer. " + error.message,
        variant: "destructive",
      });
      return null;
    }

    toast({
      title: "Success",
      description: "Daily offer updated successfully!",
    });

    return data;
  } catch (error) {
    console.error("Error in updateDailyOffer:", error);
    return null;
  }
};

// Delete a daily offer
export const deleteDailyOffer = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('daily_offers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting daily offer:", error);
      toast({
        title: "Error",
        description: "Failed to delete daily offer. " + error.message,
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Success",
      description: "Daily offer deleted successfully!",
    });

    return true;
  } catch (error) {
    console.error("Error in deleteDailyOffer:", error);
    return false;
  }
};
