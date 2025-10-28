import { supabase } from './supabase'
import { v4 as uuidv4 } from 'uuid'

export interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
}

export interface CreateOrderData {
  items: OrderItem[]
  total: number
  orderSource: 'dine-in' | 'zomato' | 'swiggy' | 'call'
  customerName?: string
  includeCoupon?: boolean
}

export interface Order {
  id: string
  order_number: string
  customer_name: string | null
  order_source: 'dine-in' | 'zomato' | 'swiggy' | 'call'
  items: OrderItem[]
  total_amount: number
  tax_amount: number
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  created_at: string
  updated_at: string
}

export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString()
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `CHB-${timestamp.slice(-6)}${random}`
}

export const createOrder = async (orderData: CreateOrderData): Promise<Order | null> => {
  try {
    const orderNumber = generateOrderNumber()
    const taxAmount = Math.round(orderData.total * 0.05) // 5% tax
    
    const newOrder = {
      id: uuidv4(),
      order_number: orderNumber,
      customer_name: orderData.customerName || null,
      order_source: orderData.orderSource,
      items: orderData.items,
      total_amount: orderData.total,
      tax_amount: taxAmount,
      status: 'pending' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('orders')
      .insert([newOrder])
      .select()
      .single()

    if (error) {
      console.error('Error creating order:', error)
      return null
    }

    // Update daily stats
    await updateDailyStats(orderData.total, orderData.orderSource)

    return data
  } catch (error) {
    console.error('Error creating order:', error)
    return null
  }
}

export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    if (error) {
      console.error('Error updating order status:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating order status:', error)
    return false
  }
}

export const getOrders = async (limit?: number): Promise<Order[]> => {
  try {
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching orders:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching orders:', error)
    return []
  }
}

export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (error) {
      console.error('Error fetching order:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching order:', error)
    return null
  }
}

export const searchOrders = async (searchTerm: string): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .or(`order_number.ilike.%${searchTerm}%,customer_name.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error searching orders:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error searching orders:', error)
    return []
  }
}

const updateDailyStats = async (amount: number, source: Order['order_source']): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format

    // First, try to get existing stats for today
    const { data: existingStats, error: fetchError } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('date', today)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching daily stats:', fetchError)
      return
    }

    const sourceKey = `${source.replace('-', '_')}_orders` as keyof typeof existingStats

    if (existingStats) {
      // Update existing stats
      const updatedStats = {
        total_orders: existingStats.total_orders + 1,
        total_revenue: existingStats.total_revenue + amount,
        [sourceKey]: (existingStats[sourceKey] || 0) + 1,
        updated_at: new Date().toISOString()
      }

      await supabase
        .from('daily_stats')
        .update(updatedStats)
        .eq('id', existingStats.id)
    } else {
      // Create new stats for today
      const newStats = {
        id: uuidv4(),
        date: today,
        total_orders: 1,
        total_revenue: amount,
        zomato_orders: source === 'zomato' ? 1 : 0,
        swiggy_orders: source === 'swiggy' ? 1 : 0,
        call_orders: source === 'call' ? 1 : 0,
        dine_in_orders: source === 'dine-in' ? 1 : 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      await supabase
        .from('daily_stats')
        .insert([newStats])
    }
  } catch (error) {
    console.error('Error updating daily stats:', error)
  }
}

export const getDailyStats = async (date?: string): Promise<any> => {
  try {
    const targetDate = date || new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('date', targetDate)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching daily stats:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching daily stats:', error)
    return null
  }
}

export const getMonthlyStats = async (year: number, month: number): Promise<any> => {
  try {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`
    const endDate = new Date(year, month, 0).toISOString().split('T')[0] // Last day of month

    const { data, error } = await supabase
      .from('daily_stats')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)

    if (error) {
      console.error('Error fetching monthly stats:', error)
      return null
    }

    // Aggregate the data
    const aggregated = data?.reduce((acc, day) => ({
      total_orders: acc.total_orders + day.total_orders,
      total_revenue: acc.total_revenue + day.total_revenue,
      zomato_orders: acc.zomato_orders + day.zomato_orders,
      swiggy_orders: acc.swiggy_orders + day.swiggy_orders,
      call_orders: acc.call_orders + day.call_orders,
      dine_in_orders: acc.dine_in_orders + day.dine_in_orders
    }), {
      total_orders: 0,
      total_revenue: 0,
      zomato_orders: 0,
      swiggy_orders: 0,
      call_orders: 0,
      dine_in_orders: 0
    })

    return aggregated
  } catch (error) {
    console.error('Error fetching monthly stats:', error)
    return null
  }
}
