import React, { useEffect, useMemo, useState } from 'react'
import {
  Search,
  ShoppingBag,
  Truck,
  Bike,
  CheckCircle2,
  Phone,
  MapPin,
  TrendingUp,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CheckCheck,
} from 'lucide-react'

import { getCashierOrders, updateCashierOrderStatus } from '../../services/cashierService'

// --- CONSTANTS & HELPERS ---
const ITEMS_PER_PAGE = 5
const TABS = ['All Orders', 'Pending', 'Confirmed', 'Preparing', 'Ready for Driver', 'Completed']

const STATUS_BORDER_COLORS = {
  PENDING: 'border-l-4 border-l-amber-500',
  CONFIRMED: 'border-l-4 border-l-purple-500',
  PREPARING: 'border-l-4 border-l-sky-500',
  READY: 'border-l-4 border-l-neutral-800',
  COMPLETED: 'border-l-4 border-l-emerald-500',
  CANCELLED: 'border-l-4 border-l-red-500',
}

const formatStatus = (status) => (status ? status.toUpperCase() : 'PENDING')

const formatOrderType = (type) => {
  if (!type) return 'Takeaway'
  switch (type.toUpperCase()) {
    case 'DINE_IN': return 'Dine-in'
    case 'TAKEAWAY': return 'Takeaway'
    case 'DELIVERY': return 'Delivery'
    default: return type
  }
}

