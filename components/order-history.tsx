"use client"

import React, { useState, useEffect } from 'react'
import { getOrders, searchOrders, updateOrderStatus, Order } from '@/lib/orders'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Phone, 
  UtensilsCrossed, 
  Truck,
  Eye,
  Calendar,
  DollarSign,
  ShoppingBag,
  Printer,
  Zap
} from 'lucide-react'
import { thermalPrinter, type PrintData } from "@/lib/thermal-printer"
import { toast } from "sonner"
import { format } from 'date-fns'

export function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isPrinting, setIsPrinting] = useState(false)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const ordersData = await getOrders()
      setOrders(ordersData)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      setLoading(true)
      try {
        const searchResults = await searchOrders(searchTerm.trim())
        setOrders(searchResults)
      } catch (error) {
        console.error('Error searching orders:', error)
      } finally {
        setLoading(false)
      }
    } else {
      fetchOrders()
    }
  }

  const filterOrders = () => {
    let filtered = orders

    if (sourceFilter !== 'all') {
      filtered = filtered.filter(order => order.order_source === sourceFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    setFilteredOrders(filtered)
  }

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    const success = await updateOrderStatus(orderId, newStatus)
    if (success) {
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
          : order
      ))
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, sourceFilter, statusFilter])

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'zomato': return <Truck className="w-4 h-4 text-red-600" />
      case 'swiggy': return <Truck className="w-4 h-4 text-orange-600" />
      case 'call': return <Phone className="w-4 h-4 text-blue-600" />
      case 'dine-in': return <UtensilsCrossed className="w-4 h-4 text-green-600" />
      default: return <ShoppingBag className="w-4 h-4" />
    }
  }

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'zomato': return 'bg-red-100 text-red-800'
      case 'swiggy': return 'bg-orange-100 text-orange-800'
      case 'call': return 'bg-blue-100 text-blue-800'
      case 'dine-in': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'preparing': return 'bg-blue-100 text-blue-800'
      case 'ready': return 'bg-green-100 text-green-800'
      case 'delivered': return 'bg-emerald-100 text-emerald-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const calculateOrderTotal = (items: any[]) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const handlePrintBill = async (order: Order) => {
    setIsPrinting(true)
    try {
      if (!thermalPrinter.isDeviceConnected()) {
        toast.error('Thermal printer not connected. Please connect a printer first.')
        return
      }

      const printData: PrintData = {
        orderNumber: order.order_number,
        items: order.items.map(item => ({
          id: item.id || Math.random().toString(),
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        total: order.total_amount,
        customerName: order.customer_name || undefined,
        orderSource: order.order_source.toUpperCase(),
        timestamp: new Date(order.created_at),
      }

      await thermalPrinter.printReceipt(printData)
      toast.success('Bill printed successfully!')
    } catch (error) {
      console.error('Print error:', error)
      toast.error(`Print failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsPrinting(false)
    }
  }

  const handleRegularPrint = (order: Order) => {
    const printWindow = window.open("", "", "height=600,width=800")
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <style>
              body { font-family: 'Courier New', monospace; margin: 0; padding: 20px; background: white; }
              .receipt { max-width: 400px; margin: 0 auto; }
              .header { text-align: center; border-bottom: 3px solid #000; padding-bottom: 15px; margin-bottom: 15px; }
              .header h1 { margin: 0; font-size: 20px; font-weight: bold; }
              .header p { margin: 5px 0; font-size: 11px; line-height: 1.4; }
              .items { margin: 15px 0; }
              .item { display: flex; justify-content: space-between; font-size: 12px; margin: 8px 0; }
              .item-name { flex: 1; font-weight: bold; }
              .item-qty { width: 40px; text-align: center; }
              .item-price { width: 70px; text-align: right; font-weight: bold; }
              .divider { border-top: 2px solid #000; margin: 12px 0; }
              .total { display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; margin: 10px 0; }
              .footer { text-align: center; font-size: 11px; margin-top: 15px; border-top: 1px solid #000; padding-top: 10px; }
            </style>
          </head>
          <body>
            <div class="receipt">
              <div class="header">
                <h1>Chiryani</h1>
                <p>20, Ground Floor, Padmavati Colony, Near St Paul School, Geeta Bhavan, Indore</p>
                <p>FSSAI License: 21425850010639</p>
                <p style="margin-top: 8px; font-weight: bold;">Order: ${order.order_number}</p>
                <p>${new Date(order.created_at).toLocaleString()}</p>
                ${order.customer_name ? `<p>Customer: ${order.customer_name}</p>` : ''}
                <p>Source: ${order.order_source.toUpperCase()}</p>
              </div>
              <div class="items">
                <div class="item" style="font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 8px;">
                  <span class="item-name">Item</span>
                  <span class="item-qty">Qty</span>
                  <span class="item-price">Total</span>
                </div>
                ${order.items
                  .map(
                    (item) => `
                  <div class="item">
                    <span class="item-name">${item.name}</span>
                    <span class="item-qty">${item.quantity}</span>
                    <span class="item-price">₹${item.price * item.quantity}</span>
                  </div>
                `,
                  )
                  .join("")}
              </div>
              <div class="divider"></div>
              <div class="total">
                <span>Total Amount:</span>
                <span>₹${order.total_amount}</span>
              </div>
              <p style="text-align: center; font-size: 11px; margin: 8px 0; color: #666;">(Tax Included in Price)</p>
              <div class="footer">
                <p style="font-weight: bold;">Thank you for your order!</p>
                <p>Please collect your order from the counter</p>
                <p style="margin-top: 8px; font-size: 10px;">Powered by Chiryani POS</p>
              </div>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      setTimeout(() => printWindow.print(), 250)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
          <p className="text-gray-600">View and manage all orders</p>
        </div>
        <Button onClick={fetchOrders} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by order number or customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="zomato">Zomato</SelectItem>
                <SelectItem value="swiggy">Swiggy</SelectItem>
                <SelectItem value="call">Call Orders</SelectItem>
                <SelectItem value="dine-in">Dine In</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <ShoppingBag className="w-8 h-8 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No orders found</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getSourceIcon(order.order_source)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-bold text-lg">{order.order_number}</h3>
                        <Badge className={getSourceColor(order.order_source)}>
                          {order.order_source}
                        </Badge>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(order.created_at), 'MMM dd, yyyy - HH:mm')}</span>
                        </div>
                        {order.customer_name && (
                          <p>Customer: {order.customer_name}</p>
                        )}
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-bold text-emerald-600 font-mono">₹{order.total_amount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Order Details - {order.order_number}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Customer</p>
                              <p className="font-semibold">{order.customer_name || 'Walk-in Customer'}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Order Source</p>
                              <div className="flex items-center space-x-2">
                                {getSourceIcon(order.order_source)}
                                <span className="font-semibold capitalize">{order.order_source}</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Status</p>
                              <Badge className={getStatusColor(order.status)}>
                                {order.status}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Date & Time</p>
                              <p className="font-semibold">{format(new Date(order.created_at), 'MMM dd, yyyy - HH:mm')}</p>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-500 mb-3">Order Items</p>
                            <div className="space-y-2">
                              {order.items.map((item: any, index: number) => (
                                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                  <div className="flex-1">
                                    <p className="font-semibold text-gray-900">{item.name}</p>
                                    <p className="text-sm text-gray-600 font-mono">₹{item.price} each</p>
                                  </div>
                                  <div className="text-right min-w-[100px]">
                                    <p className="font-semibold text-gray-900">Qty: {item.quantity}</p>
                                    <p className="text-sm text-emerald-600 font-mono font-bold">₹{item.price * item.quantity}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="border-t pt-4">
                            <div className="flex justify-between items-center mb-4">
                              <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                              <span className="text-2xl font-bold text-emerald-600 font-mono">₹{order.total_amount}</span>
                            </div>
                            <p className="text-xs text-gray-500 mb-4">Tax included (5%)</p>
                            
                            {/* Print Buttons */}
                            <div className="flex gap-3 pt-4 border-t">
                              <Button
                                onClick={() => handleRegularPrint(order)}
                                variant="outline"
                                size="sm"
                                className="flex-1"
                              >
                                <Printer className="w-4 h-4 mr-2" />
                                Print Bill
                              </Button>
                              
                              {thermalPrinter.isDeviceConnected() && (
                                <Button
                                  onClick={() => handlePrintBill(order)}
                                  disabled={isPrinting}
                                  size="sm"
                                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                                >
                                  {isPrinting ? (
                                    <>
                                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                      Printing...
                                    </>
                                  ) : (
                                    <>
                                      <Zap className="w-4 h-4 mr-2" />
                                      Thermal Print
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    {/* Status Update Buttons */}
                    {order.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(order.id, 'preparing')}
                      >
                        Start Preparing
                      </Button>
                    )}
                    {order.status === 'preparing' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(order.id, 'ready')}
                      >
                        Mark Ready
                      </Button>
                    )}
                    {order.status === 'ready' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(order.id, 'delivered')}
                      >
                        Mark Delivered
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
