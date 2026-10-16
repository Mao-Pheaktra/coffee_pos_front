import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Plus,
  Minus,
  ArrowRight,
  MoreHorizontal,
  ArrowLeft,
  Users,
  MapPin,
  Utensils,
  ShoppingBag,
  Trash2,
  XCircle,
} from 'lucide-react'

export default function PosCurrentOrderPage({
  cartItems: propCartItems = [],
  handleQuantityChange,
  onBackToCatalog,
  onClearCart,
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const stateCartItems = Array.isArray(
  location.state?.cartItems
)
  ? location.state.cartItems
  : []

const cartItems =
  propCartItems.length > 0
    ? propCartItems
    : stateCartItems

  // Read initial session context
 const orderType = location.state?.orderType || 'DINE_IN'

const tableId =
  location.state?.tableId ||
  location.state?.table?.name ||
  'Unassigned'

const initialGuests = Number(location.state?.guests || 2)
const sessionId = location.state?.sessionId || null

  // Local state for interactive guest count modification
  const [guests, setGuests] = useState(initialGuests)

  const handleGuestChange = (delta) => {
    setGuests((prev) => Math.max(1, prev + delta))
  }

 const handleProcessPayment = () => {
  navigate('/payment', {
    state: {
      tableId: orderType === 'DINE_IN' ? tableId : null,
      guests: orderType === 'DINE_IN' ? guests : null,
      sessionId: orderType === 'DINE_IN' ? sessionId : null,
      orderType,
      cartItems,
    },
  })
}

  const handleClear = () => {
    if (onClearCart) {
      onClearCart()
    } else if (handleQuantityChange) {
      // Fallback: clear all items individually if no explicit clear handler passed
      cartItems.forEach((item) => handleQuantityChange(item.id, -item.quantity))
    }
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-[#F9F6F0] p-4 sm:p-6 md:p-8">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
        {/* Navigation Action */}
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToCatalog}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-800 shadow-2xs transition-all hover:bg-stone-50 active:scale-95"
          >
            <ArrowLeft size={15} />
            <span>Back to Catalog</span>
          </button>

          {cartItems.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition-all hover:bg-rose-100 active:scale-95"
            >
              <XCircle size={15} />
              <span>Clear Cart</span>
            </button>
          )}
        </div>

        {/* Main Container */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-2xs">
          
          {/* Header & Session Metadata */}
          <div className="border-b border-stone-100 bg-[#FAF8F5] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="grid items-center gap-2.5">
                  <h2 className="text-xl font-extrabold tracking-tight text-stone-900">
                    Current Order
                  </h2>
                  <span className="rounded-xl w-15 bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                  {orderType === 'TAKEAWAY' ? 'Takeaway' : 'Dine-In'}
                </span>
                </div>
                <p className="mt-1 text-xs text-stone-500">
                  Review customer items before sending to payment
                </p>
              </div>

              <button
                type="button"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl text-stone-400 transition-colors hover:bg-stone-200/50 hover:text-stone-700"
                aria-label="More options"
              >
                <MoreHorizontal size={18} />
              </button>
            </div>

            {/* Session Info Cards */}
                        {orderType === 'DINE_IN' ? (
              <div className="mt-4 grid grid-cols-2 gap-3">

                {/* TABLE */}
                <div className="grid items-center gap-3 rounded-2xl border border-stone-200/60 bg-white p-3 shadow-2xs">
                  <div className="grid h-8 w-8 items-center justify-center rounded-xl bg-[#36241c] text-white">
                    <MapPin size={15} />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Table
                    </p>

                    <p className="text-xs font-extrabold text-stone-900">
                      {tableId}
                    </p>
                  </div>
                </div>

                {/* PARTY SIZE */}
                <div className="grid items-center justify-between rounded-2xl border border-stone-200/60 bg-white p-3 shadow-2xs">
                  <div className="grid items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-200 text-[#36241c]">
                      <Users size={15} />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                        Party Size
                      </p>

                      <p className="text-xs font-extrabold text-stone-900">
                        {guests} {guests === 1 ? 'Guest' : 'Guests'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 p-1">
                    <button
                      type="button"
                      onClick={() => handleGuestChange(-1)}
                      disabled={guests <= 1}
                      className="flex h-5 w-5 cursor-pointer items-center justify-center rounded text-stone-600 hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Minus size={11} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleGuestChange(1)}
                      className="flex h-5 w-5 cursor-pointer items-center justify-center rounded text-stone-600 hover:bg-stone-200"
                    >
                      <Plus size={11} />
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-stone-200/60 bg-white p-4 shadow-2xs">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#36241c] text-white">
                  <ShoppingBag size={17} />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Order Type
                  </p>

                  <p className="text-sm font-extrabold text-stone-900">
                    Takeaway
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Product List */}
          <div className="flex-1 p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-stone-900">
                <Utensils size={15} className="text-stone-500" />
                <h2 className="text-xs font-bold uppercase tracking-wider">
                  Ordered Products
                </h2>
              </div>
              <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-bold text-stone-600">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            <div className="max-h-[380px] space-y-3 overflow-y-auto pr-1">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 bg-[#FAF8F5] py-12 text-center">
                  <ShoppingBag size={32} className="mb-2 text-stone-300" />
                  <p className="text-xs font-semibold text-stone-600">
                    No items added to this order yet.
                  </p>
                  <button
                    type="button"
                    onClick={onBackToCatalog}
                    className="mt-3 cursor-pointer text-xs font-bold text-[#36241c] hover:underline"
                  >
                    Browse Menu & Add Items
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-stone-200/70 bg-[#FAF8F5] p-4 transition-all hover:border-stone-300"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-bold text-stone-900">
                          {item.name}
                        </h3>
                        {item.modifiers?.length > 0 && (
                          <div className="mt-2 space-y-0.5">
                            {item.modifiers.map((mod, idx) => (
                              <p
                                key={idx}
                                className="text-[11px] font-medium text-stone-500"
                              >
                                • {mod}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stepper Controls */}
                    <div className="mt-3 flex items-center justify-between border-t border-stone-200/50 pt-3">
                      <button
                        type="button"
                        className="cursor-pointer text-[11px] font-semibold text-stone-500 hover:text-stone-800"
                      >
                        + Special Request
                      </button>

                      <div className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white p-1 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.id, -1)}
                          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
                        >
                          {item.quantity === 1 ? (
                            <Trash2 size={13} className="text-rose-500" />
                          ) : (
                            <Minus size={13} />
                          )}
                        </button>

                        <span className="min-w-6 text-center text-xs font-bold text-stone-900">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Direct Action Footer */}
          <div className="border-t border-stone-200 bg-[#FAF8F5] p-5 sm:p-6">
            <button
              type="button"
              disabled={cartItems.length === 0}
              onClick={handleProcessPayment}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#36241c] py-3.5 text-xs font-bold text-white shadow-2xs transition-all hover:bg-[#241712] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span>Process Payment</span>
              <ArrowRight size={15} />
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}