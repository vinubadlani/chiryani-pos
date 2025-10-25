"use client"

import { Trash2, ShoppingCart, ChevronDown, Phone, Truck, UtensilsCrossed } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface CartProps {
  items: CartItem[]
  onRemove: (itemId: string) => void
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onCheckout: (orderData: {
    items: CartItem[]
    total: number
    orderSource: 'dine-in' | 'zomato' | 'swiggy' | 'call'
    customerName?: string
  }) => void
  isMinimized?: boolean
  onToggleMinimize?: () => void
}

export function Cart({
  items,
  onRemove,
  onUpdateQuantity,
  onCheckout,
  isMinimized = false,
  onToggleMinimize,
}: CartProps) {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [orderSource, setOrderSource] = useState<'dine-in' | 'zomato' | 'swiggy' | 'call'>('dine-in')
  const [customerName, setCustomerName] = useState('')

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleCheckout = () => {
    if (items.length === 0) return
    setShowPaymentDialog(true)
  }

  const handlePaymentConfirm = () => {
    onCheckout({
      items,
      total,
      orderSource,
      customerName: customerName.trim() || undefined
    })
    setShowPaymentDialog(false)
    setCustomerName('')
    setOrderSource('dine-in')
  }

  if (isMinimized) {
    return (
      <button
        onClick={onToggleMinimize}
        className="fixed bottom-6 right-6 lg:hidden z-40 w-16 h-16 bg-linear-to-br from-emerald-500 to-teal-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:shadow-3xl hover:scale-110 transition-all duration-300 border-4 border-white"
      >
        <div className="flex flex-col items-center justify-center">
          <ShoppingCart className="w-6 h-6" />
          {items.length > 0 && (
            <span className="text-xs font-bold mt-0.5 bg-red-500 px-1.5 py-0.5 rounded-full">{items.length}</span>
          )}
        </div>
      </button>
    )
  }

  return (
    <div className="w-full lg:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden h-full lg:h-auto">
      <div className="bg-linear-to-r from-emerald-500 via-teal-600 to-cyan-600 text-white p-5 flex items-center gap-3 shadow-lg">
        <ShoppingCart className="w-6 h-6" />
        <div className="flex-1">
          <h2 className="font-bold text-lg">Order Summary</h2>
          <p className="text-xs text-white/80">Tax Included</p>
        </div>
        <span className="bg-white/25 px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm">{items.length}</span>
        <button onClick={onToggleMinimize} className="lg:hidden p-2 hover:bg-white/20 rounded-lg transition">
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
            <ShoppingCart className="w-16 h-16 mb-3 opacity-20" />
            <p className="text-sm font-medium">No items in cart</p>
            <p className="text-xs mt-1">Add items to get started</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="bg-linear-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-slate-800 line-clamp-2">{item.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">₹{item.price} each</p>
                </div>
                <button
                  onClick={() => onRemove(item.id)}
                  className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition shrink-0 ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  className="bg-slate-200 hover:bg-emerald-600 hover:text-white text-slate-700 px-3 py-1.5 rounded-lg text-sm transition font-bold"
                >
                  −
                </button>
                <span className="flex-1 text-center font-bold text-sm text-slate-800">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  className="bg-slate-200 hover:bg-emerald-600 hover:text-white text-slate-700 px-3 py-1.5 rounded-lg text-sm transition font-bold"
                >
                  +
                </button>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-between">
                <span className="text-xs text-slate-500 font-medium">Subtotal:</span>
                <span className="font-bold text-sm text-emerald-600">₹{item.price * item.quantity}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-slate-200 p-5 space-y-4 bg-linear-to-b from-white to-slate-50">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600 font-medium">Subtotal:</span>
            <span className="font-bold text-slate-800">₹{total}</span>
          </div>
          <div className="flex justify-between items-center text-xs bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
            <span className="text-emerald-700 font-semibold">✓ Tax Included</span>
            <span className="font-bold text-emerald-600">(5%)</span>
          </div>
        </div>
        <div className="flex justify-between items-center bg-linear-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border-2 border-emerald-200">
          <span className="font-bold text-slate-800">Total:</span>
          <span className="font-bold text-2xl text-emerald-600">₹{total}</span>
        </div>
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogTrigger asChild>
            <Button
              onClick={handleCheckout}
              disabled={items.length === 0}
              className="w-full bg-linear-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-600 hover:via-teal-700 hover:to-cyan-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-105 disabled:hover:scale-100"
            >
              Proceed to Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="orderSource">Order Source</Label>
                <Select value={orderSource} onValueChange={(value: any) => setOrderSource(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select order source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dine-in">
                      <div className="flex items-center gap-2">
                        <UtensilsCrossed className="w-4 h-4" />
                        Dine In
                      </div>
                    </SelectItem>
                    <SelectItem value="zomato">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-red-600" />
                        Zomato
                      </div>
                    </SelectItem>
                    <SelectItem value="swiggy">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-orange-600" />
                        Swiggy
                      </div>
                    </SelectItem>
                    <SelectItem value="call">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-blue-600" />
                        Phone Order
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="customerName">Customer Name (Optional)</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                />
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Total Amount:</span>
                  <span className="text-xl font-bold text-emerald-600">₹{total}</span>
                </div>
                <div className="text-xs text-gray-500">Tax included (5%)</div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPaymentDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={handlePaymentConfirm} className="flex-1">
                  Confirm Order
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
