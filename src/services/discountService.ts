
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface DiscountCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_purchase: number | null;
  max_discount: number | null;
  usage_limit: number | null;
  usage_count: number;
  start_date: string;
  end_date: string;
  active: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface DiscountCodeFormData {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_purchase?: number | null;
  max_discount?: number | null;
  usage_limit?: number | null;
  start_date: string;
  end_date: string;
  active?: boolean;
  description?: string | null;
}

// Get all discount codes
export const getDiscountCodes = async (): Promise<DiscountCode[]> => {
  try {
    const { data, error } = await supabase
      .from('discount_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching discount codes:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error in getDiscountCodes:", error);
    return [];
  }
};

// Create a new discount code
export const createDiscountCode = async (codeData: DiscountCodeFormData): Promise<DiscountCode | null> => {
  try {
    // Check if code already exists
    const { data: existing } = await supabase
      .from('discount_codes')
      .select('code')
      .eq('code', codeData.code)
      .single();

    if (existing) {
      toast({
        title: "Error",
        description: "A discount code with this code already exists",
        variant: "destructive",
      });
      return null;
    }

    const { data, error } = await supabase
      .from('discount_codes')
      .insert([{
        ...codeData,
        usage_count: 0,
        active: codeData.active ?? true
      }])
      .select()
      .single();

    if (error) {
      console.error("Error creating discount code:", error);
      toast({
        title: "Error",
        description: "Failed to create discount code. " + error.message,
        variant: "destructive",
      });
      return null;
    }

    toast({
      title: "Success",
      description: "Discount code created successfully!",
    });

    return data;
  } catch (error) {
    console.error("Error in createDiscountCode:", error);
    return null;
  }
};

// Update an existing discount code
export const updateDiscountCode = async (
  id: string,
  codeData: Partial<DiscountCodeFormData>
): Promise<DiscountCode | null> => {
  try {
    // If code is being updated, check if it would create a duplicate
    if (codeData.code) {
      const { data: existing } = await supabase
        .from('discount_codes')
        .select('id, code')
        .eq('code', codeData.code)
        .neq('id', id)
        .single();

      if (existing) {
        toast({
          title: "Error",
          description: "Another discount code with this code already exists",
          variant: "destructive",
        });
        return null;
      }
    }

    const { data, error } = await supabase
      .from('discount_codes')
      .update(codeData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating discount code:", error);
      toast({
        title: "Error",
        description: "Failed to update discount code. " + error.message,
        variant: "destructive",
      });
      return null;
    }

    toast({
      title: "Success",
      description: "Discount code updated successfully!",
    });

    return data;
  } catch (error) {
    console.error("Error in updateDiscountCode:", error);
    return null;
  }
};

// Delete a discount code
export const deleteDiscountCode = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('discount_codes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting discount code:", error);
      toast({
        title: "Error",
        description: "Failed to delete discount code. " + error.message,
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Success",
      description: "Discount code deleted successfully!",
    });

    return true;
  } catch (error) {
    console.error("Error in deleteDiscountCode:", error);
    return false;
  }
};

// Validate a discount code for a given purchase amount
export const validateDiscountCode = async (
  code: string,
  purchaseAmount: number
): Promise<{
  valid: boolean;
  discountAmount?: number;
  message?: string;
  discountCode?: DiscountCode;
}> => {
  try {
    const { data, error } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', code)
      .eq('active', true)
      .single();

    if (error || !data) {
      return {
        valid: false,
        message: "Invalid discount code"
      };
    }

    const discountCode = data as DiscountCode;
    const now = new Date();
    const startDate = new Date(discountCode.start_date);
    const endDate = new Date(discountCode.end_date);

    // Check if code is valid
    if (now < startDate || now > endDate) {
      return {
        valid: false,
        message: "This code has expired or is not yet active",
        discountCode
      };
    }

    // Check usage limit
    if (discountCode.usage_limit !== null && discountCode.usage_count >= discountCode.usage_limit) {
      return {
        valid: false,
        message: "This code has reached its usage limit",
        discountCode
      };
    }

    // Check minimum purchase
    if (discountCode.min_purchase !== null && purchaseAmount < discountCode.min_purchase) {
      return {
        valid: false,
        message: `This code requires a minimum purchase of ${discountCode.min_purchase}`,
        discountCode
      };
    }

    // Calculate discount amount
    let discountAmount: number;
    if (discountCode.type === 'percentage') {
      discountAmount = (purchaseAmount * discountCode.value) / 100;
    } else {
      discountAmount = discountCode.value;
    }

    // Apply max discount if set
    if (discountCode.max_discount !== null && discountAmount > discountCode.max_discount) {
      discountAmount = discountCode.max_discount;
    }

    return {
      valid: true,
      discountAmount,
      discountCode
    };
  } catch (error) {
    console.error("Error validating discount code:", error);
    return {
      valid: false,
      message: "Error validating discount code"
    };
  }
};

// Apply a discount code (increment usage count)
export const applyDiscountCode = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc('increment_discount_code_usage', {
      code_id: id
    });

    if (error) {
      console.error("Error applying discount code:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in applyDiscountCode:", error);
    return false;
  }
};
