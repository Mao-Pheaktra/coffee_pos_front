import React from 'react'
import { X, Check, Printer, Settings, Coffee, Croissant, Utensils } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function OrderDetailModal({ isOpen = true, onClose, orderId = '#4092' }) {
    const navigate = useNavigate()
    
    const handleReceipt = () => {
        navigate('/receipt')
    }
   

    if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-[family-name:var(--font-body)] text-[var(--color-text)] select-none animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="bg-[var(--color-neutral)] border border-[var(--color-border)] w-full max-w-4xl rounded-[28px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Top Header Bar */}
        <div className="px-8 pt-6 pb-5 border-b border-[var(--color-border)] flex items-center justify-between shrink-0 bg-white">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[var(--color-text)]">
                Order {orderId}
              </h2>
              <span className="px-2.5 py-0.5 rounded-[var(--radius-pill)] text-[11px] font-bold bg-amber-100 text-amber-800 tracking-wide">
                Preparing
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] font-medium">
              Received 4 mins ago
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[var(--color-surface)] hover:bg-neutral-200 flex items-center justify-center text-[var(--color-text)] transition-colors cursor-pointer border border-[var(--color-border)]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body: Two Column Split */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-8 overflow-y-auto flex-1 bg-[var(--color-background)]">
          
          {/* Left Column: Order Items (7 Cols) */}
          <div className="md:col-span-7 space-y-4">
            <h3 className="font-[family-name:var(--font-heading)] text-sm font-bold text-[var(--color-text)] mb-2">
              Order Items
            </h3>

            {/* Item 1: Iced Oat Latte */}
            <div className="bg-white border border-[var(--color-border)] rounded-2xl p-4 flex items-start justify-between shadow-2xs">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center text-[var(--color-text)] shrink-0 border border-neutral-200/60">
                  <Coffee size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-[var(--color-text)]">Iced Oat Latte</h4>
                  <div className="space-y-0.5 pt-1 text-[11px] text-[var(--color-text-secondary)]">
                    <div className="flex items-center gap-1.5"><span className="text-neutral-400">✓</span> Oat Milk</div>
                    <div className="flex items-center gap-1.5"><span className="text-neutral-400">✓</span> Extra Shot</div>
                    <div className="flex items-center gap-1.5"><span className="text-neutral-400">✓</span> Less Ice</div>
                  </div>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <span className="font-bold text-xs text-[var(--color-text)]">$6.50</span>
                <span className="w-6 h-6 rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] text-[11px] font-bold flex items-center justify-center border border-[var(--color-border)]">1</span>
              </div>
            </div>

            {/* Item 2: Almond Croissant */}
            <div className="bg-white border border-[var(--color-border)] rounded-2xl p-4 flex items-start justify-between shadow-2xs">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center text-[var(--color-text)] shrink-0 border border-neutral-200/60">
                  <Croissant size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-[var(--color-text)]">Almond Croissant</h4>
                  <div className="space-y-0.5 pt-1 text-[11px] text-[var(--color-text-secondary)]">
                    <div className="flex items-center gap-1.5"><span className="text-neutral-400">✓</span> Warmed</div>
                  </div>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <span className="font-bold text-xs text-[var(--color-text)]">$4.75</span>
                <span className="w-6 h-6 rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] text-[11px] font-bold flex items-center justify-center border border-[var(--color-border)]">2</span>
              </div>
            </div>

            {/* Item 3: Espresso (Voided) */}
            <div className="bg-white border border-red-200/60 rounded-2xl p-4 flex items-start justify-between shadow-2xs opacity-75">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-700 shrink-0 border border-red-100">
                  <Coffee size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-[var(--color-text)] line-through">Espresso</h4>
                  <p className="text-[11px] text-red-600 font-semibold pt-0.5">Voided by Staff</p>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <span className="font-bold text-xs text-[var(--color-text)] line-through">$3.00</span>
                <span className="w-6 h-6 rounded-lg bg-neutral-100 text-neutral-500 text-[11px] font-bold flex items-center justify-center">1</span>
              </div>
            </div>

          </div>

          {/* Right Column: Order Details & Total Summary (5 Cols) */}
          <div className="md:col-span-5 space-y-4">
            <h3 className="font-[family-name:var(--font-heading)] text-sm font-bold text-[var(--color-text)] mb-2">
              Order Details
            </h3>

            {/* Customer Pill Card */}
            <div className="bg-white border border-[var(--color-border)] rounded-2xl p-4 flex items-center gap-3 shadow-2xs">
              <div className="w-10 h-10 rounded-full bg-[#1f1611] text-amber-300 font-bold flex items-center justify-center text-xs">
                S
              </div>
              <div>
                <h4 className="font-bold text-xs text-[var(--color-text)]">Sarah Jenkins</h4>
                <p className="text-[11px] text-[var(--color-text-secondary)]">Loyalty Member</p>
              </div>
            </div>

            {/* Meta Info Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-[var(--color-border)] rounded-2xl p-3.5 space-y-1 shadow-2xs">
                <span className="text-[10px] text-[var(--color-text-secondary)] font-semibold uppercase tracking-wider">Destination</span>
                <div className="text-xs font-bold text-[var(--color-text)] flex items-center gap-1.5">
                  <Utensils size={13} className="text-neutral-400" /> Table 12
                </div>
              </div>
              <div className="bg-white border border-[var(--color-border)] rounded-2xl p-3.5 space-y-1 shadow-2xs">
                <span className="text-[10px] text-[var(--color-text-secondary)] font-semibold uppercase tracking-wider">Staff</span>
                <div className="text-xs font-bold text-[var(--color-text)] flex items-center gap-1.5">
                  👤 Michael T.
                </div>
              </div>
              <div className="bg-white border border-[var(--color-border)] rounded-2xl p-3.5 space-y-1 shadow-2xs">
                <span className="text-[10px] text-[var(--color-text-secondary)] font-semibold uppercase tracking-wider">Time</span>
                <div className="text-xs font-bold text-[var(--color-text)] flex items-center gap-1.5">
                  ⏱️ 08:42 AM
                </div>
              </div>
              <div className="bg-white border border-[var(--color-border)] rounded-2xl p-3.5 space-y-1 shadow-2xs">
                <span className="text-[10px] text-[var(--color-text-secondary)] font-semibold uppercase tracking-wider">Payment</span>
                <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  ✓ Paid
                </div>
              </div>
            </div>

            {/* Calculation Breakdown Box */}
            <div className="bg-white border border-[var(--color-border)] rounded-2xl p-4 space-y-2 text-xs shadow-2xs">
              <div className="flex justify-between text-[var(--color-text-secondary)]">
                <span>Subtotal</span>
                <span className="font-bold text-[var(--color-text)]">$16.00</span>
              </div>
              <div className="flex justify-between text-[var(--color-text-secondary)]">
                <span>Tax (8%)</span>
                <span className="font-bold text-[var(--color-text)]">$1.28</span>
              </div>
              <div className="flex justify-between text-[var(--color-text-secondary)] pb-2 border-b border-[var(--color-border)]">
                <span>Tip</span>
                <span className="font-bold text-[var(--color-text)]">$3.00</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="font-bold text-sm text-[var(--color-text)] font-[family-name:var(--font-heading)]">Total</span>
                <span className="font-black text-lg text-[var(--color-text)]">$20.28</span>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={() => alert('Order marked as ready')}
              className="w-full py-3.5 bg-[#1f1611] hover:bg-[#362922] text-white rounded-[var(--radius-pill)] text-xs font-bold transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check size={16} />
              Mark as Ready
            </button>

            {/* Secondary Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleReceipt}
                className="py-2.5 bg-white hover:bg-neutral-50 text-[var(--color-text)] border border-[var(--color-border)] rounded-[var(--radius-pill)] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Printer size={14} />
                Receipt
              </button>
              <button
                type="button"
                onClick={() => alert('Opening options menu')}
                className="py-2.5 bg-white hover:bg-neutral-50 text-[var(--color-text)] border border-[var(--color-border)] rounded-[var(--radius-pill)] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Settings size={14} />
                Options
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  )
}