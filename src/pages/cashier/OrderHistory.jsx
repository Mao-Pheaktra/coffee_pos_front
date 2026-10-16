import React, { useEffect, useMemo, useState } from 'react'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  History,
  RefreshCw,
  XCircle,
  CheckCircle2,
  ShoppingBag,
  AlertCircle,
  X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getCashierOrderHistory } from '../../services/cashierService'

export default function OrderHistory() {
  const navigate = useNavigate()

  const [orders, setOrders] = useState([])
  const [activeTab, setActiveTab] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // ==========================================
  // Fetch Order History
  // ==========================================
  const fetchOrderHistory = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await getCashierOrderHistory()
      setOrders(response?.data || [])
    } catch (err) {
      console.error('Failed to fetch order history:', err)
      setError(
        err.response?.data?.message || 'Failed to load order history'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrderHistory()
  }, [])

  // Reset pagination on search or tab change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, activeTab])

  // ==========================================
  // Format Helpers
  // ==========================================
  const formatOrderId = (id) => (id ? `#${id}` : '-')

  const getCustomerName = (order) => {
    if (order.user) {
      return (
        order.user.name ||
        order.user.username ||
        order.user.email ||
        'Customer'
      )
    }
    return 'Walk-in'
  }

  const getTableOrSource = (order) => {
    const table = order.tableSession?.cafeTable?.table_number

    if (table) return `Table ${table}`

    if (
      order.order_source === 'E_ORDER' ||
      order.order_source === 'E-ORDER'
    ) {
      return 'Online Order'
    }

    return 'Counter POS'
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
        return order.order_type || '-'
    }
  }

  const getPaymentMethod = (order) => {
    const payment = order.payments?.[0]
    if (!payment) return 'Unpaid'

    const method = payment.payment_method
    return method?.name || method?.type || 'Paid'
  }

  const getTotal = (order) => {
    const total =
      order.total_amount ??
      order.total ??
      order.grand_total ??
      order.amount ??
      0

    return Number(total).toFixed(2)
  }

  const getStatus = (status) => {
    if (!status) return '-'
    return status.charAt(0) + status.slice(1).toLowerCase()
  }

  const formatDate = (date) => {
    if (!date) return '-'

    const parsedDate = new Date(date)
    if (Number.isNaN(parsedDate.getTime())) return date

    return parsedDate.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // ==========================================
  // Status Badges
  // ==========================================
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200'
      case 'READY':
        return 'bg-sky-50 text-sky-700 border-sky-200'
      case 'PREPARING':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'CONFIRMED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200'
      case 'PENDING':
        return 'bg-orange-50 text-orange-700 border-orange-200'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  // ==========================================
  // Filter & Paginate Orders
  // ==========================================
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const status = order.status || ''

      const matchesTab =
        activeTab === 'All' ||
        status.toLowerCase() === activeTab.toLowerCase()

      const customer = getCustomerName(order)
      const orderId = String(order.id || '')
      const search = searchQuery.toLowerCase()

      const matchesSearch =
        orderId.toLowerCase().includes(search) ||
        customer.toLowerCase().includes(search) ||
        getTableOrSource(order).toLowerCase().includes(search)

      return matchesTab && matchesSearch
    })
  }, [orders, activeTab, searchQuery])

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredOrders, currentPage, itemsPerPage])

  // Navigation logic
  const handleViewDetails = (orderId) => {
    navigate('/order_detailModal', { state: { orderId } })
  }

  // Metrics calculation
  const completedCount = useMemo(
    () => orders.filter((order) => order.status === 'COMPLETED').length,
    [orders]
  )

  const cancelledCount = useMemo(
    () => orders.filter((order) => order.status === 'CANCELLED').length,
    [orders]
  )

  const tabs = [
    'All',
    'Completed',
    'Cancelled',
    'Pending',
    'Confirmed',
    'Preparing',
    'Ready',
  ]

  return (
    <main className="flex-1 flex flex-col min-w-0 p-6 md:p-8 space-y-6 overflow-y-auto bg-slate-50 text-slate-800">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
            <History size={22} className="text-slate-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Order History
            </h1>
            <p className="text-xs font-medium text-slate-500">
              View and manage all recent transactions and status records.
            </p>
          </div>
        </div>

        {/* Search & Refresh Actions */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-72">
           
            <input
              type="text"
              placeholder="Search order ID, customer, table..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={fetchOrderHistory}
            disabled={loading}
            title="Refresh Orders"
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50 shrink-0"
          >
            <RefreshCw
              size={16}
              className={loading ? 'animate-spin text-slate-900' : ''}
            />
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Orders
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {orders.length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <ShoppingBag size={20} />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
              Completed
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {completedCount}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">
              Cancelled
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {cancelledCount}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <XCircle size={20} />
          </div>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 shrink-0 cursor-pointer ${
                isActive
                  ? 'border-slate-900 text-slate-900 bg-white shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
              }`}
            >
              {tab}
            </button>
          )
        })}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between gap-4 text-rose-800">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-rose-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold">{error}</p>
              <p className="text-[11px] text-rose-600 mt-0.5">
                Please check backend services or API connections.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchOrderHistory}
            className="px-3 py-1.5 bg-white border border-rose-300 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors shadow-xs"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Table & Loading Content */}
      {loading ? (
        <div className="flex-1 min-h-90 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-center shadow-xs">
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <Loader2 size={24} className="animate-spin text-slate-700" />
            <p className="text-xs font-semibold">Loading orders...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-237.5">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Order ID</th>
                  <th className="py-3.5 px-5">Customer</th>
                  <th className="py-3.5 px-5">Source / Table</th>
                  <th className="py-3.5 px-5">Type</th>
                  <th className="py-3.5 px-5">Total</th>
                  <th className="py-3.5 px-5">Payment</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-5 font-bold text-slate-900">
                        {formatOrderId(order.id)}
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-slate-900">
                        {getCustomerName(order)}
                      </td>
                      <td className="py-3.5 px-5 text-slate-600">
                        {getTableOrSource(order)}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium">
                          {getOrderType(order)}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-bold text-slate-900">
                        ${getTotal(order)}
                      </td>
                      <td className="py-3.5 px-5 text-slate-600">
                        {getPaymentMethod(order)}
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusBadgeStyle(
                            order.status
                          )}`}
                        >
                          {getStatus(order.status)}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-slate-500 whitespace-nowrap">
                        {formatDate(order.created_at || order.updated_at)}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => handleViewDetails(order.id)}
                          title="View Details"
                          className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-200/70 text-slate-700 inline-flex items-center justify-center transition-colors border border-slate-200 shadow-xs cursor-pointer"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <History
                          size={36}
                          className="text-slate-300 mb-2 stroke-[1.5]"
                        />
                        <p className="text-sm font-semibold text-slate-800">
                          No orders found
                        </p>
                        <p className="text-xs text-slate-400 mt-1 max-w-xs">
                          There are no orders matching your selected filters or search terms.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer / Pagination Controls */}
          <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
            <span>
              Showing{' '}
              <strong className="text-slate-800">
                {filteredOrders.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
              </strong>{' '}
              to{' '}
              <strong className="text-slate-800">
                {Math.min(currentPage * itemsPerPage, filteredOrders.length)}
              </strong>{' '}
              of <strong className="text-slate-800">{filteredOrders.length}</strong> entries
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center bg-white text-slate-600 shadow-xs hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="font-semibold text-slate-700 px-1">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || filteredOrders.length === 0}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center bg-white text-slate-600 shadow-xs hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}