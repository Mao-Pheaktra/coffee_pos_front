import React, { useEffect, useState } from 'react'
import {
  MoreHorizontal,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { getCashierOrders } from '../../services/cashierService'

export default function RecentOrders() {
  const navigate = useNavigate()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // =========================================================
  // FETCH RECENT ORDERS
  // =========================================================
  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await getCashierOrders()

      console.log('CASHIER ORDERS RESPONSE:', response)

      let orderList = []

      if (Array.isArray(response)) {
        orderList = response
      } else if (Array.isArray(response?.data)) {
        orderList = response.data
      } else if (Array.isArray(response?.data?.data)) {
        orderList = response.data.data
      } else if (Array.isArray(response?.orders)) {
        orderList = response.orders
      } else if (Array.isArray(response?.data?.orders)) {
        orderList = response.data.orders
      }

      console.log('ORDER LIST:', orderList)

      // Show newest orders first
      orderList.sort((a, b) => {
        return Number(b?.id || 0) - Number(a?.id || 0)
      })

      // Only show latest 5
      setOrders(orderList.slice(0, 5))
    } catch (err) {
      console.error('Failed to fetch cashier orders:', err)

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Failed to load recent orders.'
      )
    } finally {
      setLoading(false)
    }
  }

  // =========================================================
  // INITIAL LOAD
  // =========================================================
  useEffect(() => {
    fetchOrders()
  }, [])

  // =========================================================
  // FORMAT ORDER TYPE
  // =========================================================
  const formatOrderType = (order) => {
    const type =
      order?.order_type ||
      order?.orderType ||
      order?.order_source ||
      order?.orderSource ||
      ''

    const normalized = String(type).toUpperCase()

    if (normalized === 'DINE_IN') {
      return 'Dine In'
    }

    if (normalized === 'TAKEAWAY') {
      return 'Takeaway'
    }

    if (normalized === 'DELIVERY') {
      return 'Delivery'
    }

    if (normalized === 'WALK_IN') {
      return 'Walk In'
    }

    if (normalized === 'E_ORDER') {
      return 'E-Order'
    }

    return type || 'Unknown'
  }

  // =========================================================
  // FORMAT STATUS
  // =========================================================
  const formatStatus = (status) => {
    if (!status) return 'Unknown'

    return String(status)
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
  }

  // =========================================================
  // STATUS STYLE
  // =========================================================
  const getStatusClass = (status) => {
    const normalized = String(status || '').toUpperCase()

    if (normalized === 'COMPLETED') {
      return 'bg-emerald-100 text-emerald-800'
    }

    if (normalized === 'PAID') {
      return 'bg-emerald-100 text-emerald-800'
    }

    if (normalized === 'CANCELLED') {
      return 'bg-red-100 text-red-800'
    }

    if (normalized === 'PREPARING') {
      return 'bg-blue-100 text-blue-800'
    }

    if (normalized === 'READY') {
      return 'bg-purple-100 text-purple-800'
    }

    if (normalized === 'PENDING') {
      return 'bg-amber-100 text-amber-800'
    }

    return 'bg-stone-100 text-stone-700'
  }

  // =========================================================
  // VIEW ALL ORDERS
  // =========================================================
  const handleViewOrders = () => {
    navigate('/order')
  }

  // =========================================================
  // LOADING
  // =========================================================
  if (loading) {
    return (
      <div className="bg-[var(--color-neutral)] border border-[var(--color-border)] rounded-[20px] p-5 shadow-xs space-y-4">

        <div className="flex items-center justify-between">
          <h3 className="font-[family-name:var(--font-heading)] font-bold text-sm">
            Recent Orders
          </h3>

          <Loader2
            size={16}
            className="animate-spin text-[var(--color-text-secondary)]"
          />
        </div>

        <div className="flex items-center justify-center py-8">
          <Loader2
            size={24}
            className="animate-spin text-[var(--color-primary)]"
          />

          <span className="ml-2 text-xs font-medium text-[var(--color-text-secondary)]">
            Loading orders...
          </span>
        </div>

      </div>
    )
  }

  // =========================================================
  // ERROR
  // =========================================================
  if (error) {
    return (
      <div className="bg-[var(--color-neutral)] border border-[var(--color-border)] rounded-[20px] p-5 shadow-xs space-y-4">

        <div className="flex items-center justify-between">
          <h3 className="font-[family-name:var(--font-heading)] font-bold text-sm">
            Recent Orders
          </h3>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-4">

          <p className="text-xs font-semibold text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchOrders}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#1f1611] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#362922]"
          >
            <RefreshCw size={13} />
            Retry
          </button>

        </div>

      </div>
    )
  }

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div className="bg-[var(--color-neutral)] border border-[var(--color-border)] rounded-[20px] p-5 shadow-xs space-y-4">

      {/* HEADER */}
      <div className="flex items-center justify-between">

        <h3 className="font-[family-name:var(--font-heading)] font-bold text-sm">
          Recent Orders
        </h3>

        <button
          type="button"
          onClick={handleViewOrders}
          className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] bg-transparent border-none cursor-pointer"
          title="View all orders"
        >
          <MoreHorizontal size={16} />
        </button>

      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">

        <table className="w-full text-left text-xs">

          <thead>
            <tr className="border-b border-[var(--color-border)] text-[var(--color-text-secondary)]">

              <th className="pb-2 font-semibold">
                Order ID
              </th>

              <th className="pb-2 font-semibold">
                Type
              </th>

              <th className="pb-2 font-semibold">
                Total
              </th>

              <th className="pb-2 font-semibold text-right">
                Status
              </th>

            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--color-border)]/40">

            {orders.length === 0 ? (

              <tr>
                <td
                  colSpan="4"
                  className="py-8 text-center text-[var(--color-text-secondary)]"
                >
                  No recent orders
                </td>
              </tr>

            ) : (

              orders.map((order) => {

                const orderId =
                  order?.id ||
                  order?.order_id ||
                  order?.orderId

                const total =
                  Number(
                    order?.total ??
                      order?.total_amount ??
                      order?.grand_total ??
                      0
                  )

                const status =
                  order?.status || 'UNKNOWN'

                return (
                  <tr key={orderId}>

                    {/* ORDER ID */}
                    <td className="py-3 font-semibold text-[var(--color-text)]">
                      #{orderId}
                    </td>

                    {/* TYPE */}
                    <td className="py-3 text-[var(--color-text-secondary)]">
                      {formatOrderType(order)}
                    </td>

                    {/* TOTAL */}
                    <td className="py-3 font-medium text-[var(--color-text)]">
                      ${total.toFixed(2)}
                    </td>

                    {/* STATUS */}
                    <td className="py-3 text-right">

                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusClass(
                          status
                        )}`}
                      >
                        {formatStatus(status)}
                      </span>

                    </td>

                  </tr>
                )
              })

            )}

          </tbody>

        </table>

      </div>

    </div>
  )
}