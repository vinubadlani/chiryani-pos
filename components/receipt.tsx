"use client"

import { X, Printer, Copy } from "lucide-react"
import { useRef, useState } from "react"

interface ReceiptProps {
  items: any[]
  orderNumber: string
  onClose: () => void
}

const RESTAURANT_DETAILS = {
  name: "Chiryani",
  address: "20, Ground Floor, Padmavati Colony, Near St Paul School, Geeta Bhavan, Indore",
  fssaiLicense: "21425850010639",
  billName: "Chiryani",
}

const COUPON_CODE = "OLDUSER"
const COUPON_MESSAGE = "Get additional offer on your next bill on Zomato/Swiggy or Call us!"

export function Receipt({ items, orderNumber, onClose }: ReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const timestamp = new Date()

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText(COUPON_CODE)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    const printWindow = window.open("", "", "height=600,width=800")
    if (printWindow && receiptRef.current) {
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
              .coupon { border: 2px dashed #0891b2; padding: 12px; margin: 15px 0; text-align: center; background: #f0fafb; }
              .coupon-code { font-weight: bold; font-size: 16px; letter-spacing: 3px; color: #0891b2; }
              .coupon-msg { font-size: 11px; margin-top: 8px; color: #333; line-height: 1.3; }
              .footer { text-align: center; font-size: 11px; margin-top: 15px; border-top: 1px solid #000; padding-top: 10px; }
              .footer p { margin: 4px 0; }
            </style>
          </head>
          <body>
            <div class="receipt">
              <div class="header">
                <h1>${RESTAURANT_DETAILS.billName}</h1>
                <p>${RESTAURANT_DETAILS.address}</p>
                <p>FSSAI License: ${RESTAURANT_DETAILS.fssaiLicense}</p>
                <p style="margin-top: 8px; font-weight: bold;">Order: ${orderNumber}</p>
                <p>${timestamp.toLocaleString()}</p>
              </div>
              <div class="items">
                <div class="item" style="font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 8px;">
                  <span class="item-name">Item</span>
                  <span class="item-qty">Qty</span>
                  <span class="item-price">Total</span>
                </div>
                ${items
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
                <span>₹${total}</span>
              </div>
              <p style="text-align: center; font-size: 11px; margin: 8px 0; color: #666;">(Tax Included in Price)</p>
              <div class="coupon">
                <p style="font-size: 11px; margin: 0 0 8px 0; color: #666;">SPECIAL OFFER FOR YOU</p>
                <p class="coupon-code">${COUPON_CODE}</p>
                <p class="coupon-msg">${COUPON_MESSAGE}</p>
              </div>
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-5 flex items-center justify-between shadow-md">
          <h2 className="font-bold text-lg">Receipt</h2>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Content */}
        <div ref={receiptRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-white text-xs">
          {/* Receipt Header */}
          <div className="text-center border-b-2 border-slate-300 pb-4">
            <h1 className="text-2xl font-bold text-teal-600">{RESTAURANT_DETAILS.billName}</h1>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed font-medium">{RESTAURANT_DETAILS.address}</p>
            <p className="text-xs text-slate-600 mt-1 font-medium">FSSAI License: {RESTAURANT_DETAILS.fssaiLicense}</p>
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-sm font-bold text-slate-800">Order #{orderNumber}</p>
              <p className="text-xs text-slate-500 mt-1">{timestamp.toLocaleString()}</p>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-2">
            <div className="flex justify-between font-bold text-slate-700 border-b-2 border-slate-300 pb-2 text-xs">
              <span className="flex-1">Item</span>
              <span className="w-10 text-center">Qty</span>
              <span className="w-16 text-right">Total</span>
            </div>
            {items.map((item) => (
              <div key={item.id} className="text-xs">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-800 flex-1">{item.name}</span>
                  <span className="text-slate-600 w-10 text-center">{item.quantity}</span>
                  <span className="text-slate-800 w-16 text-right font-bold">₹{item.price * item.quantity}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t-2 border-b-2 border-slate-300 py-3">
            <div className="flex justify-between font-bold text-teal-600 text-sm">
              <span>Total Amount:</span>
              <span>₹{total}</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center font-medium">(Tax Included in Price)</p>
          </div>

          <div className="border-2 border-dashed border-teal-500 rounded-xl p-4 bg-teal-50">
            <p className="text-xs text-slate-600 mb-2 text-center font-bold">SPECIAL OFFER FOR YOU</p>
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <p className="text-lg font-bold text-teal-600 tracking-widest">{COUPON_CODE}</p>
                <p className="text-xs text-slate-600 mt-2 leading-tight font-medium">{COUPON_MESSAGE}</p>
              </div>
              <button
                onClick={handleCopyCoupon}
                className="flex-shrink-0 bg-teal-600 hover:bg-teal-700 text-white p-2.5 rounded-lg transition transform hover:scale-110"
                title="Copy coupon code"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            {copied && <p className="text-xs text-teal-600 mt-2 text-center font-bold">✓ Copied!</p>}
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-slate-600 space-y-1 pt-2">
            <p className="font-bold text-slate-800">Thank you for your order!</p>
            <p className="text-xs">Please collect your order from the counter</p>
            <p className="pt-2 border-t border-slate-200 mt-2 text-slate-500">Powered by Chiryani POS</p>
          </div>
        </div>

        <div className="border-t border-slate-200 p-4 bg-slate-50 flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-3 rounded-xl transition-all duration-200"
          >
            New Order
          </button>
        </div>
      </div>
    </div>
  )
}
