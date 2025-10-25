"use client"

import { X } from "lucide-react"

interface SizeSelectorProps {
  item: any
  onSizeSelected: (item: any) => void
  onClose: () => void
}

const SIZES = [
  { size: "250g", multiplier: 1 },
  { size: "500g", multiplier: 1.5 },
  { size: "1kg", multiplier: 2.3 },
]

export function SizeSelector({ item, onSizeSelected, onClose }: SizeSelectorProps) {
  const handleSizeSelect = (size: string, multiplier: number) => {
    const basePrice = item.price
    const newPrice = Math.round(basePrice * multiplier)
    const newId = `${item.baseId}-${size.replace("g", "").replace("kg", "000")}`

    onSizeSelected({
      ...item,
      id: newId,
      name: `${item.name} ${size}`,
      price: newPrice,
      size: size,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-6 flex items-center justify-between">
          <h2 className="font-bold text-lg">Select Size</h2>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm font-bold text-slate-800 mb-1">{item.name}</p>
            <p className="text-xs text-slate-500">Choose your preferred portion size</p>
          </div>

          <div className="space-y-3">
            {SIZES.map((sizeOption) => (
              <button
                key={sizeOption.size}
                onClick={() => handleSizeSelect(sizeOption.size, sizeOption.multiplier)}
                className="w-full p-4 border-2 border-slate-200 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all duration-200 text-left font-semibold group"
              >
                <div className="flex justify-between items-center">
                  <span className="text-slate-800 group-hover:text-teal-700 font-bold">{sizeOption.size}</span>
                  <span className="text-teal-600 font-bold text-lg">
                    ₹{Math.round(item.price * sizeOption.multiplier)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
