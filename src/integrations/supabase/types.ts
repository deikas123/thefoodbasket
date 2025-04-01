export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          created_at: string
          id: string
          is_default: boolean
          state: string
          street: string
          user_id: string
          zip_code: string
        }
        Insert: {
          city: string
          created_at?: string
          id?: string
          is_default?: boolean
          state: string
          street: string
          user_id: string
          zip_code: string
        }
        Update: {
          city?: string
          created_at?: string
          id?: string
          is_default?: boolean
          state?: string
          street?: string
          user_id?: string
          zip_code?: string
        }
        Relationships: []
      }
      auto_replenish_items: {
        Row: {
          active: boolean
          created_at: string
          frequency_days: number
          id: string
          next_order_date: string
          product_id: string
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          frequency_days?: number
          id?: string
          next_order_date: string
          product_id: string
          quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          frequency_days?: number
          id?: string
          next_order_date?: string
          product_id?: string
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      food_basket_items: {
        Row: {
          basket_id: string
          created_at: string
          id: string
          product_id: string
          quantity: number
        }
        Insert: {
          basket_id: string
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
        }
        Update: {
          basket_id?: string
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "food_basket_items_basket_id_fkey"
            columns: ["basket_id"]
            isOneToOne: false
            referencedRelation: "food_baskets"
            referencedColumns: ["id"]
          },
        ]
      }
      food_baskets: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image: string | null
          name: string
          recipe: string
          total_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          name: string
          recipe: string
          total_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          name?: string
          recipe?: string
          total_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      kyc_verifications: {
        Row: {
          address_proof_url: string | null
          admin_notes: string | null
          created_at: string
          id: string
          id_document_url: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address_proof_url?: string | null
          admin_notes?: string | null
          created_at?: string
          id?: string
          id_document_url?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address_proof_url?: string | null
          admin_notes?: string | null
          created_at?: string
          id?: string
          id_document_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          delivery_address: Json
          delivery_fee: number
          delivery_method: Json
          discount: number | null
          estimated_delivery: string
          id: string
          items: Json
          loyalty_points_earned: number | null
          loyalty_points_used: number | null
          notes: string | null
          payment_method: Json
          promo_code: string | null
          scheduled_delivery: Json | null
          status: string
          subtotal: number
          total: number
          tracking: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_address: Json
          delivery_fee: number
          delivery_method: Json
          discount?: number | null
          estimated_delivery: string
          id?: string
          items: Json
          loyalty_points_earned?: number | null
          loyalty_points_used?: number | null
          notes?: string | null
          payment_method: Json
          promo_code?: string | null
          scheduled_delivery?: Json | null
          status: string
          subtotal: number
          total: number
          tracking?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_address?: Json
          delivery_fee?: number
          delivery_method?: Json
          discount?: number | null
          estimated_delivery?: string
          id?: string
          items?: Json
          loyalty_points_earned?: number | null
          loyalty_points_used?: number | null
          notes?: string | null
          payment_method?: Json
          promo_code?: string | null
          scheduled_delivery?: Json | null
          status?: string
          subtotal?: number
          total?: number
          tracking?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pay_later_orders: {
        Row: {
          created_at: string
          due_date: string
          id: string
          order_id: string
          paid_amount: number
          status: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          due_date: string
          id?: string
          order_id: string
          paid_amount?: number
          status?: string
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          due_date?: string
          id?: string
          order_id?: string
          paid_amount?: number
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pay_later_orders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          dietary_preferences: string[] | null
          first_name: string | null
          id: string
          last_name: string | null
          loyalty_points: number
          phone: string | null
        }
        Insert: {
          created_at?: string
          dietary_preferences?: string[] | null
          first_name?: string | null
          id: string
          last_name?: string | null
          loyalty_points?: number
          phone?: string | null
        }
        Update: {
          created_at?: string
          dietary_preferences?: string[] | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          loyalty_points?: number
          phone?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: number
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: never
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: never
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          transaction_type: string
          wallet_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          transaction_type: string
          wallet_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          transaction_type?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
