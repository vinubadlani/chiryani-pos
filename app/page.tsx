"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { MenuGrid } from "@/components/menu-grid"
import { Cart } from "@/components/cart"
import { Receipt } from "@/components/receipt"
import { SizeSelector } from "@/components/size-selector"
import { Dashboard } from "@/components/dashboard"
import { OrderHistory } from "@/components/order-history"
import { createOrder, CreateOrderData } from "@/lib/orders"
import { toast } from "sonner"

export default function Home() {
  const [activeView, setActiveView] = useState<'pos' | 'dashboard' | 'history'>('pos')
  const [cartItems, setCartItems] = useState<any[]>([])
  const [showReceipt, setShowReceipt] = useState(false)
  const [orderNumber, setOrderNumber] = useState("")
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [showSizeSelector, setShowSizeSelector] = useState(false)
  const [isCartMinimized, setIsCartMinimized] = useState(true)

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
          <div className="flex-1 flex gap-3 md:gap-6 p-3 md:p-6 overflow-hidden flex-col lg:flex-row">
            <MenuGrid onAddToCart={addToCart} />
            <div className="lg:w-96 flex flex-col">
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
      {renderCurrentView()}
      {showReceipt && <Receipt items={cartItems} orderNumber={orderNumber} onClose={handleNewOrder} />}
      {showSizeSelector && selectedItem && (
        <SizeSelector
          item={selectedItem}
          onSizeSelected={handleSizeSelected}
          onClose={() => setShowSizeSelector(false)}
        />
      )}
    </div>
  )
}
