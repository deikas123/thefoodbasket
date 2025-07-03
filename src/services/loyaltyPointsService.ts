
import { supabase } from "@/integrations/supabase/client";

export const awardLoyaltyPoints = async (userId: string, orderTotal: number): Promise<boolean> => {
  try {
    // Get loyalty settings to determine points per KSH
    const { data: settings, error: settingsError } = await supabase
      .from('loyalty_settings')
      .select('points_per_ksh')
      .single();

    if (settingsError) {
      console.error('Error fetching loyalty settings:', settingsError);
      return false;
    }

    const pointsPerKsh = settings?.points_per_ksh || 1;
    const pointsEarned = Math.floor(orderTotal * pointsPerKsh);

    console.log(`Awarding ${pointsEarned} points for order total of ${orderTotal} KSH`);

    // Update user's loyalty points
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        loyalty_points: supabase.rpc('increment_loyalty_points', { 
          user_id: userId, 
          points_to_add: pointsEarned 
        })
      })
      .eq('id', userId);

    if (updateError) {
      // Fallback: fetch current points and update
      const { data: profile } = await supabase
        .from('profiles')
        .select('loyalty_points')
        .eq('id', userId)
        .single();

      const currentPoints = profile?.loyalty_points || 0;
      const newTotal = currentPoints + pointsEarned;

      const { error: fallbackError } = await supabase
        .from('profiles')
        .update({ loyalty_points: newTotal })
        .eq('id', userId);

      if (fallbackError) {
        console.error('Error updating loyalty points:', fallbackError);
        return false;
      }
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
