import React from 'react'
import { ArrowLeft, CheckCircle2, Clock, UserCheck } from 'lucide-react'

export default function CheckInPage({ tableId = 'Table 3', reservation = { name: 'Smith', time: '18:30', guests: 6 }, onBack }) {
  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col font-[family-name:var(--font-body)] text-[var(--color-text)] select-none">
      <div className="bg-[var(--color-neutral)] border-b border-[var(--color-border)] px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button type="button" onClick={onBack} className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--color-surface)] cursor-pointer">
            <ArrowLeft size={16} />
          </button>
          <h1 className="font-bold text-lg">Check-In Reservation — {tableId}</h1>
        </div>
      </div>

      <div className="flex-1 p-8 max-w-xl mx-auto w-full flex items-center">
        <div className="bg-[var(--color-neutral)] border border-[var(--color-border)] rounded-[24px] p-8 w-full space-y-6 shadow-sm">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto text-lg font-bold">
              📅
            </div>
            <h2 className="font-bold text-lg">Reservation Details</h2>
            <p className="text-xs text-[var(--color-text-secondary)]">Confirm guest arrival to seat this table.</p>
          </div>

          <div className="bg-white border border-[var(--color-border)] rounded-2xl p-5 space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-neutral-100">
              <span className="text-[var(--color-text-secondary)]">Party Name</span>
              <span className="font-bold text-[var(--color-text)]">{reservation.name} Family</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-100">
              <span className="text-[var(--color-text-secondary)]">Scheduled Time</span>
              <span className="font-bold text-[var(--color-text)]">{reservation.time}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[var(--color-text-secondary)]">Reserved Seats</span>
              <span className="font-bold text-[var(--color-text)]">{reservation.guests} Guests</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => alert(`Checked in ${reservation.name} for ${tableId}! Table is now Occupied.`)}
            className="w-full py-3.5 bg-[#1f1611] hover:bg-[#362922] text-white rounded-full text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <UserCheck size={16} />
            Confirm Check-In & Seat Table
          </button>
        </div>
      </div>
    </div>
  )
}