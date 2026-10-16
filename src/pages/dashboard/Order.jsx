import React, { useEffect, useMemo, useState, useCallback } from 'react'
import {
  Search,
  Plus,
  Filter,
  Eye,
  Edit,
  Trash2,
  ShoppingCart,
  Clock,
  Flame,
  CheckCircle,
  XCircle,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Package,
  User,
  Receipt,
} from 'lucide-react'

import {
  getAdminOrders,
  getAdminOrder,
  updateAdminOrder,
  deleteAdminOrder,
} from '../../services/adminOrderService'

// =========================
// HELPER FUNCTIONS
// =========================
const normalizeStatus = (order) =>
  String(order?.status || order?.order_status || '').toUpperCase()

const getStatusLabel = (status) => {
  const map = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    PREPARING: 'Preparing',
    READY: 'Ready',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  }

  return (
    map[status] ||
    (status
      ? status.charAt(0) + status.slice(1).toLowerCase()
      : 'Unknown')
  )
}

const getSource = (order) => {
  const source = String(
    order?.order_source || order?.source || ''
  ).toUpperCase()

  if (source === 'E_ORDER') return 'E-Order'
  if (source === 'WALK_IN') return 'Walk-In'

  return source || '—'
}

const getType = (order) => {
  const type = String(
    order?.order_type || order?.type || ''
  ).toUpperCase()

  if (type === 'DINE_IN') return 'Dine-In'
  if (type === 'TAKEAWAY') return 'Takeaway'
  if (type === 'DELIVERY') return 'Delivery'

  return type || '—'
}

const getOrderId = (order) =>
  order?.order_number ||
  order?.order_no ||
  order?.code ||
  `ORD-${order?.id}`

const getCustomerName = (order) => {
  if (order?.user?.name) return order.user.name
  if (order?.customer?.name) return order.customer.name
  if (order?.customer_name) return order.customer_name

  if (order?.table?.table_number) {
    return `Table ${order.table.table_number}`
  }

  if (order?.cafe_table?.table_number) {
    return `Table ${order.cafe_table.table_number}`
  }

  return 'Walk-in Customer'
}

const getItems = (order) => {
  const items = order?.order_items || order?.items || []

  if (!Array.isArray(items) || items.length === 0) {
    return 'No items'
  }

  return items
    .map(
      (item) =>
        `${item?.quantity || 1}x ${
          item?.product?.name ||
          item?.product_name ||
          item?.name ||
          'Product'
        }`
    )
    .join(', ')
}

const getItemCount = (order) => {
  const items = order?.order_items || order?.items || []

  if (!Array.isArray(items)) return 0

  return items.reduce(
    (sum, item) => sum + Number(item?.quantity || 1),
    0
  )
}

const getTotal = (order) =>
  Number(
    order?.total_amount ??
      order?.total ??
      order?.grand_total ??
      order?.amount ??
      0
  )

const formatMoney = (amount) =>
  `$${Number(amount || 0).toFixed(2)}`

const formatDateTime = (order) => {
  const value =
    order?.created_at ||
    order?.order_date ||
    order?.createdAt

  if (!value) return '—'

  const date = new Date(value)

  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString([], {
        hour: '2-digit',
        minute: '2-digit',
        month: 'short',
        day: 'numeric',
      })
}

const getStatusStyle = (status) => {
  switch (status) {
    case 'PENDING':
      return {
        text: 'text-amber-700',
        dot: 'bg-amber-500',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
      }

    case 'CONFIRMED':
      return {
        text: 'text-indigo-700',
        dot: 'bg-indigo-500',
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
      }

    case 'PREPARING':
      return {
        text: 'text-sky-700',
        dot: 'bg-sky-500',
        bg: 'bg-sky-50',
        border: 'border-sky-200',
      }

    case 'READY':
      return {
        text: 'text-violet-700',
        dot: 'bg-violet-500',
        bg: 'bg-violet-50',
        border: 'border-violet-200',
      }

    case 'COMPLETED':
      return {
        text: 'text-emerald-700',
        dot: 'bg-emerald-500',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
      }

    case 'CANCELLED':
      return {
        text: 'text-rose-700',
        dot: 'bg-rose-500',
        bg: 'bg-rose-50',
        border: 'border-rose-200',
      }

    default:
      return {
        text: 'text-neutral-600',
        dot: 'bg-neutral-400',
        bg: 'bg-neutral-50',
        border: 'border-neutral-200',
      }
  }
}

