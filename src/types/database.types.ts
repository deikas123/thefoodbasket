
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string;
          created_at: string;
          id: string;
          is_default: boolean;
          state: string;
          street: string;
          user_id: string;
          zip_code: string;
        };
      };
      orders: {
        Row: {
          created_at: string;
          delivery_address: Json;
          delivery_fee: number;
          delivery_method: Json;
          discount: number | null;
          estimated_delivery: string;
          id: string;
          items: Json;
          loyalty_points_earned: number | null;
          loyalty_points_used: number | null;
          notes: string | null;
          payment_method: Json;
          promo_code: string | null;
          scheduled_delivery: Json | null;
          status: string;
          subtotal: number;
          total: number;
          tracking: Json | null;
          updated_at: string;
          user_id: string;
        };
      };
      profiles: {
        Row: {
          phone: string | null;
          last_name: string | null;
          created_at: string;
          loyalty_points: number;
          id: string;
          first_name: string | null;
          dietary_preferences: string[] | null;
        };
      };
      user_roles: {
        Row: {
          created_at: string;
          user_id: string;
          id: number;
          role: string;
        };
      };
      wallets: {
        Row: {
          balance: number;
          user_id: string;
          updated_at: string;
          id: string;
          created_at: string;
        };
      };
      wallet_transactions: {
        Row: {
          created_at: string;
          amount: number;
          wallet_id: string;
          id: string;
          description: string | null;
          transaction_type: string;
        };
      };
      kyc_verifications: {
        Row: {
          id: string;
          user_id: string;
          id_document_url: string | null;
          address_proof_url: string | null;
          status: string;
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      pay_later_orders: {
        Row: {
          due_date: string;
          id: string;
          order_id: string;
          user_id: string;
          total_amount: number;
          paid_amount: number;
          created_at: string;
          updated_at: string;
          status: string;
        };
      };
      food_baskets: {
        Row: {
          updated_at: string;
          image: string | null;
          recipe: string;
          description: string | null;
          name: string;
          id: string;
          total_price: number;
          created_at: string;
        };
      };
      food_basket_items: {
        Row: {
          quantity: number;
          product_id: string;
          created_at: string;
          id: string;
          basket_id: string;
        };
      };
      auto_replenish_items: {
        Row: {
          next_order_date: string;
          frequency_days: number;
          quantity: number;
          user_id: string;
          id: string;
          product_id: string;
          updated_at: string;
          created_at: string;
          active: boolean;
        };
      };
    };
  };
}
