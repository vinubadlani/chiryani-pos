"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { MenuGrid } from "@/components/menu-grid"
import { Cart } from "@/components/cart"
import { Receipt } from "@/components/receipt"
import { SizeSelector } from "@/components/size-selector"
import { Dashboard } from "@/components/dashboard"
import { OrderHistory } from "@/components/order-history"
import { ThermalPrinterControl } from "@/components/thermal-printer-control"
import { createOrder, CreateOrderData } from "@/lib/orders"
import { toast } from "sonner"

export default function Home() {
  const [activeView, setActiveView] = useState<'pos' | 'dashboard' | 'history'>('pos')
  const [cartItems, setCartItems] = useState<any[]>([])
  const [showReceipt, setShowReceipt] = useState(false)
  const [orderNumber, setOrderNumber] = useState("")
  const [lastOrderData, setLastOrderData] = useState<CreateOrderData | null>(null)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [showSizeSelector, setShowSizeSelector] = useState(false)
  const [isCartMinimized, setIsCartMinimized] = useState(true)
  const [isThermalControlMinimized, setIsThermalControlMinimized] = useState(true)

  const addToCart = (item: any) => {
    if (item.requiresSize) {
      setSelectedItem(item)
      setShowSizeSelector(true)
    } else {
      addItemToCart(item)
    }
  }

  const addItemToCart = (item: any) => {
    const existingItem = cartItems.find((i) => i.id === item.id)
    if (existingItem) {
      setCartItems(cartItems.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)))
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1 }])
    }
    setIsCartMinimized(false)
  }

  const removeFromCart = (itemId: string) => {
    setCartItems(cartItems.filter((i) => i.id !== itemId))
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
    } else {
      setCartItems(cartItems.map((i) => (i.id === itemId ? { ...i, quantity } : i)))
    }
  }

  const handleCheckout = async (orderData: CreateOrderData) => {
    try {
      const order = await createOrder(orderData)
      
      if (order) {
        setOrderNumber(order.order_number)
        setLastOrderData(orderData)
        setShowReceipt(true)
        toast.success(`Order ${order.order_number} created successfully!`)
      } else {
        toast.error("Failed to create order. Please try again.")
      }
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error("Failed to create order. Please try again.")
    }
  }

  const handleNewOrder = () => {
    setCartItems([])
    setShowReceipt(false)
    setOrderNumber("")
    setLastOrderData(null)
    setIsCartMinimized(true)
  }

  const handleSizeSelected = (itemWithSize: any) => {
    addItemToCart(itemWithSize)
    setShowSizeSelector(false)
    setSelectedItem(null)
  }

  const renderCurrentView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />
      case 'history':
        return <OrderHistory />
      default:
        return (
          <div className="flex-1 flex gap-3 md:gap-6 p-3 md:p-6 overflow-hidden flex-col lg:flex-row relative">
            <MenuGrid onAddToCart={addToCart} />
            
            {/* Desktop Cart - Always visible */}
            <div className="hidden lg:flex lg:w-96 flex-col">
              <Cart
                items={cartItems}
                onRemove={removeFromCart}
                onUpdateQuantity={updateQuantity}
                onCheckout={handleCheckout}
                isMinimized={false}
                onToggleMinimize={() => {}}
              />
            </div>
            
            {/* Mobile Cart - Can be minimized */}
            <div className="lg:hidden">
              <Cart
                items={cartItems}
                onRemove={removeFromCart}
                onUpdateQuantity={updateQuantity}
                onCheckout={handleCheckout}
                isMinimized={isCartMinimized}
                onToggleMinimize={() => setIsCartMinimized(!isCartMinimized)}
              />
            </div>
          </div>
        )
    }
  }

  return (
    <div className="flex h-screen bg-linear-to-br from-slate-50 to-slate-100 flex-col md:flex-row">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <div className="flex-1 flex flex-col">
        {/* Thermal Printer Control Bar - Hidden on mobile when minimized */}
        <div className={`bg-white border-b border-slate-200 p-3 flex items-center justify-between ${isThermalControlMinimized ? 'hidden lg:flex' : 'flex'}`}>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-800">Chiryani POS</h1>
            <span className="text-xs bg-slate-100 px-2 py-1 rounded-full text-slate-600">
              {activeView.charAt(0).toUpperCase() + activeView.slice(1)}
            </span>
          </div>
          <div className="hidden lg:block">
            <ThermalPrinterControl />
          </div>
        </div>
        {renderCurrentView()}
      </div>
      {showReceipt && lastOrderData && (
        <Receipt 
          items={cartItems} 
          orderNumber={orderNumber} 
          onClose={handleNewOrder}
          orderSource={lastOrderData.orderSource}
          customerName={lastOrderData.customerName}
          includeCoupon={lastOrderData.includeCoupon}
        />
      )}
      {showSizeSelector && selectedItem && (
        <SizeSelector
          item={selectedItem}
          onSizeSelected={handleSizeSelected}
          onClose={() => setShowSizeSelector(false)}
        />
      )}
      
      {/* Mobile Thermal Printer Control */}
      <div className="lg:hidden">
        <ThermalPrinterControl 
          isMinimized={isThermalControlMinimized}
          onToggleMinimize={() => setIsThermalControlMinimized(!isThermalControlMinimized)}
        />
      </div>
    </div>
  )
}