// =========================
// METRIC CARD
// =========================
const MetricCard = ({
  title,
  value,
  description,
  icon,
  iconClass = '',
  descriptionClass = '',
}) => (
  <div className="p-5 bg-white border border-neutral-200 rounded-2xl flex items-center justify-between shadow-xs">
    <div>
      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
        {title}
      </p>

      <h3 className="text-2xl font-bold text-neutral-900 mt-1">
        {value === null ? (
          <Loader2
            size={18}
            className="animate-spin text-neutral-400"
          />
        ) : (
          value
        )}
      </h3>

      <p
        className={`text-[11px] mt-1 font-medium ${
          descriptionClass || 'text-neutral-400'
        }`}
      >
        {description}
      </p>
    </div>

    <div className={`p-3 rounded-xl border ${iconClass}`}>
      {icon}
    </div>
  </div>
)

// =========================
// ORDER TABLE ROW
// =========================
const OrderTableRow = ({
  order,
  onView,
  onEdit,
  onDelete,
  deleteLoading,
  deleteId,
}) => {
  const status = normalizeStatus(order)
  const statusStyle = getStatusStyle(status)

  return (
    <tr className="hover:bg-neutral-50/80 transition-colors">
      <td className="py-4 px-6">
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-neutral-900">
            #{getOrderId(order)}
          </span>

          <span className="text-[10px] text-neutral-400">
            ID: {order.id}
          </span>
        </div>
      </td>

      <td className="py-4 px-6 text-neutral-500 font-medium whitespace-nowrap">
        {formatDateTime(order)}
      </td>

      <td className="py-4 px-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0">
            <User size={14} className="text-neutral-500" />
          </div>

          <div className="min-w-0">
            <div className="font-bold text-neutral-900 truncate max-w-[150px]">
              {getCustomerName(order)}
            </div>

            {order?.user?.phone && (
              <div className="text-[10px] text-neutral-400">
                {order.user.phone}
              </div>
            )}
          </div>
        </div>
      </td>

      <td className="py-4 px-6">
        <div className="flex flex-col items-start gap-1.5">
          <span className="px-2 py-1 rounded-md bg-neutral-100 border border-neutral-200 text-[9px] font-bold text-neutral-600">
            {getSource(order)}
          </span>

          <span className="px-2 py-1 rounded-md bg-neutral-50 border border-neutral-200 text-[9px] font-bold text-neutral-500">
            {getType(order)}
          </span>
        </div>
      </td>

      <td className="py-4 px-6 max-w-[250px]">
        <div className="font-medium text-neutral-700 truncate">
          {getItems(order)}
        </div>

        <div className="text-[10px] text-neutral-400 mt-1">
          {getItemCount(order)} item
          {getItemCount(order) !== 1 ? 's' : ''}
        </div>
      </td>

      <td className="py-4 px-6 font-bold text-neutral-900">
        {formatMoney(getTotal(order))}
      </td>

      <td className="py-4 px-6">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold ${statusStyle.bg} ${statusStyle.border} ${statusStyle.text}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}
          />

          {getStatusLabel(status)}
        </span>
      </td>

      <td className="py-4 px-6 text-right">
        <div className="inline-flex items-center gap-1.5">

          {/* VIEW */}
          <button
            type="button"
            onClick={() => onView(order)}
            className="p-2 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-100 text-neutral-600 transition-colors"
            title="View Order"
          >
            <Eye size={14} />
          </button>

          {/* EDIT */}
          <button
            type="button"
            onClick={() => onEdit(order)}
            className="p-2 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-100 text-neutral-600 transition-colors"
            title="Edit Order"
          >
            <Edit size={14} />
          </button>

          {/* DELETE */}
          <button
            type="button"
            disabled={
              deleteLoading && deleteId === order.id
            }
            onClick={() => onDelete(order)}
            className="p-2 bg-white border border-neutral-200 rounded-lg hover:bg-rose-50 hover:border-rose-200 text-neutral-500 hover:text-rose-600 transition-colors disabled:opacity-50"
            title="Delete Order"
          >
            {deleteLoading && deleteId === order.id ? (
              <Loader2
                size={14}
                className="animate-spin"
              />
            ) : (
              <Trash2 size={14} />
            )}
          </button>
        </div>
      </td>
    </tr>
  )
}