const formatTimeAgo = (date) => {
  if (!date) return ''
  const diffInSeconds = Math.floor((new Date() - new Date(date)) / 1000)
  if (diffInSeconds < 60) return 'Just now'
  
  const minutes = Math.floor(diffInSeconds / 60)
  if (minutes < 60) return `${minutes} mins ago`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hrs ago`
  
  return `${Math.floor(hours / 24)} days ago`
}

const getCustomerName = (order) => order.user?.name || order.customer?.name || order.customer_name || 'Guest'

const getCustomerContact = (order) => {
  if (order.customer_phone || order.phone) {
    return { type: 'phone', value: order.customer_phone || order.phone }
  }
  if (order.address || order.delivery_address) {
    return { type: 'address', value: order.address || order.delivery_address }
  }
  return { type: 'phone', value: '555-0192' }
}

const getItemsSummaryList = (order) => {
  const items = order.order_items || order.orderItems || []
  if (items.length === 0) return order.items_summary || 'No items'

  return items
    .map((item) => {
      const name = item.product?.name || item.product_name || 'Item'
      const qty = item.quantity || 1
      return `${qty}x ${name}`
    })
    .join(', ')
}

const getOrderTotal = (order) => Number(order.total || order.total_amount || order.grand_total || 0)

const getOrderIcon = (type) => {
  if (type === 'Takeaway') return <ShoppingBag className="w-5 h-5 text-amber-500" />
  if (type === 'Delivery') return <Truck className="w-5 h-5 text-sky-500" />
  return <Bike className="w-5 h-5 text-neutral-700" />
}

// --- MAIN COMPONENT ---
export default function EOrdersPage() {
  const [activeTab, setActiveTab] = useState('All Orders')
  const [searchQuery, setSearchQuery] = useState('')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await getCashierOrders()
        setOrders(response.data || [])
      } catch (err) {
        console.error('Failed to fetch cashier orders:', err)
        setError(err.response?.data?.message || 'Failed to load orders')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, searchQuery])

  const normalizedOrders = useMemo(() => {
    return orders.map((order) => ({
      id: order.id,
      orderNumber: order.order_number || order.order_code || `#E-${order.id}`,
      status: formatStatus(order.status),
      type: formatOrderType(order.order_type),
      driver: order.driver_name ? ` (Driver: ${order.driver_name})` : '',
      customer: getCustomerName(order),
      contact: getCustomerContact(order),
      timeAgo: formatTimeAgo(order.created_at || new Date()),
      itemsSummary: getItemsSummaryList(order),
      total: getOrderTotal(order),
      original: order,
    }))
  }, [orders])

  const stats = useMemo(() => {
    return normalizedOrders.reduce(
      (acc, order) => {
        const key = order.status.toLowerCase()
        if (acc[key] !== undefined) acc[key]++
        return acc
      },
      { pending: 0, confirmed: 0, preparing: 0, ready: 0, completed: 0 }
    )
  }, [normalizedOrders])

  const filteredOrders = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()

    return normalizedOrders.filter((order) => {
      const matchesTab =
        activeTab === 'All Orders' ||
        (activeTab === 'Pending' && order.status === 'PENDING') ||
        (activeTab === 'Confirmed' && order.status === 'CONFIRMED') ||
        (activeTab === 'Preparing' && order.status === 'PREPARING') ||
        (activeTab === 'Ready for Driver' && order.status === 'READY') ||
        (activeTab === 'Completed' && order.status === 'COMPLETED')

      const matchesSearch =
        !query ||
        order.orderNumber.toLowerCase().includes(query) ||
        order.customer.toLowerCase().includes(query) ||
        order.itemsSummary.toLowerCase().includes(query)

      return matchesTab && matchesSearch
    })
  }, [activeTab, searchQuery, normalizedOrders])

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE)

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredOrders, currentPage])

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateCashierOrderStatus(orderId, newStatus)
      setOrders((prev) =>
        prev.map((item) =>
          Number(item.id) === Number(orderId) ? { ...item, status: newStatus } : item
        )
      )
    } catch (err) {
      console.error('Failed to update order status:', err.response?.data || err)
      alert(err.response?.data?.message || 'Failed to update order status')
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#f7f5f2]">
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading orders...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#f7f5f2] p-8">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p className="text-sm font-semibold text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f5f2] p-6 text-[#2d2926] font-sans">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#1c1917]">E-Order Management</h1>
        <p className="text-xs text-[#78716c] mt-0.5">Monitor and process incoming online orders.</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <MetricCard label="NEW PENDING" count={stats.pending} badgeText="New" color="amber" icon={<TrendingUp className="w-3 h-3" />} />
        <MetricCard label="CONFIRMED" count={stats.confirmed} badgeText="Accepted" color="purple" icon={<CheckCircle2 className="w-3 h-3" />} />
        <MetricCard label="PREPARING" count={stats.preparing} badgeText="In Kitchen" color="sky" icon={<TrendingUp className="w-3 h-3" />} />
        <MetricCard label="READY FOR DRIVER" count={stats.ready} badgeText="Waiting" color="stone" />
        <MetricCard label="COMPLETED" count={stats.completed} badgeText="Done" color="emerald" icon={<CheckCheck className="w-3 h-3" />} />
      </div>

      {/* Search + Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative w-full md:w-80">
       
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Order ID, Customer..."
            className="w-full bg-white border border-[#e7e5e4] rounded-md pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#291e18] shadow-2xs placeholder-[#a8a29e]"
          />
        </div>

        <div className="flex items-center gap-1 bg-white border border-[#e7e5e4] p-1 rounded-md shadow-2xs overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded transition-colors shrink-0 ${
                activeTab === tab
                  ? 'bg-[#291e18] text-white shadow-2xs'
                  : 'text-[#78716c] hover:text-[#1c1917] hover:bg-[#f5f5f4]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {paginatedOrders.length === 0 ? (
          <div className="bg-white border border-[#e7e5e4] rounded-md p-12 text-center shadow-2xs">
            <p className="text-xs text-[#78716c]">No orders found for this view.</p>
          </div>
        ) : (
          paginatedOrders.map((order) => (
            <div
              key={order.id}
              className={`bg-white border border-[#e7e5e4] rounded-md shadow-2xs hover:shadow-md transition-shadow ${
                STATUS_BORDER_COLORS[order.status] || 'border-l-4 border-l-gray-300'
              }`}
            >
              <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* ID & Type */}
                <div className="flex items-center gap-3 w-full md:w-48 shrink-0">
                  <div className="w-10 h-10 rounded-md bg-[#fafaf9] border border-[#e7e5e4] flex items-center justify-center shrink-0">
                    {getOrderIcon(order.type)}
                  </div>
                  <div>
                    <h6 className="font-extrabold text-xs text-[#1c1917]">{order.orderNumber}</h6>
                    <p className="text-[11px] text-[#78716c]">
                      {order.type}
                      <span className="text-[#a8a29e]">{order.driver}</span>
                    </p>
                  </div>
                </div>

                {/* Customer */}
                <div className="w-full md:w-52 shrink-0">
                  <h4 className="font-bold text-xs text-[#1c1917]">{order.customer}</h4>
                  <p className="text-[11px] text-[#78716c] flex items-center gap-1 mt-0.5">
                    {order.contact.type === 'phone' ? (
                      <Phone className="w-3 h-3 text-[#a8a29e]" />
                    ) : (
                      <MapPin className="w-3 h-3 text-[#a8a29e]" />
                    )}
                    {order.contact.value}
                  </p>
                </div>

                {/* Items */}
                <div className="flex-1 text-xs text-[#44403c] font-medium leading-relaxed">
                  {order.itemsSummary}
                </div>

                {/* Amount & Status Badge */}
                <div className="text-right shrink-0 min-w-25">
                  <div className="text-sm font-extrabold text-[#1c1917]">
                    ${order.total.toFixed(2)}
                  </div>
                  <div className="text-[10px] font-semibold text-red-500 mt-0.5">
                    {order.timeAgo}
                  </div>
                  <div className="mt-1">
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-[#fafaf9] border-t border-[#f5f5f4] px-4 py-2.5 flex items-center justify-end gap-2 rounded-b-md">
                <OrderActions order={order} onUpdateStatus={updateOrderStatus} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredOrders.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-[#e7e5e4] px-4 py-3 rounded-md shadow-2xs">
          <p className="text-xs text-[#78716c]">
            Showing <span className="font-bold text-[#1c1917]">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
            <span className="font-bold text-[#1c1917]">{Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)}</span> of{' '}
            <span className="font-bold text-[#1c1917]">{filteredOrders.length}</span> entries
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="p-1.5 text-[#78716c] border border-[#e7e5e4] rounded hover:bg-[#f5f5f4] hover:text-[#1c1917] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 text-xs font-semibold rounded transition-colors ${
                  currentPage === page
                    ? 'bg-[#291e18] text-white'
                    : 'text-[#78716c] hover:bg-[#f5f5f4] hover:text-[#1c1917]'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className="p-1.5 text-[#78716c] border border-[#e7e5e4] rounded hover:bg-[#f5f5f4] hover:text-[#1c1917] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// --- SUB-COMPONENTS ---
function MetricCard({ label, count, badgeText, color, icon }) {
  const colorStyles = {
    amber: 'text-amber-500 text-amber-600 bg-amber-50',
    purple: 'text-purple-600 text-purple-600 bg-purple-50',
    sky: 'text-sky-600 text-sky-600 bg-sky-50',
    emerald: 'text-emerald-600 text-emerald-600 bg-emerald-50',
    stone: 'text-[#1c1917] text-[#78716c] bg-transparent',
  }[color]

  const [countColor, badgeTextColor, badgeBg] = colorStyles.split(' ')

  return (
    <div className="bg-white rounded-md border border-[#e7e5e4] p-4 shadow-2xs flex flex-col justify-between h-28">
      <span className="text-[11px] font-bold tracking-wider text-[#78716c] uppercase">{label}</span>
      <div className="flex items-baseline justify-between mt-2">
        <span className={`text-3xl font-extrabold ${countColor}`}>{count}</span>
        <span className={`text-[11px] font-medium ${badgeTextColor} ${badgeBg} px-1.5 py-0.5 rounded flex items-center gap-1`}>
          {icon}
          {badgeText}
        </span>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
    PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
    CONFIRMED: 'bg-purple-100 text-purple-800 border-purple-200',
    PREPARING: 'bg-sky-100 text-sky-800 border-sky-200',
    READY: 'bg-stone-200 text-stone-700 border-transparent',
    COMPLETED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  }

  const label = status === 'READY' ? 'READY FOR DRIVER' : status

  return (
    <span className={`inline-block text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded border ${styles[status] || ''}`}>
      {label}
    </span>
  )
}

function OrderActions({ order, onUpdateStatus }) {
  switch (order.status) {
    case 'PENDING':
      return (
        <>
          <button
            type="button"
            onClick={() => onUpdateStatus(order.id, 'CANCELLED')}
            className="px-3 py-1.5 text-xs font-semibold text-[#44403c] bg-white border border-[#d6d3d1] rounded hover:bg-[#f5f5f4] transition-colors"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => onUpdateStatus(order.id, 'CONFIRMED')}
            className="px-4 py-1.5 text-xs font-bold text-white bg-[#291e18] rounded hover:bg-[#1c1917] transition-colors shadow-2xs"
          >
            Accept Order
          </button>
        </>
      )
    case 'CONFIRMED':
      return (
        <>
          <button type="button" className="px-3 py-1.5 text-xs font-semibold text-[#44403c] bg-white border border-[#d6d3d1] rounded hover:bg-[#f5f5f4] transition-colors">
            View Details
          </button>
          <button
            type="button"
            onClick={() => onUpdateStatus(order.id, 'PREPARING')}
            className="px-4 py-1.5 text-xs font-bold text-white bg-[#291e18] rounded hover:bg-[#1c1917] transition-colors shadow-2xs"
          >
            Start Preparing
          </button>
        </>
      )
    case 'PREPARING':
      return (
        <>
          <button type="button" className="px-3 py-1.5 text-xs font-semibold text-[#44403c] bg-white border border-[#d6d3d1] rounded hover:bg-[#f5f5f4] transition-colors">
            View Details
          </button>
          <button
            type="button"
            onClick={() => onUpdateStatus(order.id, 'READY')}
            className="px-4 py-1.5 text-xs font-bold text-white bg-[#291e18] rounded hover:bg-[#1c1917] transition-colors shadow-2xs"
          >
            Ready for Driver
          </button>
        </>
      )
    case 'READY':
      return (
        <>
          <button type="button" className="px-3 py-1.5 text-xs font-semibold text-[#44403c] bg-white border border-[#d6d3d1] rounded hover:bg-[#f5f5f4] transition-colors">
            Track Driver
          </button>
          <button
            type="button"
            onClick={() => onUpdateStatus(order.id, 'COMPLETED')}
            className="px-4 py-1.5 text-xs font-bold text-white bg-[#291e18] rounded hover:bg-[#1c1917] transition-colors shadow-2xs"
          >
            Mark Completed
          </button>
        </>
      )
    case 'COMPLETED':
      return <span className="text-xs font-semibold text-emerald-600">Order completed</span>
    case 'CANCELLED':
      return <span className="text-xs font-semibold text-red-600">Order cancelled</span>
    default:
      return null
  }
}