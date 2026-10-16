import React, { useState } from 'react'
import { X, ArrowRight } from 'lucide-react'

export default function NewOrderModal({ isOpen, onClose, onStartOrder }) {
  const [orderType, setOrderType] = useState('DINE-IN') // 'DINE-IN' or 'TAKEAWAY'
  const [selectedTable, setSelectedTable] = useState('2') // Default selection for Table 2

  if (!isOpen) return null

  // Table options matching your reference image
  const tables = [
    { id: '1', seats: 2, status: 'AVAILABLE' },
    { id: '2', seats: 2, status: 'AVAILABLE' },
    { id: '3', seats: 4, status: 'OCCUPIED' },
    { id: '4', seats: 4, status: 'AVAILABLE' },
    { id: '5', seats: 6, status: 'AVAILABLE' },
    { id: '6', seats: 2, status: 'OCCUPIED' },
    { id: '7', seats: 2, status: 'AVAILABLE' },
  ]

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="bg-[var(--color-neutral)] border border-[var(--color-border)] rounded-[24px] shadow-xl w-full max-w-xl overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="font-[family-name:var(--font-heading)] text-base font-bold text-[var(--color-text)]">
            New Order
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-2 space-y-6">
          
          {/* Order Type Toggle Switch (Dine-in / Takeaway) */}
          <div className="flex justify-center">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-1 rounded-[var(--radius-pill)] flex gap-1 w-64 shadow-2xs">
              <button
                type="button"
                onClick={() => setOrderType('DINE-IN')}
                className={`flex-1 py-2 rounded-[var(--radius-pill)] text-xs font-bold transition-colors cursor-pointer ${
                  orderType === 'DINE-IN'
                    ? 'bg-[#1f1611] text-white shadow-xs'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] bg-transparent border-none'
                }`}
              >
                DINE-IN
              </button>
              <button
                type="button"
                onClick={() => setOrderType('TAKEAWAY')}
                className={`flex-1 py-2 rounded-[var(--radius-pill)] text-xs font-bold transition-colors cursor-pointer ${
                  orderType === 'TAKEAWAY'
                    ? 'bg-[#1f1611] text-white shadow-xs'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] bg-transparent border-none'
                }`}
              >
                TAKEAWAY
              </button>
            </div>
          </div>

          {/* Dine-In Table Selection Section */}
          {orderType === 'DINE-IN' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--color-text)]">Select Table</span>
                
                {/* Status Legend */}
                <div className="flex items-center gap-4 text-[10px] text-[var(--color-text-secondary)] font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-neutral-300"></span> Available
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-200"></span> Occupied
                  </div>
                </div>
              </div>

              {/* Table Grid Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {tables.map((table) => {
                  const isOccupied = table.status === 'OCCUPIED'
                  const isSelected = selectedTable === table.id

                  return (
                    <button
                      key={table.id}
                      type="button"
                      onClick={() => !isOccupied && setSelectedTable(table.id)}
                      disabled={isOccupied}
                      className={`rounded-[18px] p-3 flex flex-col items-center justify-center h-24 transition-all relative cursor-pointer border ${
                        isOccupied 
                          ? 'bg-orange-50/50 border-orange-200/60 opacity-80 cursor-not-allowed'
                          : isSelected
                          ? 'bg-white border-[#1f1611] ring-2 ring-[#1f1611]/10 shadow-xs'
                          : 'bg-white border-[var(--color-border)] hover:border-neutral-400'
                      }`}
                    >
                      <div className="font-[family-name:var(--font-heading)] text-base font-bold text-[var(--color-text)]">
                        {table.id}
                      </div>
                      <div className="text-[10px] text-[var(--color-text-secondary)] font-medium mt-1 flex items-center gap-1">
                        <span>👥</span> {table.seats} Seats
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {orderType === 'TAKEAWAY' && (
            <div className="py-10 text-center text-xs text-[var(--color-text-secondary)] bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]/60">
              Takeaway orders do not require table selection. Proceed to start order.
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[var(--color-surface)] border-t border-[var(--color-border)] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text)] bg-transparent border-none cursor-pointer px-2 py-1"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={() => onStartOrder({ type: orderType, table: selectedTable })}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#8c7a6b] hover:bg-[#1f1611] text-white rounded-[var(--radius-pill)] text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            Start Order
            <ArrowRight size={14} />
          </button>
        </div>

      </div>

    </div>
  )
}