
import { supabase } from "@/integrations/supabase/client";
import { LoyaltySettings, LoyaltyRedemption } from "@/types/loyalty";

export const getLoyaltySettings = async (): Promise<LoyaltySettings | null> => {
  const { data, error } = await supabase
    .from('loyalty_settings')
    .select('*')
    .single();
    
  if (error) {
    console.error('Error fetching loyalty settings:', error);
    return null;
  }
  
  return data;
};

export const updateLoyaltySettings = async (settings: Partial<LoyaltySettings>): Promise<boolean> => {
  const { error } = await supabase
    .from('loyalty_settings')
    .update(settings)
    .eq('id', settings.id);
    
  if (error) {
    console.error('Error updating loyalty settings:', error);
    return false;
  }
  
  return true;
};

export const redeemLoyaltyPoints = async (
  points: number, 
  kshValue: number
): Promise<LoyaltyRedemption | null> => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;
  
  const { data, error } = await supabase
    .from('loyalty_redemptions')
    .insert({
      user_id: user.user.id,
      points_redeemed: points,
      ksh_value: kshValue,
      status: 'pending'
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error redeeming points:', error);
    return null;
  }
  
  return data;
};

export const getUserRedemptions = async (): Promise<LoyaltyRedemption[]> => {
  const { data, error } = await supabase
    .from('loyalty_redemptions')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching redemptions:', error);
    return [];
  }
  
  return data;
};
