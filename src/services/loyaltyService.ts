
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
  
  // Use the database function that handles the full redemption process:
  // 1. Creates/gets wallet
  // 2. Creates wallet transaction
  // 3. Updates wallet balance
  // 4. Deducts points from profile
  // 5. Creates redemption record
  const { data: redemptionId, error } = await supabase.rpc('process_loyalty_redemption', {
    p_user_id: user.user.id,
    p_points: points,
    p_ksh_value: kshValue
  });
    
  if (error) {
    console.error('Error processing loyalty redemption:', error);
    return null;
  }
  
  // Fetch the created redemption record
  const { data: redemption } = await supabase
    .from('loyalty_redemptions')
    .select('*')
    .eq('id', redemptionId)
    .single();
  
  return redemption;
};

export const getUserRedemptions = async (): Promise<LoyaltyRedemption[]> => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return [];
  
  const { data, error } = await supabase
    .from('loyalty_redemptions')
    .select('*')
    .eq('user_id', user.user.id)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching redemptions:', error);
    return [];
  }
  
  return data;
};

export const getAllRedemptions = async (): Promise<LoyaltyRedemption[]> => {
  const { data, error } = await supabase
    .from('loyalty_redemptions')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching all redemptions:', error);
    return [];
  }
  
  return data || [];
};

export interface LoyaltyTransaction {
  id: string;
  user_id: string;
  points: number;
  transaction_type: 'earned' | 'redeemed' | 'expired' | 'adjusted';
  source: string;
  description?: string;
  order_id?: string;
  created_at: string;
}

export const getUserLoyaltyTransactions = async (userId?: string): Promise<LoyaltyTransaction[]> => {
  const { data: user } = await supabase.auth.getUser();
  const targetUserId = userId || user?.user?.id;
  
  if (!targetUserId) return [];
  
  const { data, error } = await supabase
    .from('loyalty_transactions')
    .select('*')
    .eq('user_id', targetUserId)
    .order('created_at', { ascending: false })
    .limit(50);
    
  if (error) {
    console.error('Error fetching loyalty transactions:', error);
    return [];
  }
  
  return data || [];
};

export const getAllLoyaltyTransactions = async (limit = 100): Promise<LoyaltyTransaction[]> => {
  const { data, error } = await supabase
    .from('loyalty_transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
    
  if (error) {
    console.error('Error fetching all loyalty transactions:', error);
    return [];
  }
  
  return data || [];
};

export const adjustUserPoints = async (
  userId: string, 
  points: number, 
  reason: string,
  isDeduction: boolean = false
): Promise<boolean> => {
  try {
    // Get current points
    const { data: profile } = await supabase
      .from('profiles')
      .select('loyalty_points')
      .eq('id', userId)
      .single();
      
    if (!profile) return false;
    
    const currentPoints = profile.loyalty_points || 0;
    const adjustedPoints = isDeduction ? points * -1 : points;
    const newTotal = Math.max(0, currentPoints + adjustedPoints);
    
    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        loyalty_points: newTotal,
        points_last_activity: new Date().toISOString()
      })
      .eq('id', userId);
      
    if (updateError) throw updateError;
    
    // Record transaction
    const { error: txError } = await supabase
      .from('loyalty_transactions')
      .insert({
        user_id: userId,
        points: Math.abs(adjustedPoints),
        transaction_type: isDeduction ? 'redeemed' : 'earned',
        source: 'admin_adjustment',
        description: reason
      });
      
    if (txError) throw txError;
    
    return true;
  } catch (error) {
    console.error('Error adjusting user points:', error);
    return false;
  }
};

export interface LoyaltyStats {
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  totalRedemptionValue: number;
  activeUsers: number;
  avgPointsPerUser: number;
}

export const getLoyaltyStats = async (): Promise<LoyaltyStats> => {
  try {
    // Get total points across all users
    const { data: profiles } = await supabase
      .from('profiles')
      .select('loyalty_points');
      
    const totalPoints = profiles?.reduce((sum, p) => sum + (p.loyalty_points || 0), 0) || 0;
    const activeUsers = profiles?.filter(p => (p.loyalty_points || 0) > 0).length || 0;
    const avgPoints = activeUsers > 0 ? Math.round(totalPoints / activeUsers) : 0;
    
    // Get redemption stats
    const { data: redemptions } = await supabase
      .from('loyalty_redemptions')
      .select('points_redeemed, ksh_value, status')
      .eq('status', 'completed');
      
    const totalRedeemed = redemptions?.reduce((sum, r) => sum + r.points_redeemed, 0) || 0;
    const totalValue = redemptions?.reduce((sum, r) => sum + r.ksh_value, 0) || 0;
    
    // Get total points ever earned from transactions
    const { data: earnedTx } = await supabase
      .from('loyalty_transactions')
      .select('points')
      .eq('transaction_type', 'earned');
      
    const totalIssued = earnedTx?.reduce((sum, t) => sum + t.points, 0) || 0;
    
    return {
      totalPointsIssued: totalIssued,
      totalPointsRedeemed: totalRedeemed,
      totalRedemptionValue: totalValue,
      activeUsers,
      avgPointsPerUser: avgPoints
    };
  } catch (error) {
    console.error('Error fetching loyalty stats:', error);
    return {
      totalPointsIssued: 0,
      totalPointsRedeemed: 0,
      totalRedemptionValue: 0,
      activeUsers: 0,
      avgPointsPerUser: 0
    };
  }
};
