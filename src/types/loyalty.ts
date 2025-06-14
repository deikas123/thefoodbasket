
export interface LoyaltySettings {
  id: string;
  points_per_ksh: number;
  ksh_per_point: number;
  min_redemption_points: number;
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
