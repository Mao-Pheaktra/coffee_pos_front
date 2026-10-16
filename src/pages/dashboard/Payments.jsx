import React, { useEffect, useMemo, useState } from 'react'
import {
  Search,
  Download,
  Filter,
  Eye,
  Trash2,
  DollarSign,
  CheckCircle2,
  RotateCcw,
  QrCode,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Clock,
  XCircle,
  Loader2,
  X,
  CreditCard,
  Banknote,
  Receipt,
  User,
  ShoppingCart,
  CalendarDays,
  Hash,
} from 'lucide-react'

import {
  getAdminPayments,
  getAdminPaymentSummary,
  getAdminPayment,
  deleteAdminPayment,
} from '../../services/adminPaymentService'

export default function Payments() {
  const [payments, setPayments] = useState([])

  const [summary, setSummary] = useState({
    total_volume: 0,
    volume_change_percentage: 0,
    success_rate: 0,
    successful_transactions: 0,
    refunds: {
      count: 0,
      amount: 0,
    },
    top_payment_method: {
      name: null,
      percentage_of_total_volume: 0,
    },
  })

  const [loading, setLoading] = useState(true)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [methodFilter, setMethodFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const [page, setPage] = useState(1)
  const perPage = 8

  const [viewingPayment, setViewingPayment] = useState(null)
  const [viewLoading, setViewLoading] = useState(false)

  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  // =========================================================
  // FETCH PAYMENTS
  // =========================================================

  const fetchPayments = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await getAdminPayments()

      const data = response?.data || response

      setPayments(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to fetch payments:', err)

      setError(
        err?.response?.data?.message ||
          'Failed to load payment transactions.'
      )

      setPayments([])
    } finally {
      setLoading(false)
    }
  }

  // =========================================================
  // FETCH SUMMARY
  // =========================================================

  const fetchSummary = async () => {
    try {
      setSummaryLoading(true)

      const response = await getAdminPaymentSummary()

      const data = response?.data || response

      setSummary({
        total_volume: Number(data?.total_volume || 0),
        volume_change_percentage: Number(
          data?.volume_change_percentage || 0
        ),
        success_rate: Number(data?.success_rate || 0),
        successful_transactions: Number(
          data?.successful_transactions || 0
        ),
        refunds: {
          count: Number(data?.refunds?.count || 0),
          amount: Number(data?.refunds?.amount || 0),
        },
        top_payment_method: {
          name: data?.top_payment_method?.name || null,
          percentage_of_total_volume: Number(
            data?.top_payment_method?.percentage_of_total_volume || 0
          ),
        },
      })
    } catch (err) {
      console.error('Failed to fetch payment summary:', err)
    } finally {
      setSummaryLoading(false)
    }
  }

  // =========================================================
  // INITIAL FETCH
  // =========================================================

  useEffect(() => {
    fetchPayments()
    fetchSummary()
  }, [])

  // =========================================================
  // FORMATTERS
  // =========================================================

  const formatMoney = (amount) => {
    const value = Number(amount || 0)

    return `$${value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  const formatDate = (date) => {
    if (!date) return '—'

    const parsed = new Date(date)

    if (Number.isNaN(parsed.getTime())) {
      return '—'
    }

    return parsed.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusLabel = (status) => {
    const normalized = String(status || '').toUpperCase()

    switch (normalized) {
      case 'PAID':
        return 'Success'

      case 'REFUNDED':
        return 'Refunded'

      case 'PENDING':
        return 'Pending'

      case 'FAILED':
        return 'Failed'

      default:
        return normalized || 'Unknown'
    }
  }

  const getMethodName = (payment) => {
    return (
      payment?.paymentMethod?.name ||
      payment?.payment_method?.name ||
      'Unknown'
    )
  }

  const getOrderId = (payment) => {
    return payment?.order?.id
      ? `ORD-${String(payment.order.id).padStart(4, '0')}`
      : payment?.order_id
        ? `ORD-${String(payment.order_id).padStart(4, '0')}`
        : '—'
  }

  const getCustomerName = (payment) => {
    return (
      payment?.order?.user?.name ||
      payment?.order?.customer_name ||
      'Walk-in Customer'
    )
  }

  const getTransactionId = (payment) => {
    return (
      payment?.transaction_id ||
      `PAY-${String(payment?.id || '').padStart(6, '0')}`
    )
  }

  // =========================================================
  // METHOD ICON
  // =========================================================

  const getMethodIcon = (payment) => {
    const method = getMethodName(payment).toUpperCase()

    if (
      method.includes('KHQR') ||
      method.includes('QR') ||
      method.includes('BAKONG') ||
      method.includes('ABA')
    ) {
      return <QrCode size={15} />
    }

    if (
      method.includes('CARD') ||
      method.includes('CREDIT') ||
      method.includes('DEBIT')
    ) {
      return <CreditCard size={15} />
    }

    if (method.includes('CASH')) {
      return <Banknote size={15} />
    }

    return <DollarSign size={15} />
  }

  // =========================================================
  // FILTER
  // =========================================================

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase()

    return payments.filter((payment) => {
      const transactionId = getTransactionId(payment).toLowerCase()
      const orderId = getOrderId(payment).toLowerCase()
      const customer = getCustomerName(payment).toLowerCase()
      const method = getMethodName(payment).toLowerCase()
      const status = String(payment?.status || '').toUpperCase()

      const matchesSearch =
        !query ||
        transactionId.includes(query) ||
        orderId.includes(query) ||
        customer.includes(query) ||
        method.includes(query)

      const matchesMethod =
        methodFilter === 'ALL' ||
        method === methodFilter.toLowerCase()

      const matchesStatus =
        statusFilter === 'ALL' ||
        status === statusFilter

      return matchesSearch && matchesMethod && matchesStatus
    })
  }, [payments, search, methodFilter, statusFilter])

  // =========================================================
  // PAGINATION
  // =========================================================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPayments.length / perPage)
  )

  const paginatedPayments = useMemo(() => {
    const start = (page - 1) * perPage

    return filteredPayments.slice(start, start + perPage)
  }, [filteredPayments, page])

  useEffect(() => {
    setPage(1)
  }, [search, methodFilter, statusFilter])

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const startEntry =
    filteredPayments.length === 0
      ? 0
      : (page - 1) * perPage + 1

  const endEntry = Math.min(
    page * perPage,
    filteredPayments.length
  )

  // =========================================================
  // VIEW PAYMENT
  // =========================================================

  const handleView = async (payment) => {
    try {
      setViewLoading(true)
      setViewingPayment(payment)

      const response = await getAdminPayment(payment.id)

      const data = response?.data || response

      setViewingPayment(data || payment)
    } catch (err) {
      console.error('Failed to fetch payment details:', err)
    } finally {
      setViewLoading(false)
    }
  }

  // =========================================================
  // DELETE PAYMENT
  // =========================================================

  const handleDelete = async (payment) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete payment "${getTransactionId(
        payment
      )}"?`
    )

    if (!confirmed) return

    try {
      setDeleteLoading(true)
      setDeleteId(payment.id)

      await deleteAdminPayment(payment.id)

      await Promise.all([
        fetchPayments(),
        fetchSummary(),
      ])
    } catch (err) {
      console.error('Failed to delete payment:', err)

      alert(
        err?.response?.data?.message ||
          'Failed to delete payment.'
      )
    } finally {
      setDeleteLoading(false)
      setDeleteId(null)
    }
  }

  // =========================================================
  // EXPORT
  // =========================================================

  const handleExport = () => {
    if (filteredPayments.length === 0) {
      alert('There are no payment transactions to export.')
      return
    }

    const headers = [
      'Transaction ID',
      'Order ID',
      'Customer',
      'Payment Method',
      'Status',
      'Amount',
      'Created At',
    ]

    const rows = filteredPayments.map((payment) => [
      getTransactionId(payment),
      getOrderId(payment),
      getCustomerName(payment),
      getMethodName(payment),
      getStatusLabel(payment.status),
      payment.amount,
      formatDate(payment.created_at),
    ])

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value ?? '').replace(/"/g, '""')}"`
          )
          .join(',')
      )
      .join('\n')

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    })

    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = 'payment-transactions.csv'
    link.click()

    URL.revokeObjectURL(url)
  }

  // =========================================================
  // STATUS STYLE
  // =========================================================

  const getStatusStyle = (status) => {
    const normalized = String(status || '').toUpperCase()

    if (normalized === 'PAID') {
      return {
        container:
          'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
      }
    }

    if (normalized === 'REFUNDED') {
      return {
        container:
          'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
      }
    }

    if (normalized === 'PENDING') {
      return {
        container:
          'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
      }
    }

    if (normalized === 'FAILED') {
      return {
        container:
          'bg-red-50 text-red-700 border-red-200',
        dot: 'bg-red-500',
      }
    }

    return {
      container:
        'bg-neutral-50 text-neutral-600 border-neutral-200',
      dot: 'bg-neutral-400',
    }
  }

  return (
    <main className="flex-1 p-6 lg:p-8 space-y-7 overflow-y-auto  text-neutral-900">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-neutral-900 text-white rounded-xl">
              <Receipt size={17} />
            </div>

            <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Payment Transactions
            </h2>
          </div>

          <p className="text-xs text-neutral-500 font-medium">
            Manage and audit all incoming payments and refunds.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer shadow-sm"
        >
          <Download size={15} />
          Export CSV
        </button>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
          <div className="flex items-center gap-2">
            <XCircle size={16} />
            <span>{error}</span>
          </div>

          <button
            type="button"
            onClick={() => setError('')}
            className="hover:text-rose-900 cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* =====================================================
          METRICS
      ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        {/* Today's / Total Volume */}
        <div className="border-[#DBDBCF] bg-[#FDFCF0] rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-neutral-400">
                Payment Volume
              </p>

              <div className="mt-3">
                {summaryLoading ? (
                  <Loader2
                    size={21}
                    className="animate-spin text-neutral-400"
                  />
                ) : (
                  <span className="text-2xl font-extrabold text-neutral-950">
                    {formatMoney(summary.total_volume)}
                  </span>
                )}
              </div>
            </div>

            <div className="p-2.5 bg-neutral-100 border border-neutral-200 rounded-xl">
              <DollarSign size={17} />
            </div>
          </div>

          <div className="mt-3 text-[11px] font-semibold">
            {summary.volume_change_percentage >= 0 ? (
              <span className="text-emerald-600">
                ↗ +{summary.volume_change_percentage.toFixed(1)}% vs yesterday
              </span>
            ) : (
              <span className="text-rose-600">
                ↘ {summary.volume_change_percentage.toFixed(1)}% vs yesterday
              </span>
            )}
          </div>
        </div>

        {/* Success Rate */}
        <div className="border-[#DBDBCF] bg-[#FDFCF0] rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-neutral-400">
                Success Rate
              </p>

              <div className="mt-3">
                {summaryLoading ? (
                  <Loader2
                    size={21}
                    className="animate-spin text-neutral-400"
                  />
                ) : (
                  <span className="text-2xl font-extrabold text-neutral-950">
                    {summary.success_rate.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>

            <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl">
              <CheckCircle2
                size={17}
                className="text-emerald-600"
              />
            </div>
          </div>

          <p className="mt-3 text-[11px] font-medium text-neutral-500">
            {summary.successful_transactions} successful transactions
          </p>
        </div>

        {/* Refunds */}
        <div className="border-[#DBDBCF] bg-[#FDFCF0] rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-neutral-400">
                Refunds
              </p>

              <div className="mt-3">
                {summaryLoading ? (
                  <Loader2
                    size={21}
                    className="animate-spin text-neutral-400"
                  />
                ) : (
                  <span className="text-2xl font-extrabold text-neutral-950">
                    {summary.refunds.count}
                  </span>
                )}
              </div>
            </div>

            <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl">
              <RotateCcw
                size={17}
                className="text-rose-600"
              />
            </div>
          </div>

          <p className="mt-3 text-[11px] font-semibold text-rose-600">
            {formatMoney(summary.refunds.amount)} refunded
          </p>
        </div>

        {/* Top Method */}
        <div className="border-[#DBDBCF] bg-[#FDFCF0] rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-neutral-400">
                Top Payment Method
              </p>

              <div className="mt-3">
                {summaryLoading ? (
                  <Loader2
                    size={21}
                    className="animate-spin text-neutral-400"
                  />
                ) : (
                  <span className="text-xl font-extrabold text-neutral-950">
                    {summary.top_payment_method.name || '—'}
                  </span>
                )}
              </div>
            </div>

            <div className="p-2.5 bg-neutral-100 border border-neutral-200 rounded-xl">
              <QrCode size={17} />
            </div>
          </div>

          <p className="mt-3 text-[11px] font-medium text-neutral-500">
            {summary.top_payment_method.percentage_of_total_volume.toFixed(1)}%
            {' '}of total volume
          </p>
        </div>

      </div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="border-[#DBDBCF] bg-[#FDFCF0] rounded-2xl shadow-sm overflow-hidden">

        {/* Header */}
        <div className="px-5 lg:px-6 py-5 border-b border-neutral-200">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">

            {/* Search */}
            <div className="relative w-full xl:w-96">
              <Search
                size={20}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search transaction, order or customer..."
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400"
              />
            </div>

            {/* Filters */}
            <div className="flex  items-center gap-2">

              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 focus:outline-none focus:border-neutral-400 cursor-pointer"
              >
                <option value="ALL">
                  All Methods
                </option>

                {[...new Set(
                  payments
                    .map((payment) => getMethodName(payment))
                    .filter(Boolean)
                )].map((method) => (
                  <option
                    key={method}
                    value={method.toUpperCase()}
                  >
                    {method}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 focus:outline-none focus:border-neutral-400 cursor-pointer"
              >
                <option value="ALL">
                  All Statuses
                </option>
                <option value="PAID">
                  Success
                </option>
                <option value="PENDING">
                  Pending
                </option>
                <option value="FAILED">
                  Failed
                </option>
                <option value="REFUNDED">
                  Refunded
                </option>
              </select>

              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setMethodFilter('ALL')
                  setStatusFilter('ALL')
                }}
                className="px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer flex items-center gap-2"
              >
                <Filter size={14} />
                Reset
              </button>

            </div>
          </div>
        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="overflow-x-auto">
          <table className="w-full text-left">

            <thead>
              <tr className="bg-neutral-50/70 border-b border-neutral-200">
                <th className="px-5 lg:px-6 py-3.5 text-[10px] uppercase tracking-wider font-bold text-neutral-400">
                  Transaction
                </th>

                <th className="px-5 py-3.5 text-[10px] uppercase tracking-wider font-bold text-neutral-400">
                  Order
                </th>

                <th className="px-5 py-3.5 text-[10px] uppercase tracking-wider font-bold text-neutral-400">
                  Customer
                </th>

                <th className="px-5 py-3.5 text-[10px] uppercase tracking-wider font-bold text-neutral-400">
                  Method
                </th>

                <th className="px-5 py-3.5 text-[10px] uppercase tracking-wider font-bold text-neutral-400">
                  Date
                </th>

                <th className="px-5 py-3.5 text-[10px] uppercase tracking-wider font-bold text-neutral-400">
                  Status
                </th>

                <th className="px-5 py-3.5 text-[10px] uppercase tracking-wider font-bold text-neutral-400">
                  Amount
                </th>

                <th className="px-5 lg:px-6 py-3.5 text-[10px] uppercase tracking-wider font-bold text-neutral-400 text-right">
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
                    <div className="flex flex-col items-center justify-center gap-3 text-neutral-400">
                      <Loader2
                        size={25}
                        className="animate-spin text-neutral-500"
                      />
                      <span className="text-xs font-medium">
                        Loading payment transactions...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : paginatedPayments.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="py-20 text-center"
                  >
                    <div className="flex flex-col items-center gap-3 text-neutral-400">
                      <Receipt size={30} />
                      <div>
                        <p className="text-sm font-semibold text-neutral-600">
                          No payments found
                        </p>
                        <p className="text-xs mt-1">
                          Try changing your search or filters.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedPayments.map((payment) => {
                  const statusStyle = getStatusStyle(
                    payment.status
                  )

                  return (
                    <tr
                      key={payment.id}
                      className="hover:bg-neutral-50/70 transition-colors"
                    >

                      {/* Transaction */}
                      <td className="px-5 lg:px-6 py-4">
                        <div className="flex items-center gap-3">

                          <div className="w-9 h-9 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center">
                            <Hash
                              size={15}
                              className="text-neutral-500"
                            />
                          </div>

                          <div>
                            <p className="font-bold text-neutral-900 text-xs">
                              {getTransactionId(payment)}
                            </p>

                            <p className="text-[10px] text-neutral-400 mt-0.5">
                              Payment #{payment.id}
                            </p>
                          </div>

                        </div>
                      </td>

                      {/* Order */}
                      <td className="px-5 py-4">
                        <span className="font-bold text-neutral-800 text-xs">
                          {getOrderId(payment)}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">

                          <div className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center">
                            <User
                              size={13}
                              className="text-neutral-500"
                            />
                          </div>

                          <span className="font-semibold text-neutral-800 text-xs">
                            {getCustomerName(payment)}
                          </span>

                        </div>
                      </td>

                      {/* Method */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">

                          <div className="w-7 h-7 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-600">
                            {getMethodIcon(payment)}
                          </div>

                          <span className="font-semibold text-neutral-700 text-xs">
                            {getMethodName(payment)}
                          </span>

                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-neutral-500">
                          <CalendarDays size={13} />
                          <span className="text-[11px] font-medium whitespace-nowrap">
                            {formatDate(payment.created_at)}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusStyle.container}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}
                          />

                          {getStatusLabel(payment.status)}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4">
                        <span className="font-extrabold text-neutral-900 text-xs">
                          {formatMoney(payment.amount)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 lg:px-6 py-4 text-right">

                        <div className="inline-flex items-center gap-1">

                          <button
                            type="button"
                            onClick={() =>
                              handleView(payment)
                            }
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                            title="View"
                          >
                            <Eye size={14} />
                          </button>

                          <button
                            type="button"
                            disabled={
                              deleteLoading &&
                              deleteId === payment.id
                            }
                            onClick={() =>
                              handleDelete(payment)
                            }
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-200 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer disabled:opacity-50"
                            title="Delete"
                          >
                            {deleteLoading &&
                            deleteId === payment.id ? (
                              <Loader2
                                size={14}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>

                          <button
                            type="button"
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-200 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                            title="More"
                          >
                            <MoreVertical size={14} />
                          </button>

                        </div>

                      </td>

                    </tr>
                  )
                })
              )}

            </tbody>
          </table>
        </div>

        {/* =================================================
            PAGINATION
        ================================================= */}

        <div className="px-5 lg:px-6 py-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">

          <p className="text-xs text-neutral-500">
            Showing{' '}
            <span className="font-bold text-neutral-900">
              {startEntry}
            </span>{' '}
            to{' '}
            <span className="font-bold text-neutral-900">
              {endEntry}
            </span>{' '}
            of{' '}
            <span className="font-bold text-neutral-900">
              {filteredPayments.length}
            </span>{' '}
            transactions
          </p>

          <div className="flex items-center gap-1.5">

            <button
              type="button"
              disabled={page === 1}
              onClick={() =>
                setPage((current) =>
                  Math.max(1, current - 1)
                )
              }
              className="w-8 h-8 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            )
              .slice(
                Math.max(0, page - 3),
                Math.min(totalPages, page + 2)
              )
              .map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center cursor-pointer ${
                    pageNumber === page
                      ? 'bg-neutral-900 text-white'
                      : 'border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

            <button
              type="button"
              disabled={page === totalPages}
              onClick={() =>
                setPage((current) =>
                  Math.min(totalPages, current + 1)
                )
              }
              className="w-8 h-8 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>

          </div>
        </div>

      </div>

      {/* =====================================================
          VIEW PAYMENT MODAL
      ===================================================== */}

      {viewingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-sm">

          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">

            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-neutral-200 flex items-start justify-between">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
                  <Receipt size={18} />
                </div>

                <div>
                  <h3 className="text-base font-bold text-neutral-900">
                    Payment Details
                  </h3>

                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {getTransactionId(viewingPayment)}
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={() => setViewingPayment(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 cursor-pointer"
              >
                <X size={17} />
              </button>

            </div>

            {viewLoading ? (
              <div className="py-16 flex flex-col items-center gap-3 text-neutral-400">
                <Loader2
                  size={23}
                  className="animate-spin"
                />
                <span className="text-xs">
                  Loading payment details...
                </span>
              </div>
            ) : (
              <div className="p-6 space-y-5">

                {/* Amount */}
                <div className="rounded-2xl bg-neutral-50 border border-neutral-200 p-5 text-center">

                  <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-400">
                    Payment Amount
                  </p>

                  <p className="mt-2 text-3xl font-extrabold text-neutral-950">
                    {formatMoney(viewingPayment.amount)}
                  </p>

                  <div className="mt-3 flex justify-center">
                    {(() => {
                      const style = getStatusStyle(
                        viewingPayment.status
                      )

                      return (
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${style.container}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${style.dot}`}
                          />

                          {getStatusLabel(
                            viewingPayment.status
                          )}
                        </span>
                      )
                    })()}
                  </div>

                </div>

                {/* Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div className="p-3.5 rounded-xl border border-neutral-200">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-400">
                      Transaction ID
                    </p>

                    <p className="mt-1.5 text-xs font-bold text-neutral-800 break-all">
                      {getTransactionId(viewingPayment)}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-neutral-200">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-400">
                      Order
                    </p>

                    <p className="mt-1.5 text-xs font-bold text-neutral-800">
                      {getOrderId(viewingPayment)}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-neutral-200">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-400">
                      Customer
                    </p>

                    <p className="mt-1.5 text-xs font-bold text-neutral-800">
                      {getCustomerName(viewingPayment)}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-neutral-200">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-400">
                      Payment Method
                    </p>

                    <p className="mt-1.5 text-xs font-bold text-neutral-800">
                      {getMethodName(viewingPayment)}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-neutral-200 sm:col-span-2">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-400">
                      Created At
                    </p>

                    <p className="mt-1.5 text-xs font-bold text-neutral-800">
                      {formatDate(viewingPayment.created_at)}
                    </p>
                  </div>

                </div>

                {/* Transaction ID from gateway */}
                {viewingPayment.transaction_id && (
                  <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl">

                    <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-400">
                      Gateway Transaction ID
                    </p>

                    <p className="mt-1.5 text-xs font-mono font-semibold text-neutral-700 break-all">
                      {viewingPayment.transaction_id}
                    </p>

                  </div>
                )}

              </div>
            )}

            {/* Footer */}
            <div className="px-6 py-4 border-t border-neutral-200 flex justify-end">

              <button
                type="button"
                onClick={() => setViewingPayment(null)}
                className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>

            </div>

          </div>
        </div>
      )}

    </main>
  )
}