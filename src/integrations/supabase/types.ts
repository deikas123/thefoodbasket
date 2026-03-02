export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          created_at: string
          formatted_address: string | null
          id: string
          is_default: boolean
          latitude: number | null
          longitude: number | null
          plus_code: string | null
          state: string
          street: string
          user_id: string
          zip_code: string
        }
        Insert: {
          city: string
          created_at?: string
          formatted_address?: string | null
          id?: string
          is_default?: boolean
          latitude?: number | null
          longitude?: number | null
          plus_code?: string | null
          state: string
          street: string
          user_id: string
          zip_code: string
        }
        Update: {
          city?: string
          created_at?: string
          formatted_address?: string | null
          id?: string
          is_default?: boolean
          latitude?: number | null
          longitude?: number | null
          plus_code?: string | null
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
          pause_until: string | null
          preferred_delivery_option: string | null
          preferred_payment_method: string | null
          product_id: string
          quantity: number
          reminder_before_days: number | null
          reminder_sent: boolean | null
          total_amount_spent: number | null
          total_orders_created: number | null
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
          pause_until?: string | null
          preferred_delivery_option?: string | null
          preferred_payment_method?: string | null
          product_id: string
          quantity?: number
          reminder_before_days?: number | null
          reminder_sent?: boolean | null
          total_amount_spent?: number | null
          total_orders_created?: number | null
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
          pause_until?: string | null
          preferred_delivery_option?: string | null
          preferred_payment_method?: string | null
          product_id?: string
          quantity?: number
          reminder_before_days?: number | null
          reminder_sent?: boolean | null
          total_amount_spent?: number | null
          total_orders_created?: number | null
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
          store_id: string | null
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
          store_id?: string | null
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
          store_id?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "banners_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      batch_assignments: {
        Row: {
          actual_cost: number | null
          actual_delivery_time: string | null
          actual_distance_km: number | null
          actual_pickup_time: string | null
          assigned_at: string | null
          batch_id: string | null
          id: string
          notes: string | null
          rider_id: string
          rider_name: string | null
          status: string | null
        }
        Insert: {
          actual_cost?: number | null
          actual_delivery_time?: string | null
          actual_distance_km?: number | null
          actual_pickup_time?: string | null
          assigned_at?: string | null
          batch_id?: string | null
          id?: string
          notes?: string | null
          rider_id: string
          rider_name?: string | null
          status?: string | null
        }
        Update: {
          actual_cost?: number | null
          actual_delivery_time?: string | null
          actual_distance_km?: number | null
          actual_pickup_time?: string | null
          assigned_at?: string | null
          batch_id?: string | null
          id?: string
          notes?: string | null
          rider_id?: string
          rider_name?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "batch_assignments_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "delivery_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      bnpl_installments: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          id: string
          installment_number: number
          paid_at: string | null
          payment_method: string | null
          status: string | null
          transaction_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date: string
          id?: string
          installment_number: number
          paid_at?: string | null
          payment_method?: string | null
          status?: string | null
          transaction_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          id?: string
          installment_number?: number
          paid_at?: string | null
          payment_method?: string | null
          status?: string | null
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bnpl_installments_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "bnpl_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      bnpl_transactions: {
        Row: {
          created_at: string
          due_date: string
          id: string
          installment_amount: number
          installments: number | null
          interest_rate: number | null
          next_payment_date: string
          order_id: string | null
          paid_amount: number | null
          principal_amount: number
          status: string | null
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          due_date: string
          id?: string
          installment_amount: number
          installments?: number | null
          interest_rate?: number | null
          next_payment_date: string
          order_id?: string | null
          paid_amount?: number | null
          principal_amount: number
          status?: string | null
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          due_date?: string
          id?: string
          installment_amount?: number
          installments?: number | null
          interest_rate?: number | null
          next_payment_date?: string
          order_id?: string | null
          paid_amount?: number | null
          principal_amount?: number
          status?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bnpl_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      bundle_items: {
        Row: {
          bundle_id: string
          created_at: string
          id: string
          product_id: string
          quantity: number
        }
        Insert: {
          bundle_id: string
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
        }
        Update: {
          bundle_id?: string
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "bundle_items_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "product_bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bundle_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image: string | null
          name: string
          parent_id: string | null
          slug: string
          store_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          name: string
          parent_id?: string | null
          slug: string
          store_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          name?: string
          parent_id?: string | null
          slug?: string
          store_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
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
          store_id: string | null
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
          store_id?: string | null
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
          store_id?: string | null
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
          {
            foreignKeyName: "daily_offers_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_batches: {
        Row: {
          batch_number: number
          created_at: string | null
          created_by: string | null
          dispatch_time: string
          id: string
          status: string | null
          total_distance_km: number | null
          total_estimated_minutes: number | null
          total_orders: number | null
          updated_at: string | null
          zone_id: string | null
        }
        Insert: {
          batch_number: number
          created_at?: string | null
          created_by?: string | null
          dispatch_time: string
          id?: string
          status?: string | null
          total_distance_km?: number | null
          total_estimated_minutes?: number | null
          total_orders?: number | null
          updated_at?: string | null
          zone_id?: string | null
        }
        Update: {
          batch_number?: number
          created_at?: string | null
          created_by?: string | null
          dispatch_time?: string
          id?: string
          status?: string | null
          total_distance_km?: number | null
          total_estimated_minutes?: number | null
          total_orders?: number | null
          updated_at?: string | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_batches_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "location_zones"
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
      delivery_routes: {
        Row: {
          completed_at: string | null
          created_at: string
          date: string
          id: string
          optimized_order: Json | null
          rider_id: string
          started_at: string | null
          status: string | null
          total_distance: number | null
          total_duration: number | null
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          date?: string
          id?: string
          optimized_order?: Json | null
          rider_id: string
          started_at?: string | null
          status?: string | null
          total_distance?: number | null
          total_duration?: number | null
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          date?: string
          id?: string
          optimized_order?: Json | null
          rider_id?: string
          started_at?: string | null
          status?: string | null
          total_distance?: number | null
          total_duration?: number | null
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
      flash_sale_products: {
        Row: {
          created_at: string
          flash_sale_id: string
          id: string
          product_id: string
          sale_price: number | null
          sold_count: number | null
          stock_limit: number | null
        }
        Insert: {
          created_at?: string
          flash_sale_id: string
          id?: string
          product_id: string
          sale_price?: number | null
          sold_count?: number | null
          stock_limit?: number | null
        }
        Update: {
          created_at?: string
          flash_sale_id?: string
          id?: string
          product_id?: string
          sale_price?: number | null
          sold_count?: number | null
          stock_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "flash_sale_products_flash_sale_id_fkey"
            columns: ["flash_sale_id"]
            isOneToOne: false
            referencedRelation: "flash_sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flash_sale_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      flash_sales: {
        Row: {
          active: boolean
          banner_color: string | null
          created_at: string
          description: string | null
          discount_percentage: number
          end_date: string
          id: string
          name: string
          start_date: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          banner_color?: string | null
          created_at?: string
          description?: string | null
          discount_percentage?: number
          end_date: string
          id?: string
          name: string
          start_date: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          banner_color?: string | null
          created_at?: string
          description?: string | null
          discount_percentage?: number
          end_date?: string
          id?: string
          name?: string
          start_date?: string
          updated_at?: string
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
      food_basket_likes: {
        Row: {
          basket_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          basket_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          basket_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_basket_likes_basket_id_fkey"
            columns: ["basket_id"]
            isOneToOne: false
            referencedRelation: "food_baskets"
            referencedColumns: ["id"]
          },
        ]
      }
      food_basket_saves: {
        Row: {
          basket_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          basket_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          basket_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_basket_saves_basket_id_fkey"
            columns: ["basket_id"]
            isOneToOne: false
            referencedRelation: "food_baskets"
            referencedColumns: ["id"]
          },
        ]
      }
      food_baskets: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          dietary_tags: string[] | null
          id: string
          image: string | null
          is_shared: boolean | null
          is_template: boolean | null
          likes_count: number | null
          name: string
          prep_time: number | null
          recipe: string
          saves_count: number | null
          servings: number | null
          share_code: string | null
          total_calories: number | null
          total_carbs: number | null
          total_fat: number | null
          total_price: number
          total_protein: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          dietary_tags?: string[] | null
          id?: string
          image?: string | null
          is_shared?: boolean | null
          is_template?: boolean | null
          likes_count?: number | null
          name: string
          prep_time?: number | null
          recipe: string
          saves_count?: number | null
          servings?: number | null
          share_code?: string | null
          total_calories?: number | null
          total_carbs?: number | null
          total_fat?: number | null
          total_price: number
          total_protein?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          dietary_tags?: string[] | null
          id?: string
          image?: string | null
          is_shared?: boolean | null
          is_template?: boolean | null
          likes_count?: number | null
          name?: string
          prep_time?: number | null
          recipe?: string
          saves_count?: number | null
          servings?: number | null
          share_code?: string | null
          total_calories?: number | null
          total_carbs?: number | null
          total_fat?: number | null
          total_price?: number
          total_protein?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      kyc_verifications: {
        Row: {
          address_proof_url: string | null
          admin_notes: string | null
          created_at: string
          credit_limit: number | null
          credit_score: number | null
          credit_used: number | null
          employer_name: string | null
          employment_status: string | null
          id: string
          id_document_url: string | null
          income_bracket: string | null
          national_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address_proof_url?: string | null
          admin_notes?: string | null
          created_at?: string
          credit_limit?: number | null
          credit_score?: number | null
          credit_used?: number | null
          employer_name?: string | null
          employment_status?: string | null
          id?: string
          id_document_url?: string | null
          income_bracket?: string | null
          national_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address_proof_url?: string | null
          admin_notes?: string | null
          created_at?: string
          credit_limit?: number | null
          credit_score?: number | null
          credit_used?: number | null
          employer_name?: string | null
          employment_status?: string | null
          id?: string
          id_document_url?: string | null
          income_bracket?: string | null
          national_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      location_zones: {
        Row: {
          center_latitude: number
          center_longitude: number
          city: string
          country: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          radius_km: number | null
          updated_at: string | null
        }
        Insert: {
          center_latitude: number
          center_longitude: number
          city: string
          country?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          radius_km?: number | null
          updated_at?: string | null
        }
        Update: {
          center_latitude?: number
          center_longitude?: number
          city?: string
          country?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          radius_km?: number | null
          updated_at?: string | null
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
          redemption_type: string | null
          status: string
          updated_at: string
          user_id: string
          wallet_transaction_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ksh_value: number
          order_id?: string | null
          points_redeemed: number
          redemption_type?: string | null
          status?: string
          updated_at?: string
          user_id: string
          wallet_transaction_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ksh_value?: number
          order_id?: string | null
          points_redeemed?: number
          redemption_type?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          wallet_transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_redemptions_wallet_transaction_id_fkey"
            columns: ["wallet_transaction_id"]
            isOneToOne: false
            referencedRelation: "wallet_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_settings: {
        Row: {
          bronze_multiplier: number
          bronze_threshold: number
          created_at: string
          gold_multiplier: number
          gold_threshold: number
          id: string
          ksh_per_point: number
          min_redemption_points: number
          points_expiration_days: number | null
          points_per_ksh: number
          referral_purchase_bonus: number | null
          referral_signup_bonus: number | null
          silver_multiplier: number
          silver_threshold: number
          updated_at: string
        }
        Insert: {
          bronze_multiplier?: number
          bronze_threshold?: number
          created_at?: string
          gold_multiplier?: number
          gold_threshold?: number
          id?: string
          ksh_per_point?: number
          min_redemption_points?: number
          points_expiration_days?: number | null
          points_per_ksh?: number
          referral_purchase_bonus?: number | null
          referral_signup_bonus?: number | null
          silver_multiplier?: number
          silver_threshold?: number
          updated_at?: string
        }
        Update: {
          bronze_multiplier?: number
          bronze_threshold?: number
          created_at?: string
          gold_multiplier?: number
          gold_threshold?: number
          id?: string
          ksh_per_point?: number
          min_redemption_points?: number
          points_expiration_days?: number | null
          points_per_ksh?: number
          referral_purchase_bonus?: number | null
          referral_signup_bonus?: number | null
          silver_multiplier?: number
          silver_threshold?: number
          updated_at?: string
        }
        Relationships: []
      }
      loyalty_transactions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          order_id: string | null
          points: number
          referrer_user_id: string | null
          review_id: string | null
          source: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string | null
          points: number
          referrer_user_id?: string | null
          review_id?: string | null
          source: string
          transaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string | null
          points?: number
          referrer_user_id?: string | null
          review_id?: string | null
          source?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_transactions_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "product_reviews"
            referencedColumns: ["id"]
          },
        ]
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
      optimization_logs: {
        Row: {
          batches_created: number | null
          completed_at: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          optimization_type: string
          orders_processed: number | null
          riders_assigned: number | null
          started_at: string | null
          status: string
          total_savings: number | null
        }
        Insert: {
          batches_created?: number | null
          completed_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          optimization_type: string
          orders_processed?: number | null
          riders_assigned?: number | null
          started_at?: string | null
          status: string
          total_savings?: number | null
        }
        Update: {
          batches_created?: number | null
          completed_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          optimization_type?: string
          orders_processed?: number | null
          riders_assigned?: number | null
          started_at?: string | null
          status?: string
          total_savings?: number | null
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
      order_zone_assignments: {
        Row: {
          assigned_at: string | null
          confidence_score: number | null
          id: string
          order_id: string
          zone_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          confidence_score?: number | null
          id?: string
          order_id: string
          zone_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          confidence_score?: number | null
          id?: string
          order_id?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_zone_assignments_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "location_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          assigned_to: string | null
          batch_id: string | null
          created_at: string
          customer_latitude: number | null
          customer_longitude: number | null
          delivery_address: Json
          delivery_distance: number | null
          delivery_fee: number
          delivery_method: Json
          delivery_route_id: string | null
          discount: number | null
          estimated_delivery: string
          id: string
          items: Json
          loyalty_points_earned: number | null
          loyalty_points_used: number | null
          notes: string | null
          optimization_score: number | null
          payment_method: Json
          promo_code: string | null
          route_sequence: number | null
          scheduled_delivery: Json | null
          status: string
          store_id: string | null
          subtotal: number
          total: number
          tracking: Json | null
          updated_at: string
          user_id: string
          zone_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          batch_id?: string | null
          created_at?: string
          customer_latitude?: number | null
          customer_longitude?: number | null
          delivery_address: Json
          delivery_distance?: number | null
          delivery_fee: number
          delivery_method: Json
          delivery_route_id?: string | null
          discount?: number | null
          estimated_delivery: string
          id?: string
          items: Json
          loyalty_points_earned?: number | null
          loyalty_points_used?: number | null
          notes?: string | null
          optimization_score?: number | null
          payment_method: Json
          promo_code?: string | null
          route_sequence?: number | null
          scheduled_delivery?: Json | null
          status: string
          store_id?: string | null
          subtotal: number
          total: number
          tracking?: Json | null
          updated_at?: string
          user_id: string
          zone_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          batch_id?: string | null
          created_at?: string
          customer_latitude?: number | null
          customer_longitude?: number | null
          delivery_address?: Json
          delivery_distance?: number | null
          delivery_fee?: number
          delivery_method?: Json
          delivery_route_id?: string | null
          discount?: number | null
          estimated_delivery?: string
          id?: string
          items?: Json
          loyalty_points_earned?: number | null
          loyalty_points_used?: number | null
          notes?: string | null
          optimization_score?: number | null
          payment_method?: Json
          promo_code?: string | null
          route_sequence?: number | null
          scheduled_delivery?: Json | null
          status?: string
          store_id?: string | null
          subtotal?: number
          total?: number
          tracking?: Json | null
          updated_at?: string
          user_id?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "delivery_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_delivery_route_id_fkey"
            columns: ["delivery_route_id"]
            isOneToOne: false
            referencedRelation: "delivery_routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "location_zones"
            referencedColumns: ["id"]
          },
        ]
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
      payment_settings: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          enabled: boolean | null
          icon: string | null
          id: string
          max_amount: number | null
          min_amount: number | null
          payment_method: string
          processing_fee_fixed: number | null
          processing_fee_percentage: number | null
          settings: Json | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          enabled?: boolean | null
          icon?: string | null
          id?: string
          max_amount?: number | null
          min_amount?: number | null
          payment_method: string
          processing_fee_fixed?: number | null
          processing_fee_percentage?: number | null
          settings?: Json | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          enabled?: boolean | null
          icon?: string | null
          id?: string
          max_amount?: number | null
          min_amount?: number | null
          payment_method?: string
          processing_fee_fixed?: number | null
          processing_fee_percentage?: number | null
          settings?: Json | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      product_bundles: {
        Row: {
          active: boolean | null
          created_at: string
          description: string | null
          discount_percentage: number | null
          id: string
          image: string | null
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          discount_percentage?: number | null
          id?: string
          image?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          discount_percentage?: number | null
          id?: string
          image?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
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
          helpful_count: number | null
          id: string
          product_id: string
          rating: number
          updated_at: string
          user_id: string
          verified_purchase: boolean | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          product_id: string
          rating: number
          updated_at?: string
          user_id: string
          verified_purchase?: boolean | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          product_id?: string
          rating?: number
          updated_at?: string
          user_id?: string
          verified_purchase?: boolean | null
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
          brand_name: string | null
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
          store_id: string | null
          unit: string | null
          updated_at: string
          weight: string | null
        }
        Insert: {
          brand_name?: string | null
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
          store_id?: string | null
          unit?: string | null
          updated_at?: string
          weight?: string | null
        }
        Update: {
          brand_name?: string | null
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
          store_id?: string | null
          unit?: string | null
          updated_at?: string
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_product_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          dietary_preferences: string[] | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          loyalty_points: number
          notification_order_email: boolean | null
          notification_order_sms: boolean | null
          notification_product_email: boolean | null
          notification_product_sms: boolean | null
          notification_promo_email: boolean | null
          notification_promo_sms: boolean | null
          phone: string | null
          points_last_activity: string | null
          referral_code: string | null
          referred_by: string | null
        }
        Insert: {
          created_at?: string
          dietary_preferences?: string[] | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          loyalty_points?: number
          notification_order_email?: boolean | null
          notification_order_sms?: boolean | null
          notification_product_email?: boolean | null
          notification_product_sms?: boolean | null
          notification_promo_email?: boolean | null
          notification_promo_sms?: boolean | null
          phone?: string | null
          points_last_activity?: string | null
          referral_code?: string | null
          referred_by?: string | null
        }
        Update: {
          created_at?: string
          dietary_preferences?: string[] | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          loyalty_points?: number
          notification_order_email?: boolean | null
          notification_order_sms?: boolean | null
          notification_product_email?: boolean | null
          notification_product_sms?: boolean | null
          notification_promo_email?: boolean | null
          notification_promo_sms?: boolean | null
          phone?: string | null
          points_last_activity?: string | null
          referral_code?: string | null
          referred_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      receipts: {
        Row: {
          created_at: string
          email_sent_to: string | null
          id: string
          order_id: string
          receipt_number: string
          sent_at: string | null
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_sent_to?: string | null
          id?: string
          order_id: string
          receipt_number: string
          sent_at?: string | null
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_sent_to?: string | null
          id?: string
          order_id?: string
          receipt_number?: string
          sent_at?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recently_viewed_products: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recently_viewed_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          referral_code: string
          referred_points_earned: number | null
          referred_user_id: string
          referrer_points_earned: number | null
          referrer_user_id: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code: string
          referred_points_earned?: number | null
          referred_user_id: string
          referrer_points_earned?: number | null
          referrer_user_id: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code?: string
          referred_points_earned?: number | null
          referred_user_id?: string
          referrer_points_earned?: number | null
          referrer_user_id?: string
          status?: string
        }
        Relationships: []
      }
      review_helpfulness: {
        Row: {
          created_at: string
          id: string
          is_helpful: boolean
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_helpful: boolean
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_helpful?: boolean
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_helpfulness_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "product_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      rider_metrics: {
        Row: {
          base_cost: number | null
          capacity_kg: number | null
          cost_per_km: number | null
          created_at: string | null
          current_latitude: number | null
          current_longitude: number | null
          id: string
          is_available: boolean | null
          last_location_update: string | null
          on_time_percentage: number | null
          phone: string | null
          rating: number | null
          rider_id: string
          rider_name: string
          total_deliveries: number | null
          updated_at: string | null
          zone_id: string | null
        }
        Insert: {
          base_cost?: number | null
          capacity_kg?: number | null
          cost_per_km?: number | null
          created_at?: string | null
          current_latitude?: number | null
          current_longitude?: number | null
          id?: string
          is_available?: boolean | null
          last_location_update?: string | null
          on_time_percentage?: number | null
          phone?: string | null
          rating?: number | null
          rider_id: string
          rider_name: string
          total_deliveries?: number | null
          updated_at?: string | null
          zone_id?: string | null
        }
        Update: {
          base_cost?: number | null
          capacity_kg?: number | null
          cost_per_km?: number | null
          created_at?: string | null
          current_latitude?: number | null
          current_longitude?: number | null
          id?: string
          is_available?: boolean | null
          last_location_update?: string | null
          on_time_percentage?: number | null
          phone?: string | null
          rating?: number | null
          rider_id?: string
          rider_name?: string
          total_deliveries?: number | null
          updated_at?: string | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rider_metrics_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "location_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      role_definitions: {
        Row: {
          active: boolean | null
          color: string | null
          created_at: string
          description: string | null
          display_name: string
          icon: string | null
          id: string
          is_system_role: boolean | null
          name: string
          permissions: Json | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          color?: string | null
          created_at?: string
          description?: string | null
          display_name: string
          icon?: string | null
          id?: string
          is_system_role?: boolean | null
          name: string
          permissions?: Json | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          color?: string | null
          created_at?: string
          description?: string | null
          display_name?: string
          icon?: string | null
          id?: string
          is_system_role?: boolean | null
          name?: string
          permissions?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      store_admins: {
        Row: {
          created_at: string
          id: string
          store_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          store_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          store_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_admins_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          active: boolean
          address: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          logo: string | null
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          address?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          logo?: string | null
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          address?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          logo?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
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
      waitlist: {
        Row: {
          budget_range: string | null
          created_at: string
          email: string
          email_sent: boolean | null
          email_sent_at: string | null
          grocery_challenges: string | null
          household_size: string | null
          id: string
          interests: string[] | null
          location: string | null
          name: string
          pain_points: string[] | null
          phone: string | null
          preferred_basket_type: string | null
          preferred_delivery_time: string | null
          product_types: string[] | null
          referral_source: string | null
          shopping_frequency: string | null
          suggestion: string | null
          updated_at: string
          value_proposition: string | null
          wants_beta_testing: boolean | null
          wants_early_access: boolean | null
        }
        Insert: {
          budget_range?: string | null
          created_at?: string
          email: string
          email_sent?: boolean | null
          email_sent_at?: string | null
          grocery_challenges?: string | null
          household_size?: string | null
          id?: string
          interests?: string[] | null
          location?: string | null
          name: string
          pain_points?: string[] | null
          phone?: string | null
          preferred_basket_type?: string | null
          preferred_delivery_time?: string | null
          product_types?: string[] | null
          referral_source?: string | null
          shopping_frequency?: string | null
          suggestion?: string | null
          updated_at?: string
          value_proposition?: string | null
          wants_beta_testing?: boolean | null
          wants_early_access?: boolean | null
        }
        Update: {
          budget_range?: string | null
          created_at?: string
          email?: string
          email_sent?: boolean | null
          email_sent_at?: string | null
          grocery_challenges?: string | null
          household_size?: string | null
          id?: string
          interests?: string[] | null
          location?: string | null
          name?: string
          pain_points?: string[] | null
          phone?: string | null
          preferred_basket_type?: string | null
          preferred_delivery_time?: string | null
          product_types?: string[] | null
          referral_source?: string | null
          shopping_frequency?: string | null
          suggestion?: string | null
          updated_at?: string
          value_proposition?: string | null
          wants_beta_testing?: boolean | null
          wants_early_access?: boolean | null
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
      assign_order_to_zone: { Args: { order_uuid: string }; Returns: string }
      deduct_product_stock: {
        Args: { product_id: string; quantity_to_deduct: number }
        Returns: undefined
      }
      expire_inactive_points: { Args: never; Returns: undefined }
      generate_referral_code: { Args: never; Returns: string }
      get_delivery_settings: { Args: never; Returns: Json }
      get_frequently_bought_together: {
        Args: { p_limit?: number; p_product_id: string }
        Returns: {
          confidence_score: number
          product_id: string
          purchase_count: number
        }[]
      }
      get_personalized_bundle_recommendations: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: {
          bundle_id: string
          match_reason: string
          recommendation_score: number
        }[]
      }
      get_product_recommendations: {
        Args: { p_limit?: number; p_product_id?: string; p_user_id?: string }
        Returns: {
          product_id: string
          recommendation_score: number
        }[]
      }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      increment_discount_code_usage: {
        Args: { code_id: string }
        Returns: undefined
      }
      process_auto_replenish_orders: { Args: never; Returns: undefined }
      process_loyalty_redemption: {
        Args: { p_ksh_value: number; p_points: number; p_user_id: string }
        Returns: string
      }
      run_delivery_optimization: { Args: never; Returns: Json }
      upsert_delivery_settings: { Args: { settings_data: Json }; Returns: Json }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
