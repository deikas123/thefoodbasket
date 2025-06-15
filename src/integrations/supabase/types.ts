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
          custom_days: string[] | null
          custom_time: string | null
          frequency_days: number
          id: string
          last_order_date: string | null
          next_order_date: string
          product_id: string
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          custom_days?: string[] | null
          custom_time?: string | null
          frequency_days?: number
          id?: string
          last_order_date?: string | null
          next_order_date: string
          product_id: string
          quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          custom_days?: string[] | null
          custom_time?: string | null
          frequency_days?: number
          id?: string
          last_order_date?: string | null
          next_order_date?: string
          product_id?: string
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      auto_replenish_orders: {
        Row: {
          auto_replenish_item_id: string
          created_at: string
          error_message: string | null
          id: string
          order_id: string | null
          scheduled_date: string
          status: string
          updated_at: string
        }
        Insert: {
          auto_replenish_item_id: string
          created_at?: string
          error_message?: string | null
          id?: string
          order_id?: string | null
          scheduled_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          auto_replenish_item_id?: string
          created_at?: string
          error_message?: string | null
          id?: string
          order_id?: string | null
          scheduled_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "auto_replenish_orders_auto_replenish_item_id_fkey"
            columns: ["auto_replenish_item_id"]
            isOneToOne: false
            referencedRelation: "auto_replenish_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auto_replenish_orders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      banners: {
        Row: {
          active: boolean
          created_at: string
          end_date: string
          id: string
          image: string
          link: string | null
          priority: number
          start_date: string
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          end_date: string
          id?: string
          image: string
          link?: string | null
          priority?: number
          start_date: string
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          end_date?: string
          id?: string
          image?: string
          link?: string | null
          priority?: number
          start_date?: string
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image: string | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          chat_id: string
          created_at: string
          id: string
          message: string
          sender_id: string
          sender_type: string
        }
        Insert: {
          chat_id: string
          created_at?: string
          id?: string
          message: string
          sender_id: string
          sender_type: string
        }
        Update: {
          chat_id?: string
          created_at?: string
          id?: string
          message?: string
          sender_id?: string
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "customer_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_chats: {
        Row: {
          created_at: string
          customer_id: string
          customer_service_id: string | null
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          customer_service_id?: string | null
          id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          customer_service_id?: string | null
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer_notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          order_id: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          order_id: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          order_id?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_offers: {
        Row: {
          active: boolean
          created_at: string
          discount_percentage: number
          end_date: string
          id: string
          product_id: string | null
          start_date: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          discount_percentage: number
          end_date: string
          id?: string
          product_id?: string | null
          start_date: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          discount_percentage?: number
          end_date?: string
          id?: string
          product_id?: string | null
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_offers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_options: {
        Row: {
          active: boolean
          base_price: number
          created_at: string
          description: string | null
          estimated_delivery_days: number
          id: string
          is_express: boolean
          name: string
          price_per_km: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          base_price?: number
          created_at?: string
          description?: string | null
          estimated_delivery_days?: number
          id?: string
          is_express?: boolean
          name: string
          price_per_km?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          base_price?: number
          created_at?: string
          description?: string | null
          estimated_delivery_days?: number
          id?: string
          is_express?: boolean
          name?: string
          price_per_km?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      delivery_zones: {
        Row: {
          active: boolean
          base_fee: number
          created_at: string
          id: string
          max_delivery_time: number
          min_delivery_time: number
          name: string
          per_km_fee: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          base_fee: number
          created_at?: string
          id?: string
          max_delivery_time: number
          min_delivery_time: number
          name: string
          per_km_fee: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          base_fee?: number
          created_at?: string
          id?: string
          max_delivery_time?: number
          min_delivery_time?: number
          name?: string
          per_km_fee?: number
          updated_at?: string
        }
        Relationships: []
      }
      discount_codes: {
        Row: {
          active: boolean
          code: string
          created_at: string
          description: string | null
          end_date: string
          id: string
          max_discount: number | null
          min_purchase: number | null
          start_date: string
          type: string
          updated_at: string
          usage_count: number
          usage_limit: number | null
          value: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          max_discount?: number | null
          min_purchase?: number | null
          start_date: string
          type: string
          updated_at?: string
          usage_count?: number
          usage_limit?: number | null
          value: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          max_discount?: number | null
          min_purchase?: number | null
          start_date?: string
          type?: string
          updated_at?: string
          usage_count?: number
          usage_limit?: number | null
          value?: number
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
      loyalty_redemptions: {
        Row: {
          created_at: string
          id: string
          ksh_value: number
          order_id: string | null
          points_redeemed: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ksh_value: number
          order_id?: string | null
          points_redeemed: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ksh_value?: number
          order_id?: string | null
          points_redeemed?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      loyalty_settings: {
        Row: {
          created_at: string
          id: string
          ksh_per_point: number
          min_redemption_points: number
          points_per_ksh: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          ksh_per_point?: number
          min_redemption_points?: number
          points_per_ksh?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          ksh_per_point?: number
          min_redemption_points?: number
          points_per_ksh?: number
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          image: string | null
          link: string | null
          scheduled_for: string | null
          sent_at: string | null
          status: string
          target_user_ids: string[] | null
          target_user_role: string | null
          title: string
          trigger: Json | null
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          image?: string | null
          link?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status: string
          target_user_ids?: string[] | null
          target_user_role?: string | null
          title: string
          trigger?: Json | null
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          image?: string | null
          link?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          target_user_ids?: string[] | null
          target_user_role?: string | null
          title?: string
          trigger?: Json | null
        }
        Relationships: []
      }
      order_tracking_events: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          id: string
          location: string | null
          order_id: string
          status: string
          timestamp: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          location?: string | null
          order_id: string
          status: string
          timestamp?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          location?: string | null
          order_id?: string
          status?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_tracking_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
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
      product_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          product_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          product_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          product_id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          product_id: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          product_id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_tag_relations: {
        Row: {
          created_at: string
          product_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          product_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          product_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_tag_relations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_tag_relations_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "product_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      product_tags: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category_id: string
          created_at: string
          description: string
          discount_percentage: number | null
          featured: boolean
          id: string
          image: string
          name: string
          num_reviews: number
          price: number
          rating: number
          stock: number
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description: string
          discount_percentage?: number | null
          featured?: boolean
          id?: string
          image: string
          name: string
          num_reviews?: number
          price: number
          rating?: number
          stock?: number
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string
          discount_percentage?: number | null
          featured?: boolean
          id?: string
          image?: string
          name?: string
          num_reviews?: number
          price?: number
          rating?: number
          stock?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_product_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
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
      website_sections: {
        Row: {
          active: boolean
          content: string | null
          id: string
          image: string | null
          name: string
          position: number
          settings: Json | null
          subtitle: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          content?: string | null
          id?: string
          image?: string | null
          name: string
          position?: number
          settings?: Json | null
          subtitle?: string | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          content?: string | null
          id?: string
          image?: string | null
          name?: string
          position?: number
          settings?: Json | null
          subtitle?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_delivery_settings: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      process_auto_replenish_orders: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      upsert_delivery_settings: {
        Args: { settings_data: Json }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
