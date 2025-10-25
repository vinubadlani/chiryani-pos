import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string
          order_number: string
          customer_name: string | null
          order_source: 'dine-in' | 'zomato' | 'swiggy' | 'call'
          items: any[]
          total_amount: number
          tax_amount: number
          status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          customer_name?: string | null
          order_source: 'dine-in' | 'zomato' | 'swiggy' | 'call'
          items: any[]
          total_amount: number
          tax_amount: number
          status?: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          customer_name?: string | null
          order_source?: 'dine-in' | 'zomato' | 'swiggy' | 'call'
          items?: any[]
          total_amount?: number
          tax_amount?: number
          status?: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      daily_stats: {
        Row: {
          id: string
          date: string
          total_orders: number
          total_revenue: number
          zomato_orders: number
          swiggy_orders: number
          call_orders: number
          dine_in_orders: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          date: string
          total_orders: number
          total_revenue: number
          zomato_orders?: number
          swiggy_orders?: number
          call_orders?: number
          dine_in_orders?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          date?: string
          total_orders?: number
          total_revenue?: number
          zomato_orders?: number
          swiggy_orders?: number
          call_orders?: number
          dine_in_orders?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
