
import { supabase } from "@/integrations/supabase/client";
import { LoyaltySettings, getTierFromPoints, getTierMultiplier } from "@/types/loyalty";

export const awardLoyaltyPoints = async (userId: string, orderTotal: number): Promise<boolean> => {
  try {
    // Get loyalty settings with tier info
    const { data: settings, error: settingsError } = await supabase
      .from('loyalty_settings')
      .select('*')
      .single();

    if (settingsError) {
      console.error('Error fetching loyalty settings:', settingsError);
      return false;
    }

    // Get user's current points to determine tier
    const { data: profile } = await supabase
      .from('profiles')
      .select('loyalty_points')
      .eq('id', userId)
      .single();

    const currentPoints = profile?.loyalty_points || 0;
    const tier = getTierFromPoints(currentPoints, settings as LoyaltySettings);
    const multiplier = getTierMultiplier(tier, settings as LoyaltySettings);

    const pointsPerKsh = settings?.points_per_ksh || 1;
    const basePoints = Math.floor(orderTotal * pointsPerKsh);
    const pointsEarned = Math.floor(basePoints * multiplier);

    console.log(`Awarding ${pointsEarned} points (${basePoints} base × ${multiplier} ${tier} multiplier) for order total of ${orderTotal} KSH`);

    const newTotal = currentPoints + pointsEarned;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ loyalty_points: newTotal })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating loyalty points:', updateError);
      return false;
    }

    console.log(`Successfully awarded ${pointsEarned} loyalty points to user ${userId}`);
    return true;
  } catch (error) {
    console.error('Error in awardLoyaltyPoints:', error);
    return false;
  }
};

export const deductLoyaltyPoints = async (userId: string, pointsToDeduct: number): Promise<boolean> => {
  try {
    // Get current points
    const { data: profile } = await supabase
      .from('profiles')
      .select('loyalty_points')
      .eq('id', userId)
      .single();

    if (!profile) {
      console.error('User profile not found');
      return false;
    }

    const currentPoints = profile.loyalty_points || 0;
    if (currentPoints < pointsToDeduct) {
      console.error('Insufficient loyalty points');
      return false;
    }

    const newTotal = currentPoints - pointsToDeduct;

    const { error } = await supabase
      .from('profiles')
      .update({ loyalty_points: newTotal })
      .eq('id', userId);

    if (error) {
      console.error('Error deducting loyalty points:', error);
      return false;
    }

    console.log(`Successfully deducted ${pointsToDeduct} loyalty points from user ${userId}`);
    return true;
  } catch (error) {
    console.error('Error in deductLoyaltyPoints:', error);
    return false;
  }
};