// =========================
// PAGINATION
// =========================
const Pagination = ({
  page,
  totalPages,
  onPageChange,
  showingFrom,
  showingTo,
  totalOrders,
}) => {
  const pageNumbers = useMemo(() => {
    const maxVisible = 5

    let start = Math.max(
      1,
      page - Math.floor(maxVisible / 2)
    )

    let end = start + maxVisible - 1

    if (end > totalPages) {
      end = totalPages
      start = Math.max(
        1,
        end - maxVisible + 1
      )
    }

    const pages = []

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    return pages
  }, [page, totalPages])

  return (
    <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
      <div>
        Showing{' '}
        <span className="font-semibold text-neutral-900">
          {showingFrom}
        </span>{' '}
        to{' '}
        <span className="font-semibold text-neutral-900">
          {showingTo}
        </span>{' '}
        of{' '}
        <span className="font-semibold text-neutral-900">
          {totalOrders}
        </span>{' '}
        orders
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() =>
            onPageChange(Math.max(1, page - 1))
          }
          className="w-8 h-8 rounded-lg border border-neutral-200 flex items-center justify-center hover:bg-white text-neutral-500 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={14} />
        </button>

        {pageNumbers.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 rounded-lg font-semibold flex items-center justify-center transition-colors ${
              p === page
                ? 'bg-neutral-900 text-white'
                : 'border border-neutral-200 hover:bg-white text-neutral-600'
            }`}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() =>
            onPageChange(
              Math.min(totalPages, page + 1)
            )
          }
          className="w-8 h-8 rounded-lg border border-neutral-200 flex items-center justify-center hover:bg-white text-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}

// =========================
// MAIN COMPONENT
// =========================
export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  const [page, setPage] = useState(1)
  const [perPage] = useState(5)
  const [totalOrders, setTotalOrders] = useState(0)

  // VIEW
  const [viewingOrder, setViewingOrder] = useState(null)
  const [viewLoading, setViewLoading] = useState(false)

  // EDIT
  const [editingOrder, setEditingOrder] = useState(null)
  const [editLoading, setEditLoading] = useState(false)
  const [savingEdit, setSavingEdit] = useState(false)

  // DELETE
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  // =========================
  // FETCH ORDERS
  // =========================
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const response = await getAdminOrders({
        page,
        perPage,
        search,
        source:
          sourceFilter !== 'All'
            ? sourceFilter
            : undefined,
        type:
          typeFilter !== 'All'
            ? typeFilter
            : undefined,
        status:
          statusFilter !== 'All'
            ? statusFilter
            : undefined,
      })

      const responseData =
        response?.data ?? response

      let orderList = []

      if (Array.isArray(responseData)) {
        orderList = responseData
        setTotalOrders(responseData.length)
      } else if (
        Array.isArray(responseData?.data)
      ) {
        orderList = responseData.data

        setTotalOrders(
          responseData.total ??
            responseData.data.length
        )
      } else {
        orderList = []
        setTotalOrders(0)
      }

      setOrders(orderList)
    } catch (err) {
      console.error(
        'Failed to fetch orders:',
        err
      )

      setError(
        err?.response?.data?.message ||
          'Failed to load orders.'
      )

      setOrders([])
      setTotalOrders(0)
    } finally {
      setLoading(false)
    }
  }, [
    page,
    perPage,
    search,
    sourceFilter,
    typeFilter,
    statusFilter,
  ])

  useEffect(() => {
    const timer = setTimeout(
      fetchOrders,
      300
    )

    return () => clearTimeout(timer)
  }, [fetchOrders])

  // =========================
  // METRICS
  // =========================
  const metrics = useMemo(() => {
    let pending = 0
    let preparing = 0
    let completed = 0
    let cancelled = 0
    let revenue = 0

    orders.forEach((order) => {
      const status = normalizeStatus(order)

      if (status === 'PENDING') {
        pending++
      }

      if (
        ['PREPARING', 'CONFIRMED', 'READY'].includes(
          status
        )
      ) {
        preparing++
      }

      if (status === 'COMPLETED') {
        completed++
        revenue += getTotal(order)
      }

      if (status === 'CANCELLED') {
        cancelled++
      }
    })

    return {
      total: orders.length,
      pending,
      preparing,
      completed,
      cancelled,
      revenue,
    }
  }, [orders])

  // =========================
  // FILTER
  // =========================
  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase()

    return orders.filter((order) => {
      const orderId = String(
        getOrderId(order)
      ).toLowerCase()

      const customer = String(
        getCustomerName(order)
      ).toLowerCase()

      return (
        !query ||
        orderId.includes(query) ||
        customer.includes(query)
      )
    })
  }, [orders, search])

  // =========================
  // VIEW
  // =========================
  const handleView = async (order) => {
    try {
      setViewLoading(true)
      setViewingOrder(order)

      const response =
        await getAdminOrder(order.id)

      const data =
        response?.data?.data ??
        response?.data ??
        response ??
        order

      setViewingOrder(data)
    } catch (err) {
      console.error(
        'Failed to fetch order details:',
        err
      )
    } finally {
      setViewLoading(false)
    }
  }

  // =========================
  // EDIT - OPEN MODAL
  // =========================
  const handleEdit = async (order) => {
    try {
      setEditLoading(true)

      const response =
        await getAdminOrder(order.id)

      const data =
        response?.data?.data ??
        response?.data ??
        response ??
        order

      setEditingOrder({
        ...data,

        status: normalizeStatus(data),

        order_source:
          data?.order_source ||
          data?.source ||
          'WALK_IN',

        order_type:
          data?.order_type ||
          data?.type ||
          'DINE_IN',
      })
    } catch (err) {
      console.error(
        'Failed to load order:',
        err
      )

      alert(
        err?.response?.data?.message ||
          'Failed to load order.'
      )
    } finally {
      setEditLoading(false)
    }
  }

  // =========================
  // EDIT INPUT CHANGE
  // =========================
  const handleEditChange = (field, value) => {
    setEditingOrder((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // =========================
  // SAVE EDIT
  // =========================
  const handleSaveEdit = async () => {
    if (!editingOrder?.id) {
      alert('Order ID is missing.')
      return
    }

    try {
      setSavingEdit(true)

      const payload = {
        status: editingOrder.status,
        order_source:
          editingOrder.order_source,
        order_type:
          editingOrder.order_type,
      }

      await updateAdminOrder(
        editingOrder.id,
        payload
      )

      alert('Order updated successfully.')

      setEditingOrder(null)

      await fetchOrders()
    } catch (err) {
      console.error(
        'Failed to update order:',
        err
      )

      alert(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Failed to update order.'
      )
    } finally {
      setSavingEdit(false)
    }
  }

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (order) => {
    if (
      !window.confirm(
        `Are you sure you want to delete order "${getOrderId(
          order
        )}"?`
      )
    ) {
      return
    }

    try {
      setDeleteLoading(true)
      setDeleteId(order.id)

      await deleteAdminOrder(order.id)

      await fetchOrders()
    } catch (err) {
      console.error(
        'Failed to delete order:',
        err
      )

      alert(
        err?.response?.data?.message ||
          'Failed to delete order.'
      )
    } finally {
      setDeleteLoading(false)
      setDeleteId(null)
    }
  }

  // =========================
  // RESET FILTERS
  // =========================
  const resetFilters = () => {
    setSearch('')
    setSourceFilter('All')
    setTypeFilter('All')
    setStatusFilter('All')
    setPage(1)
  }

  const totalPages = Math.max(
    1,
    Math.ceil(totalOrders / perPage)
  )

  const showingFrom =
    filteredOrders.length > 0
      ? (page - 1) * perPage + 1
      : 0

  const showingTo =
    filteredOrders.length > 0
      ? Math.min(
          (page - 1) * perPage +
            filteredOrders.length,
          totalOrders
        )
      : 0

  // =========================
  // RENDER
  // =========================
  return (
    <main className="flex-1 p-6 lg:p-8 space-y-7 overflow-y-auto text-neutral-900">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center">
              <Receipt
                size={16}
                className="text-white"
              />
            </div>

            <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Order Management
            </h2>
          </div>

          <p className="text-xs text-neutral-500 font-medium ml-10">
            Real-time audit and control of all transactions.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            alert('New Order clicked')
          }
          className="px-5 py-2.5 bg-[#1f1611] text-white rounded-full text-xs font-bold flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors shadow-sm"
        >
          <Plus size={16} />
          NEW ORDER
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium">
          <div className="flex items-center gap-2">
            <XCircle size={16} />
            <span>{error}</span>
          </div>

          <button
            type="button"
            onClick={() => setError('')}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <MetricCard
          title="Total Orders"
          value={
            loading ? null : metrics.total
          }
          description="Orders in current page"
          icon={<ShoppingCart size={17} />}
          iconClass="bg-neutral-100 text-neutral-700 border-neutral-200"
        />

        <MetricCard
          title="Pending Orders"
          value={
            loading ? null : metrics.pending
          }
          description="Waiting to be processed"
          icon={<Clock size={17} />}
          iconClass="bg-amber-50 text-amber-600 border-amber-100"
          descriptionClass="text-amber-600"
        />

        <MetricCard
          title="Preparing Orders"
          value={
            loading ? null : metrics.preparing
          }
          description="Currently being prepared"
          icon={<Flame size={17} />}
          iconClass="bg-sky-50 text-sky-600 border-sky-100"
          descriptionClass="text-sky-600"
        />

        <MetricCard
          title="Completed Orders"
          value={
            loading ? null : metrics.completed
          }
          description="Successfully completed"
          icon={<CheckCircle size={17} />}
          iconClass="bg-emerald-50 text-emerald-600 border-emerald-100"
          descriptionClass="text-emerald-600"
        />

        <MetricCard
          title="Cancelled Orders"
          value={
            loading ? null : metrics.cancelled
          }
          description="Cancelled orders"
          icon={<XCircle size={17} />}
          iconClass="bg-rose-50 text-rose-600 border-rose-100"
          descriptionClass="text-rose-600"
        />

        <MetricCard
          title="Total Revenue"
          value={
            loading
              ? null
              : formatMoney(metrics.revenue)
          }
          description="Completed order sales"
          icon={<DollarSign size={17} />}
          iconClass="bg-neutral-100 text-neutral-700 border-neutral-200"
        />
      </div>

      {/* MAIN CONTAINER */}
      <div className="bg-white border border-neutral-200 rounded-3xl shadow-xs overflow-hidden">

        {/* FILTERS */}
        <div className="p-5 lg:p-6 border-b border-neutral-200">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">

            <div className="relative w-full xl:w-80">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                placeholder="Search Order ID, Customer..."
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 focus:bg-white transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">

              <select
                value={sourceFilter}
                onChange={(e) => {
                  setSourceFilter(
                    e.target.value
                  )
                  setPage(1)
                }}
                className="px-3.5 py-2.5 border-[#DBDBCF] bg-[#FDFCF0] rounded-xl text-xs font-semibold text-neutral-700 focus:outline-none focus:border-neutral-400 cursor-pointer"
              >
                <option value="All">
                  Source: All
                </option>
                <option value="WALK_IN">
                  Walk-In
                </option>
                <option value="E_ORDER">
                  E-Order
                </option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(
                    e.target.value
                  )
                  setPage(1)
                }}
                className="px-3.5 py-2.5 border-[#DBDBCF] bg-[#FDFCF0] rounded-xl text-xs font-semibold text-neutral-700 focus:outline-none focus:border-neutral-400 cursor-pointer"
              >
                <option value="All">
                  Type: All
                </option>
                <option value="DINE_IN">
                  Dine-In
                </option>
                <option value="TAKEAWAY">
                  Takeaway
                </option>
                <option value="DELIVERY">
                  Delivery
                </option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(
                    e.target.value
                  )
                  setPage(1)
                }}
                className="px-3.5 py-2.5 border-[#DBDBCF] bg-[#FDFCF0] rounded-xl text-xs font-semibold text-neutral-700 focus:outline-none focus:border-neutral-400 cursor-pointer"
              >
                <option value="All">
                  Status: All
                </option>
                <option value="PENDING">
                  Pending
                </option>
                <option value="CONFIRMED">
                  Confirmed
                </option>
                <option value="PREPARING">
                  Preparing
                </option>
                <option value="READY">
                  Ready
                </option>
                <option value="COMPLETED">
                  Completed
                </option>
                <option value="CANCELLED">
                  Cancelled
                </option>
              </select>

              <button
                type="button"
                onClick={resetFilters}
                className="px-3.5 py-2.5 border-[#DBDBCF] bg-[#FDFCF0] rounded-xl text-xs font-semibold flex items-center gap-2 text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <Filter size={14} />
                RESET
              </button>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[1100px]">

            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/70 text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-6">
                  Order ID
                </th>

                <th className="py-3.5 px-6">
                  Time
                </th>

                <th className="py-3.5 px-6">
                  Customer
                </th>

                <th className="py-3.5 px-6">
                  Source / Type
                </th>

                <th className="py-3.5 px-6">
                  Items
                </th>

                <th className="py-3.5 px-6">
                  Total
                </th>

                <th className="py-3.5 px-6">
                  Status
                </th>

                <th className="py-3.5 px-6 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-100">

              {loading ? (
                <tr>
                  <td
                    colSpan="8"
                    className="py-20 text-center"
                  >
                    <div className="flex flex-col items-center gap-3 text-neutral-400">
                      <Loader2
                        size={24}
                        className="animate-spin text-neutral-500"
                      />

                      <span className="text-xs font-medium">
                        Loading orders...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="py-20 text-center"
                  >
                    <div className="flex flex-col items-center gap-2 text-neutral-400">
                      <Package size={28} />

                      <span className="text-xs font-medium">
                        No orders found.
                      </span>

                      <span className="text-[11px]">
                        Try changing your filters or search.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map(
                  (order) => (
                    <OrderTableRow
                      key={order.id}
                      order={order}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      deleteLoading={
                        deleteLoading
                      }
                      deleteId={deleteId}
                    />
                  )
                )
              )}

            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          showingFrom={showingFrom}
          showingTo={showingTo}
          totalOrders={totalOrders}
        />
      </div>

      {/* VIEW ORDER MODAL */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 shadow-xl border border-neutral-200">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <h3 className="text-lg font-bold text-neutral-900">
                Order #{getOrderId(viewingOrder)}
              </h3>
              <button
                type="button"
                onClick={() => setViewingOrder(null)}
                className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-500"
              >
                <X size={18} />
              </button>
            </div>

            {viewLoading ? (
              <div className="py-12 flex justify-center">
                <Loader2 size={24} className="animate-spin text-neutral-400" />
              </div>
            ) : (
              <div className="py-4 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-neutral-400 block font-medium">Customer</span>
                    <span className="font-bold text-neutral-800">{getCustomerName(viewingOrder)}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block font-medium">Date & Time</span>
                    <span className="font-semibold text-neutral-800">{formatDateTime(viewingOrder)}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block font-medium">Source / Type</span>
                    <span className="font-semibold text-neutral-800">{getSource(viewingOrder)} / {getType(viewingOrder)}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block font-medium">Status</span>
                    <span className="font-semibold text-neutral-800">{getStatusLabel(normalizeStatus(viewingOrder))}</span>
                  </div>
                </div>

                <div className="border-t border-neutral-100 pt-3">
                  <span className="text-neutral-400 block font-medium mb-2">Items</span>
                  <div className="bg-neutral-50 rounded-xl p-3 space-y-1">
                    {getItems(viewingOrder)}
                  </div>
                </div>

                <div className="border-t border-neutral-100 pt-3 flex justify-between items-center text-sm font-bold">
                  <span>Total Amount</span>
                  <span>{formatMoney(getTotal(viewingOrder))}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EDIT ORDER MODAL */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-xl border border-neutral-200">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <h3 className="text-lg font-bold text-neutral-900">
                Edit Order #{getOrderId(editingOrder)}
              </h3>
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-500"
              >
                <X size={18} />
              </button>
            </div>

            {editLoading ? (
              <div className="py-12 flex justify-center">
                <Loader2 size={24} className="animate-spin text-neutral-400" />
              </div>
            ) : (
              <div className="py-4 space-y-4 text-xs">
                <div>
                  <label className="block text-neutral-500 font-semibold mb-1">Status</label>
                  <select
                    value={editingOrder.status}
                    onChange={(e) => handleEditChange('status', e.target.value)}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PREPARING">Preparing</option>
                    <option value="READY">Ready</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-500 font-semibold mb-1">Source</label>
                  <select
                    value={editingOrder.order_source}
                    onChange={(e) => handleEditChange('order_source', e.target.value)}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium"
                  >
                    <option value="WALK_IN">Walk-In</option>
                    <option value="E_ORDER">E-Order</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-500 font-semibold mb-1">Type</label>
                  <select
                    value={editingOrder.order_type}
                    onChange={(e) => handleEditChange('order_type', e.target.value)}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium"
                  >
                    <option value="DINE_IN">Dine-In</option>
                    <option value="TAKEAWAY">Takeaway</option>
                    <option value="DELIVERY">Delivery</option>
                  </select>
                </div>

                <div className="pt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingOrder(null)}
                    className="px-4 py-2 border border-neutral-200 rounded-xl text-neutral-600 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={savingEdit}
                    onClick={handleSaveEdit}
                    className="px-4 py-2 bg-neutral-900 text-white rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50"
                  >
                    {savingEdit && <Loader2 size={14} className="animate-spin" />}
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </main>
  )
}