import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Utensils,
  Bell,
  QrCode,
  Loader2,
  AlertCircle,
  RefreshCw,
  Banknote,
  CheckCircle2,
} from 'lucide-react'
import BottomNav from '../common/BottomNav'
import { getCustomerTableOrders } from '../../services/tableService'

export default function TotalPage() {
  const navigate = useNavigate()

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
  const [paymentMethod, setPaymentMethod] = useState('khqr')
  const [isPaid, setIsPaid] = useState(false)

  const fetchActiveOrders = useCallback(
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

        const activeOrders = normalizedOrders.filter(
          (order) => String(order.status).toUpperCase() !== 'CANCELLED'
        )

        setOrders(activeOrders)
      } catch (err) {
        console.error('Failed to load session items:', err)
        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to load bill items.'
        )
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [sessionCode]
  )

  useEffect(() => {
    fetchActiveOrders(true)
  }, [fetchActiveOrders])

  const allItems = orders.flatMap(
    (order) => order?.order_items || order?.orderItems || []
  )

  const getItemName = (item) =>
    item?.product?.name || item?.product_name || item?.name || 'Product'

  const getItemPrice = (item) =>
    Number(item?.price ?? item?.product?.price ?? 0)

  const getItemQty = (item) => Number(item?.quantity ?? 1)

  const getItemImage = (item) =>
    item?.product?.image_url || item?.product?.image || item?.image || null

  // Strictly calculate total based only on product prices * quantity
  const totalDue = allItems.reduce(
    (sum, item) => sum + getItemPrice(item) * getItemQty(item),
    0
  )

  const handleProcessPayment = () => {
    setIsPaid(true)
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 md:p-6 font-sans">
      <div className="w-full max-w-100 min-h-screen md:min-h-210 md:rounded-3xl bg-white md:border md:border-slate-200 shadow-lg overflow-hidden flex flex-col relative">
        
        {/* Top Header */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-2">
            <Utensils size={18} className="text-slate-700" />
            <h1 className="text-base font-bold text-slate-900">
              Table {tableNumber}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={refreshing}
              onClick={() => fetchActiveOrders(false)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={refreshing ? 'animate-spin' : ''}
              />
            </button>
            <button
              type="button"
              onClick={() => alert('Calling staff assistance...')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <Bell size={13} className="text-slate-600" />
              Staff
            </button>
          </div>
        </div>

        {/* Scrollable Main Area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-28">
          
          <div>
            <h2 className="text-xl font-bold text-slate-900">Checkout</h2>
            <p className="text-xs text-slate-500">
              Review your items and complete payment.
            </p>
          </div>

          {loading && (
            <div className="flex justify-center py-10">
              <Loader2 size={24} className="animate-spin text-slate-600" />
            </div>
          )}

          {error && !loading && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {isPaid && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center space-y-2">
              <CheckCircle2 size={32} className="mx-auto text-emerald-600" />
              <h3 className="text-sm font-bold text-emerald-950">
                Payment Request Sent
              </h3>
              <p className="text-xs text-emerald-700">
                Staff have been notified to verify your table checkout.
              </p>
            </div>
          )}

          {!loading && !error && !isPaid && (
            <>
              {/* Item List */}
              <div className="border border-slate-200 rounded-xl p-3 space-y-3">
                <h3 className="text-xs font-bold text-slate-700 border-b border-slate-100 pb-2">
                  Ordered Items ({allItems.length})
                </h3>

                {allItems.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-3">
                    No active items.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {allItems.map((item, index) => {
                      const name = getItemName(item)
                      const price = getItemPrice(item)
                      const qty = getItemQty(item)
                      const itemTotal = price * qty
                      const image = getItemImage(item)

                      return (
                        <div
                          key={item.id || index}
                          className="flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {image && (
                              <img
                                src={image}
                                alt={name}
                                className="w-10 h-10 rounded-md object-cover border border-slate-100 shrink-0"
                              />
                            )}
                            <div className="min-w-0">
                              <h4 className="font-semibold text-slate-900 truncate">
                                {name}
                              </h4>
                              <p className="text-[11px] text-slate-500">
                                ${price.toFixed(2)} × {qty}
                              </p>
                            </div>
                          </div>

                          <span className="font-bold text-slate-900 shrink-0">
                            ${itemTotal.toFixed(2)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Pure Product Total Summary */}
              <div className="border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">
                  Total Due
                </span>
                <span className="text-lg font-bold text-slate-900">
                  ${totalDue.toFixed(2)}
                </span>
              </div>

              {/* Payment Section */}
              <div className="border border-slate-200 rounded-xl p-3 space-y-3">
                <h3 className="text-xs font-bold text-slate-700">
                  Payment Method
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('khqr')}
                    className={`py-2 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1.5 ${
                      paymentMethod === 'khqr'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    <QrCode size={14} /> KHQR
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`py-2 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1.5 ${
                      paymentMethod === 'cash'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    <Banknote size={14} /> Cash
                  </button>
                </div>

                {paymentMethod === 'khqr' ? (
                  <div className="border border-slate-200 rounded-lg p-3 text-center space-y-2">
                    <span className="text-xs font-semibold text-slate-700 block">
                      Scan KHQR Code
                    </span>
                    <div className="w-28 h-28 mx-auto bg-slate-900 rounded-lg p-2 flex items-center justify-center text-white">
                      <QrCode size={64} />
                    </div>
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-600">
                      Pay cash directly to our server at your table.
                    </p>
                  </div>
                )}

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    disabled={allItems.length === 0}
                    onClick={handleProcessPayment}
                    className="w-full py-2.5 px-4 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 disabled:opacity-50"
                  >
                    {paymentMethod === 'khqr' ? 'Pay with KHQR' : 'Pay Cash'}
                  </button>

                  <button
                    type="button"
                    onClick={() => alert('Opening split bill configuration...')}
                    className="w-full py-2 px-4 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                  >
                    Split Bill
                  </button>
                </div>
              </div>
            </>
          )}

        </div>

  

      </div>
    </div>
  )
}