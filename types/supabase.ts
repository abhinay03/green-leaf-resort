// This file contains TypeScript types for the Supabase client
declare global {
  type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

  interface Database {
    public: {
      Tables: {
        bookings: {
          Row: {
            id: string
            user_id: string
            accommodation_id: string
            check_in_date: string
            check_out_date: string
            total_amount: number
            status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
            created_at: string
            updated_at: string
          }
          Insert: {
            id?: string
            user_id: string
            accommodation_id: string
            check_in_date: string
            check_out_date: string
            total_amount: number
            status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
            created_at?: string
            updated_at?: string
          }
          Update: {
            id?: string
            user_id?: string
            accommodation_id?: string
            check_in_date?: string
            check_out_date?: string
            total_amount?: number
            status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
            created_at?: string
            updated_at?: string
          }
        }
        accommodations: {
          Row: {
            id: string
            name: string
            description: string
            price_per_night: number
            capacity: number
            image_url: string
            created_at: string
            updated_at: string
          }
          Insert: {
            id?: string
            name: string
            description: string
            price_per_night: number
            capacity: number
            image_url: string
            created_at?: string
            updated_at?: string
          }
          Update: {
            id?: string
            name?: string
            description?: string
            price_per_night?: number
            capacity?: number
            image_url?: string
            created_at?: string
            updated_at?: string
          }
        }
      }
      Views: {
        [_ in never]: never
      }
      Functions: {
        get_admin_stats: {
          Args: {
            today_date: string
            current_month: string
          }
          Returns: {
            total_bookings: number
            today_check_ins: number
            today_check_outs: number
            occupancy_rate: number
            monthly_revenue: number
            pending_bookings: number
          }[]
        }
      }
      Enums: {
        [_ in never]: never
      }
    }
  }
}

export {}
