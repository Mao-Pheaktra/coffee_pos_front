import React, {
  useCallback,
  useEffect,
  useState,
} from 'react'

import {
  ArrowLeft,
  ClipboardList,
  Loader2,
  RefreshCw,
  AlertCircle,
  Ban,
  UtensilsCrossed,
  CreditCard,
} from 'lucide-react'

import { useLocation, useNavigate } from 'react-router-dom'

import {
  getCustomerTableOrders,
  cancelCustomerOrder,
} from '../../services/tableService'

export default function CurrentOrderPage() {
  const navigate = useNavigate()
  const location = useLocation()

  // =========================================================
  // TABLE INFORMATION
  // =========================================================

  const [tableNumber] = useState(
    location.state?.tableNumber ||
      localStorage.getItem('cafe_table') ||
      ''
  )

  const [tableId] = useState(
    location.state?.tableId ||
      localStorage.getItem('cafe_table_id') ||
      ''
  )

  const [sessionId] = useState(
    location.state?.sessionId ||
      localStorage.getItem('table_session_id') ||
      ''
  )

  const [sessionCode] = useState(
    location.state?.sessionCode ||
      localStorage.getItem('table_session_code') ||
      ''
  )

  // =========================================================
  // DATA & STATES
  // =========================================================

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [cancellingId, setCancellingId] = useState(null)
  const [error, setError] = useState('')

  // =========================================================
  // LOAD ORDERS
  // =========================================================

  const fetchOrders = useCallback(
    async (showLoading = true) => {
      if (!sessionCode) {
        setError('Table session is missing.')
        setLoading(false)
        return
      }

      try {
        if (showLoading) {
          setLoading(true)
        } else {
          setRefreshing(true)
        }

        setError('')

        const response = await getCustomerTableOrders(sessionCode)
        const data = response?.data ?? response ?? []
        const normalizedOrders = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : []

        // Filter out orders that have a CANCELLED status on load
        const activeOrders = normalizedOrders.filter(
          (order) => String(order.status).toUpperCase() !== 'CANCELLED'
        )

        setOrders(activeOrders)
      } catch (err) {
        console.error('Failed to load table orders:', err)
        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to load current orders.'
        )
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [sessionCode]
  )

  useEffect(() => {
    fetchOrders(true)
  }, [fetchOrders])

  useEffect(() => {
    if (tableNumber) localStorage.setItem('cafe_table', tableNumber)
    if (tableId) localStorage.setItem('cafe_table_id', tableId)
    if (sessionId) localStorage.setItem('table_session_id', sessionId)
    if (sessionCode) localStorage.setItem('table_session_code', sessionCode)
  }, [tableNumber, tableId, sessionId, sessionCode])

  // =========================================================
  // ORDER CANCELLATION & INSTANT REMOVAL
  // =========================================================

  const handleCancelOrder = async (orderId) => {
    const isConfirmed = window.confirm(
      'Are you sure you want to cancel this order?'
    )
    if (!isConfirmed) return

    try {
      setCancellingId(orderId)
      setError('')

      if (typeof cancelCustomerOrder === 'function') {
        await cancelCustomerOrder(orderId, sessionCode)
      }

      // Optimistically remove the cancelled order from local state immediately
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.id !== orderId)
      )

      // Fetch latest state from server without showing global loading spinner
      await fetchOrders(false)
    } catch (err) {
      console.error('Failed to cancel order:', err)
      setError(
        err.response?.data?.message ||
          err.message ||
          'Could not cancel order. Please ask a staff member.'
      )
    } finally {
      setCancellingId(null)
    }
  }

  // =========================================================
  // HELPERS & NAVIGATION
  // =========================================================

  const getItemName = (item) =>
    item?.product?.name || item?.product_name || item?.name || 'Product'

  const getItemPrice = (item) =>
    Number(item?.price ?? item?.product?.price ?? 0).toFixed(2)

  const getItemImage = (item) =>
    item?.product?.image_url || item?.product?.image || item?.image || null

  const getOrderItems = (order) => order?.order_items || order?.orderItems || []

  const canCancelStatus = (status) => {
    const normalized = String(status || '').toUpperCase()
    return normalized === 'PENDING' || normalized === 'CONFIRMED'
  }

  const handleBack = () => {
    navigate('/mobile_menu', {
      state: { tableNumber, tableId, sessionId, sessionCode },
    })
  }

  const handleGoToPayment = () => {
    navigate('/total', {
      state: { tableNumber, tableId, sessionId, sessionCode },
    })
  }

  // =========================================================
  // RENDER STATES
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Loader2 size={26} className="animate-spin text-slate-800" />
          </div>
          <h1 className="text-lg font-bold text-slate-900">
            Loading Your Orders
          </h1>
        </div>
      </div>
    )
  }

  if (error && !orders.length) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-4">
            <AlertCircle size={26} className="text-red-500" />
          </div>
          <h1 className="text-lg font-bold text-slate-900">
            Unable to Load Orders
          </h1>
          <p className="text-xs text-slate-500 mt-2">{error}</p>
          <button
            type="button"
            onClick={() => fetchOrders(true)}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-semibold"
          >
            <RefreshCw size={14} /> Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 md:p-6">
      <div className="w-full max-w-md min-h-screen md:min-h-[840px] md:rounded-3xl bg-slate-50 md:border md:border-slate-200 shadow-xl overflow-hidden flex flex-col">
        {/* HEADER */}
        <div className="px-5 py-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-base font-bold text-slate-900">
              Your Orders
            </h1>
          </div>
          <button
            type="button"
            disabled={refreshing}
            onClick={() => fetchOrders(false)}
            className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 disabled:opacity-50 transition-colors"
          >
            <RefreshCw
              size={16}
              className={refreshing ? 'animate-spin' : ''}
            />
          </button>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {orders.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center mt-6">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <ClipboardList size={28} className="text-slate-400" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                No Active Orders
              </h2>
              <button
                type="button"
                onClick={handleBack}
                className="mt-6 px-6 py-3 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            orders.map((order) => {
              const items = getOrderItems(order)
              const canCancel = canCancelStatus(order.status)
              const isCancelling = cancellingId === order.id

              return items.map((item, itemIndex) => {
                const itemName = getItemName(item)
                const itemPrice = getItemPrice(item)
                const imageUrl = getItemImage(item)

                return (
                  <div
                    key={`${order.id}-${item.id || itemIndex}`}
                    className="bg-white border border-slate-200 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-sm"
                  >
                    {/* PRODUCT IMAGE & INFO */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={itemName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UtensilsCrossed size={20} className="text-slate-400" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-slate-900 truncate">
                          {itemName}
                        </h3>
                        <p className="text-xs font-semibold text-slate-600 mt-1">
                          ${itemPrice}
                        </p>
                      </div>
                    </div>

                    {/* CANCEL BUTTON */}
                    {canCancel && (
                      <button
                        type="button"
                        disabled={isCancelling}
                        onClick={() => handleCancelOrder(order.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 text-xs font-semibold transition-colors disabled:opacity-50 shrink-0"
                      >
                        {isCancelling ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Ban size={14} />
                        )}
                        Cancel
                      </button>
                    )}
                  </div>
                )
              })
            })
          )}
        </div>

        {/* BOTTOM PAYMENT BUTTON */}
        {orders.length > 0 && (
          <div className="p-4 bg-white border-t border-slate-200 shrink-0">
            <button
              type="button"
              onClick={handleGoToPayment}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <CreditCard size={16} />
              Proceed to Payment
            </button>
          </div>
        )}
      </div>
    </div>
  )
}