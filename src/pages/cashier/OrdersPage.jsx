import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
  Trash2,
  Store,
  Loader2
} from 'lucide-react'

import { getCashierOrders } from '../../services/cashierService'

export default function OrdersPage() {
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  /*
  |--------------------------------------------------------------------------
  | Fetch Orders
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await getCashierOrders()

        console.log('Cashier orders:', response)

        setOrders(response.data || [])
      } catch (err) {
        console.error('Failed to fetch orders:', err)

        setError(
          err.response?.data?.message ||
          'Failed to load orders'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  /*
  |--------------------------------------------------------------------------
  | Convert Laravel Order Helpers
  |--------------------------------------------------------------------------
  */

  const getOrderCustomer = (order) => {
    if (order.user?.name) {
      return order.user.name
    }

    if (order.customer?.name) {
      return order.customer.name
    }

    if (order.customer_name) {
      return order.customer_name
    }

    return 'Walk-in'
  }

  const getOrderLocation = (order) => {
    if (order.table_session?.cafe_table?.table_number) {
      return `Table ${order.table_session.cafe_table.table_number}`
    }

    if (order.tableSession?.cafeTable?.table_number) {
      return `Table ${order.tableSession.cafeTable.table_number}`
    }

    if (order.order_source === 'E_ORDER') {
      return 'Online'
    }

    return 'Counter'
  }

  const getOrderType = (order) => {
    switch (order.order_type) {
      case 'DINE_IN':
        return 'Dine-in'

      case 'TAKEAWAY':
        return 'Takeaway'

      case 'DELIVERY':
        return 'Delivery'

      default:
        return order.order_type || 'Unknown'
    }
  }

  const getOrderStatus = (order) => {
    switch (order.status) {
      case 'PENDING':
        return 'Pending'

      case 'PREPARING':
        return 'Preparing'

      case 'READY':
        return 'Ready'

      case 'COMPLETED':
        return 'Completed'

      case 'CANCELLED':
        return 'Cancelled'

      default:
        return order.status || 'Unknown'
    }
  }

  const getOrderTotal = (order) => {
    const total =
      order.total ??
      order.total_amount ??
      order.grand_total ??
      0

    return `$${Number(total).toFixed(2)}`
  }

  const getOrderTime = (order) => {
    const date =
      order.created_at ??
      order.updated_at

    if (!date) {
      return '-'
    }

    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  /*
  |--------------------------------------------------------------------------
  | Memoized Orders Processing
  |--------------------------------------------------------------------------
  */

  const formattedOrders = useMemo(() => {
    return orders.map((order) => ({
      ...order,
      displayId: `#${order.id}`,
      customer: getOrderCustomer(order),
      table: getOrderLocation(order),
      time: getOrderTime(order),
      type: getOrderType(order),
      total: getOrderTotal(order),
      displayStatus: getOrderStatus(order)
    }))
  }, [orders])

  const filteredOrders = useMemo(() => {
    return formattedOrders.filter((order) => {
      const matchesTab =
        activeTab === 'All' ||
        order.displayStatus.toLowerCase() === activeTab.toLowerCase()

      const searchValue = searchQuery.toLowerCase()

      const matchesSearch =
        order.displayId.toLowerCase().includes(searchValue) ||
        order.customer.toLowerCase().includes(searchValue) ||
        order.table.toLowerCase().includes(searchValue)

      return matchesTab && matchesSearch
    })
  }, [formattedOrders, activeTab, searchQuery])

  /*
  |--------------------------------------------------------------------------
  | View / Edit / Delete Handlers
  |--------------------------------------------------------------------------
  */

  const handleViewDetails = (orderId) => {
    navigate('/order_detailModal', {
      state: {
        orderId
      }
    })
  }

  const handleEditOrder = (orderId) => {
    alert(`Edit order #${orderId}`)
  }

  const handleDeleteOrder = (orderId) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete order #${orderId}?`
    )

    if (!confirmed) {
      return
    }

    setOrders((previousOrders) =>
      previousOrders.filter(
        (order) => order.id !== orderId
      )
    )
  }

  /*
  |--------------------------------------------------------------------------
  | Dynamic Styles
  |--------------------------------------------------------------------------
  */

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-red-50 text-red-600 border border-red-200/50'

      case 'Preparing':
        return 'bg-amber-50 text-amber-700 border border-amber-200/50'

      case 'Ready':
        return 'bg-[#1f1611] text-amber-300'

      case 'Completed':
        return 'bg-neutral-100 text-neutral-600 border border-neutral-200/50'

      case 'Cancelled':
        return 'bg-red-100 text-red-700 border border-red-200/50'

      default:
        return 'bg-neutral-100 text-neutral-600'
    }
  }

  const getTypeStyle = () => {
    return 'bg-neutral-100 text-neutral-600 border border-neutral-200/60 font-medium'
  }

  /*
  |--------------------------------------------------------------------------
  | Loading State
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center min-w-0 bg-[var(--color-background)] font-[family-name:var(--font-body)] text-[var(--color-text)]">
        <Loader2
          size={28}
          className="animate-spin text-[var(--color-primary)]"
        />

        <p className="mt-3 text-sm font-semibold text-[var(--color-text-secondary)]">
          Loading orders...
        </p>
      </main>
    )
  }

  /*
  |--------------------------------------------------------------------------
  | Error State
  |--------------------------------------------------------------------------
  */

  if (error) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center min-w-0 bg-[var(--color-background)] font-[family-name:var(--font-body)] text-[var(--color-text)] p-8">
        <div className="bg-[var(--color-neutral)] border border-[var(--color-border)] rounded-[24px] p-8 text-center max-w-md shadow-2xs">
          <div className="text-3xl mb-3">
            ⚠️
          </div>

          <h3 className="font-[family-name:var(--font-heading)] font-bold text-base">
            Failed to load orders
          </h3>

          <p className="text-xs text-[var(--color-text-secondary)] mt-2">
            {error}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 px-5 py-2.5 bg-[#1f1611] text-white rounded-[var(--radius-pill)] text-xs font-semibold cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 flex flex-col min-w-0 p-8 space-y-6 overflow-y-auto bg-[var(--color-background)] font-[family-name:var(--font-body)] text-[var(--color-text)] select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--color-neutral)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text)] shadow-2xs">
            <Store size={20} />
          </div>

          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[var(--color-text)]">
              Orders
            </h2>

            <p className="text-xs text-[var(--color-text-secondary)] font-medium">
              Monitor cashier, dine-in, takeaway, and delivery orders.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative w-72">
            

            <input
              type="text"
              placeholder="Search ID or customer..."
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              className="w-full pl-9 pr-4 py-2 bg-[var(--color-neutral)] border border-[var(--color-border)] rounded-[var(--radius-pill)] text-xs text-[var(--color-text)] focus:outline-none focus:border-neutral-400 shadow-2xs"
            />
          </div>

          <button
            type="button"
            onClick={() => alert('Filter options clicked')}
            className="p-2.5 bg-[var(--color-neutral)] border border-[var(--color-border)] rounded-full hover:bg-[var(--color-surface)] text-[var(--color-text-secondary)] transition-colors shadow-2xs cursor-pointer flex items-center justify-center"
          >
            <SlidersHorizontal size={15} />
          </button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-6 border-b border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-secondary)] overflow-x-auto">
        {[
          'All',
          'Pending',
          'Preparing',
          'Ready',
          'Completed',
          'Cancelled'
        ].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`pb-3 relative transition-colors cursor-pointer bg-transparent border-none shrink-0 ${
              activeTab === tab
                ? 'text-[var(--color-text)] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#1f1611]'
                : 'hover:text-[var(--color-text)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-[var(--color-neutral)] border border-[var(--color-border)] rounded-[24px] shadow-2xs flex-1 flex flex-col justify-between overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider bg-[var(--color-surface)]/40">
                <th className="py-4 px-6">Order ID</th>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Table / Source</th>
                <th className="py-4 px-6">Time</th>
                <th className="py-4 px-6">Type</th>
                <th className="py-4 px-6">Total</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--color-border)] text-xs font-medium text-[var(--color-text)]">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-[var(--color-surface)]/60 transition-colors"
                  >
                    <td className="py-4 px-6 font-bold font-[family-name:var(--font-heading)]">
                      {order.displayId}
                    </td>

                    <td className="py-4 px-6 font-semibold">
                      {order.customer}
                    </td>

                    <td className="py-4 px-6 text-[var(--color-text-secondary)]">
                      {order.table}
                    </td>

                    <td className="py-4 px-6 text-[var(--color-text-secondary)]">
                      {order.time}
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-[var(--radius-pill)] text-[11px] inline-block ${getTypeStyle()}`}
                      >
                        {order.type}
                      </span>
                    </td>

                    <td className="py-4 px-6 font-bold text-[var(--color-text)]">
                      {order.total}
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-[var(--radius-pill)] text-[11px] font-bold inline-block shadow-2xs ${getStatusStyle(order.displayStatus)}`}
                      >
                        {order.displayStatus}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleViewDetails(order.id)}
                          title="View Details"
                          className="w-8 h-8 rounded-xl bg-[var(--color-surface)] hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors cursor-pointer border border-[var(--color-border)] shadow-2xs"
                        >
                          <Eye size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEditOrder(order.id)}
                          title="Edit Order"
                          className="w-8 h-8 rounded-xl bg-[var(--color-surface)] hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors cursor-pointer border border-[var(--color-border)] shadow-2xs"
                        >
                          <Edit3 size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteOrder(order.id)}
                          title="Delete Order"
                          className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors cursor-pointer border border-red-200/50 shadow-2xs"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="py-16 text-center text-neutral-400"
                  >
                    {searchQuery
                      ? `No orders found matching "${searchQuery}".`
                      : `No orders found for "${activeTab}".`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-text-secondary)] bg-[var(--color-surface)]/20">
          <span>
            Showing {filteredOrders.length} of {orders.length} orders
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled
              className="w-8 h-8 rounded-full border border-[var(--color-border)] flex items-center justify-center bg-[var(--color-neutral)] text-neutral-400 shadow-2xs cursor-not-allowed"
            >
              <ChevronLeft size={14} />
            </button>

            <span className="font-semibold px-2">
              Page 1 of 1
            </span>

            <button
              type="button"
              disabled
              className="w-8 h-8 rounded-full border border-[var(--color-border)] flex items-center justify-center bg-[var(--color-neutral)] text-neutral-400 shadow-2xs cursor-not-allowed"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}