
export type LoyaltyTier = 'bronze' | 'silver' | 'gold';

export interface LoyaltySettings {
  id: string;
  points_per_ksh: number;
  ksh_per_point: number;
  min_redemption_points: number;
  bronze_threshold: number;
  silver_threshold: number;
  gold_threshold: number;
  bronze_multiplier: number;
  silver_multiplier: number;
  gold_multiplier: number;
  points_expiration_days: number;
  referral_signup_bonus: number;
  referral_purchase_bonus: number;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyRedemption {
  id: string;
  user_id: string;
  points_redeemed: number;
  ksh_value: number;
  order_id?: string;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export const getTierFromPoints = (points: number, settings: LoyaltySettings | null): LoyaltyTier => {
  if (!settings) return 'bronze';
  if (points >= settings.gold_threshold) return 'gold';
  if (points >= settings.silver_threshold) return 'silver';
  return 'bronze';
};

export const getTierMultiplier = (tier: LoyaltyTier, settings: LoyaltySettings | null): number => {
  if (!settings) return 1;
  switch (tier) {
    case 'gold': return settings.gold_multiplier;
    case 'silver': return settings.silver_multiplier;
    default: return settings.bronze_multiplier;
  }
};
