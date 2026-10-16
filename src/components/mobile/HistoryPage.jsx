import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Utensils,
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import BottomNav from '../common/BottomNav'
import { getCustomerTableOrders } from '../../services/tableService'

export default function HistoryPage() {
  const navigate = useNavigate()

  // Retrieve table information from localStorage or session
  const [tableNumber] = useState(
    localStorage.getItem('cafe_table') || 'T03'
  )
  const [sessionCode] = useState(
    localStorage.getItem('table_session_code') || ''
  )

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  // =========================================================
  // FETCH ALL ORDERS (ACTIVE & CANCELLED)
  // =========================================================
  const fetchOrderHistory = useCallback(
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

        setOrders(normalizedOrders)
      } catch (err) {
        console.error('Failed to load order history:', err)
        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to load order history.'
        )
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [sessionCode]
  )

  useEffect(() => {
    fetchOrderHistory(true)
  }, [fetchOrderHistory])

  // =========================================================
  // HELPERS
  // =========================================================
  const getOrderItems = (order) =>
    order?.order_items || order?.orderItems || []

  const getItemName = (item) =>
    item?.product?.name || item?.product_name || item?.name || 'Item'

  const calculateTotalAmount = (items) => {
    return items.reduce((sum, item) => {
      const price = Number(item?.price ?? item?.product?.price ?? 0)
      const qty = Number(item?.quantity ?? 1)
      return sum + price * qty
    }, 0)
  }

  const formatSummary = (items) => {
    if (!items.length) return 'No item details'
    return items
      .map((item) => `${item.quantity || 1}x ${getItemName(item)}`)
      .join(', ')
  }

  const renderStatusBadge = (status) => {
    const normalized = String(status || '').toUpperCase()

    if (normalized === 'CANCELLED') {
      return (
        <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2.5 py-1 rounded-[var(--radius-pill)] text-[11px] font-semibold">
          <XCircle size={12} />
          <span>Cancelled</span>
        </div>
      )
    }

    if (normalized === 'COMPLETED') {
      return (
        <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-[var(--radius-pill)] text-[11px] font-semibold">
          <CheckCircle2 size={12} />
          <span>Completed</span>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-[var(--radius-pill)] text-[11px] font-semibold">
        <Clock size={12} />
        <span className="capitalize">{status || 'Processing'}</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-0 md:p-6 font-[family-name:var(--font-body)]">
      {/* Phone Screen Container */}
      <div className="w-full max-w-[400px] min-h-screen md:min-h-[840px] md:rounded-[40px] bg-[var(--color-background)] md:border-8 md:border-[var(--color-border)] shadow-xl overflow-hidden flex flex-col relative">
        {/* Top Header: Table & Refresh/Call Staff */}
        <div className="px-5 pt-6 pb-4 flex items-center justify-between border-b border-[var(--color-border)]/50 shrink-0 bg-[var(--color-background)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[var(--color-secondary-light)] text-[var(--color-primary)] flex items-center justify-center">
              <Utensils size={18} />
            </div>
            <h1 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[var(--color-text)]">
              Table {tableNumber}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={refreshing}
              onClick={() => fetchOrderHistory(false)}
              className="p-2 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-secondary-light)] transition-colors disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={refreshing ? 'animate-spin' : ''}
              />
            </button>
            <button
              type="button"
              onClick={() => alert('Calling staff assistance...')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-pill)] bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] hover:bg-[var(--color-secondary-light)] transition-colors cursor-pointer shadow-xs"
            >
              <Bell size={13} className="text-[var(--color-primary)]" />
              Call Staff
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden px-5 py-6 space-y-6 pb-32">
          {/* Section Heading */}
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[var(--color-text)] tracking-tight mb-1">
              Order History
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Review your current session orders and cancelled items.
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Loader2 size={24} className="animate-spin text-[var(--color-primary)] mb-2" />
              <p className="text-xs text-[var(--color-text-secondary)]">Loading history...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="rounded-[var(--radius-xl)] bg-red-50 border border-red-200 p-4 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && orders.length === 0 && (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-8 text-center">
              <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
                No orders found for this session.
              </p>
            </div>
          )}

          {/* History List */}
          {!loading && orders.length > 0 && (
            <div className="space-y-4">
              {orders.map((order, index) => {
                const items = getOrderItems(order)
                const totalAmount = calculateTotalAmount(items)
                const itemsSummary = formatSummary(items)
                const isCancelled = String(order.status).toUpperCase() === 'CANCELLED'

                return (
                  <div
                    key={order.id || index}
                    className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-4 shadow-xs space-y-3.5 ${
                      isCancelled ? 'opacity-75' : ''
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between border-b border-[var(--color-border)]/40 pb-3">
                      <div>
                        <span className="text-[11px] font-semibold text-[var(--color-primary)] block mb-0.5">
                          Order #{order.id ? String(order.id).slice(-4) : index + 1}
                        </span>
                        <h3 className="font-[family-name:var(--font-heading)] text-xs font-bold text-[var(--color-text)]">
                          {order.created_at
                            ? new Date(order.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Recent'}
                        </h3>
                      </div>

                      {renderStatusBadge(order.status)}
                    </div>

                    {/* Items Description */}
                    <div>
                      <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed line-clamp-2">
                        {itemsSummary}
                      </p>
                    </div>

                    {/* Footer Details & Re-order Action */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-[10px] text-[var(--color-text-secondary)] block">
                          Total ({items.length} {items.length === 1 ? 'item' : 'items'})
                        </span>
                        <span
                          className={`font-[family-name:var(--font-heading)] text-sm font-bold ${
                            isCancelled
                              ? 'line-through text-[var(--color-text-secondary)]'
                              : 'text-[var(--color-text)]'
                          }`}
                        >
                          ${totalAmount.toFixed(2)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate('/mobile_menu')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius-pill)] bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] hover:bg-[var(--color-secondary-light)] transition-colors cursor-pointer shadow-2xs"
                      >
                        <RotateCcw size={13} className="text-[var(--color-primary)]" />
                        Reorder
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}