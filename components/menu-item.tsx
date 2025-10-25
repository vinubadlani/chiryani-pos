"use client"

import { Plus } from "lucide-react"

interface MenuItemProps {
  item: {
    id: string
    name: string
    price: number
    image: string
    category: string
  }
  onAddToCart: (item: any) => void
}

export function MenuItem({ item, onAddToCart }: MenuItemProps) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-teal-200 group">
      <div className="relative h-40 md:h-44 bg-slate-100 overflow-hidden">
        <img
          src={item.image || "/placeholder.svg"}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-sm md:text-base text-slate-800 truncate">{item.name}</h3>
        <p className="text-xs text-slate-500 mb-3 font-medium">{item.category}</p>
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg text-teal-600">₹{item.price}</span>
          <button
            onClick={() => onAddToCart(item)}
            className="bg-teal-600 hover:bg-teal-700 text-white p-2.5 rounded-lg transition-all duration-200 transform hover:scale-110 shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
