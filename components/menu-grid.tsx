"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { MenuItem } from "./menu-item"

const MENU_ITEMS = [
  {
    id: "veg-250",
    name: "Handi Veg Biryani",
    price: 169,
    image: "/vegetable-biryani.png",
    category: "Biryani",
    requiresSize: true,
    baseId: "veg",
  },
  {
    id: "paneer-250",
    name: "Handi Paneer Biryani",
    price: 169,
    image: "/paneer-biryani.jpg",
    category: "Biryani",
    requiresSize: true,
    baseId: "paneer",
  },
  {
    id: "egg-250",
    name: "Handi Egg Biryani",
    price: 169,
    image: "/egg-biryani.jpg",
    category: "Biryani",
    requiresSize: true,
    baseId: "egg",
  },
  {
    id: "chicken-250",
    name: "Handi Chicken Biryani",
    price: 220,
    image: "/flavorful-chicken-biryani.png",
    category: "Biryani",
    requiresSize: true,
    baseId: "chicken",
  },
  {
    id: "mutton-250",
    name: "Handi Mutton Biryani",
    price: 269,
    image: "/flavorful-mutton-biryani.png",
    category: "Biryani",
    requiresSize: true,
    baseId: "mutton",
  },
  {
    id: "thumbsup",
    name: "Thumbs Up 750ml",
    price: 45,
    image: "/thumbs-up-bottle.jpg",
    category: "Beverages",
    requiresSize: false,
  },
  {
    id: "coke",
    name: "Coke 750ml",
    price: 45,
    image: "/coke-bottle.jpg",
    category: "Beverages",
    requiresSize: false,
  },
  {
    id: "fanta",
    name: "Fanta 750ml",
    price: 45,
    image: "/fanta-bottle.jpg",
    category: "Beverages",
    requiresSize: false,
  },
  {
    id: "sprite",
    name: "Sprite 750ml",
    price: 45,
    image: "/clear-soda-bottle.png",
    category: "Beverages",
    requiresSize: false,
  },
]

export function MenuGrid({ onAddToCart }: { onAddToCart: (item: any) => void }) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredItems = MENU_ITEMS.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-hidden min-w-0">
      <div className="relative flex-shrink-0">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search menu..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 md:py-3.5 rounded-xl border-2 border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm md:text-base font-medium shadow-sm transition-all"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 pr-2 md:pr-4">
          {filteredItems.map((item) => (
            <MenuItem key={item.id} item={item} onAddToCart={onAddToCart} />
          ))}
        </div>
      </div>
    </div>
  )
}
