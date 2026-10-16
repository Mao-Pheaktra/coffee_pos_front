import React, { useEffect, useMemo, useState } from 'react'
import {
  Download,
  Calendar,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  RotateCcw,
  Loader2,
  AlertCircle,
  Coffee,
  X,
  ChevronRight,
} from 'lucide-react'

import {
  getReportSummary,
  getReportRevenue,
  getReportOrders,
} from '../../services/adminReportService'

// =========================================================
// DESIGN TOKENS
// =========================================================
const INK = '#2A1F16'
const GOLD = '#B8863B'
const MATCHA = '#6B8F5A'
const ROSE = '#B5495B'
const LINE = '#E7DFD2'
const PAGE_BG = '#F7F3EC'

// =========================================================
// SIGNATURE ELEMENT — Perforation Divider
// =========================================================
function Perforation({ className = '' }) {
  return (
    <div className={`relative h-px w-full ${className}`}>
      <div className="absolute inset-x-0 top-0 border-t border-dashed border-[#D8CFC0]" />
      <span className="absolute -left-[13px] -top-[5px] h-2.5 w-2.5 rounded-full bg-[#F7F3EC] border border-[#E7DFD2]/60 shadow-inner" />
      <span className="absolute -right-[13px] -top-[5px] h-2.5 w-2.5 rounded-full bg-[#F7F3EC] border border-[#E7DFD2]/60 shadow-inner" />
    </div>
  )
}

export default function Report() {
  const [activeTab, setActiveTab] = useState('Today')
  const [chartTab, setChartTab] = useState('Daily')
  const [hoveredPoint, setHoveredPoint] = useState(null)

  const [summary, setSummary] = useState({
    total_revenue: 0,
    total_orders: 0,
    average_order_value: 0,
    refunds: {
      count: 0,
      amount: 0,
    },
  })

  const [revenueData, setRevenueData] = useState([])
  const [ordersData, setOrdersData] = useState([])

  const [loading, setLoading] = useState(true)
  const [chartLoading, setChartLoading] = useState(false)
  const [error, setError] = useState('')

  const timeTabs = ['Today', 'Yesterday', 'Last 7 Days', 'This Month']

  // =========================================================
  // LOAD SUMMARY
  // =========================================================
  const fetchSummary = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await getReportSummary()
      const data = response?.data ?? response ?? {}

      setSummary({
        total_revenue: Number(data?.total_revenue ?? 0),
        total_orders: Number(data?.total_orders ?? 0),
        average_order_value: Number(data?.average_order_value ?? 0),
        refunds: {
          count: Number(data?.refunds?.count ?? 0),
          amount: Number(data?.refunds?.amount ?? 0),
        },
      })
    } catch (err) {
      console.error('Failed to load report summary:', err)
      setError(
        err?.response?.data?.message || 'Failed to load report summary.'
      )
    } finally {
      setLoading(false)
    }
  }

  // =========================================================
  // LOAD CHART DATA
  // =========================================================
  const fetchCharts = async (period) => {
    try {
      setChartLoading(true)

      const [revenueResponse, ordersResponse] = await Promise.all([
        getReportRevenue(period),
        getReportOrders(period),
      ])

      const revenue = revenueResponse?.data?.chart ?? revenueResponse?.chart ?? []
      const orders = ordersResponse?.data?.chart ?? ordersResponse?.chart ?? []

      setRevenueData(Array.isArray(revenue) ? revenue : [])
      setOrdersData(Array.isArray(orders) ? orders : [])
    } catch (err) {
      console.error('Failed to load report charts:', err)
      setError(
        err?.response?.data?.message || 'Failed to load report charts.'
      )
      setRevenueData([])
      setOrdersData([])
    } finally {
      setChartLoading(false)
    }
  }

  useEffect(() => {
    fetchSummary()
    fetchCharts('daily')
  }, [])

  const handleChartTabChange = async (tab) => {
    setChartTab(tab)
    const periodMap = {
      Daily: 'daily',
      Weekly: 'weekly',
      Monthly: 'monthly',
    }
    await fetchCharts(periodMap[tab])
  }

  const formatMoney = (value) => {
    return `$${Number(value || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  // =========================================================
  // REVENUE & ORDER CHART TRANSFORMATIONS
  // =========================================================
  const revenueChart = useMemo(() => {
    return revenueData.map((item) => {
      let label = ''
      if (item.date) {
        const date = new Date(item.date)
        label = date.toLocaleDateString([], { month: 'short', day: 'numeric' })
      } else if (item.week) {
        label = `W${String(item.week).slice(-2)}`
      } else if (item.month) {
        const date = new Date(`${item.month}-01`)
        label = date.toLocaleDateString([], { month: 'short', year: 'numeric' })
      }
      return { label, value: Number(item.revenue || 0) }
    })
  }, [revenueData])

  const ordersChart = useMemo(() => {
    return ordersData.map((item) => {
      let label = ''
      if (item.date) {
        const date = new Date(item.date)
        label = date.toLocaleDateString([], { month: 'short', day: 'numeric' })
      } else if (item.week) {
        label = `W${String(item.week).slice(-2)}`
      } else if (item.month) {
        const date = new Date(`${item.month}-01`)
        label = date.toLocaleDateString([], { month: 'short', year: 'numeric' })
      }
      return { label, value: Number(item.orders || 0) }
    })
  }, [ordersData])

  const revenueMax = useMemo(() => {
    if (revenueChart.length === 0) return 1
    const max = Math.max(...revenueChart.map((item) => item.value))
    return max > 0 ? max : 1
  }, [revenueChart])

  const ordersMax = useMemo(() => {
    if (ordersChart.length === 0) return 1
    const max = Math.max(...ordersChart.map((item) => item.value))
    return max > 0 ? max : 1
  }, [ordersChart])

  // SVG Coordinates calculation
  const revenueCoords = useMemo(() => {
    if (revenueChart.length === 0) return []
    const width = 600
    const height = 180
    const padding = 16
    const count = revenueChart.length

    return revenueChart.map((item, index) => {
      const x =
        count === 1
          ? width / 2
          : padding + (index / (count - 1)) * (width - padding * 2)
      const y =
        height - padding - (item.value / revenueMax) * (height - padding * 2)
      return { x, y, label: item.label, value: item.value }
    })
  }, [revenueChart, revenueMax])

  const revenuePoints = useMemo(() => {
    return revenueCoords.map((p) => `${p.x},${p.y}`).join(' ')
  }, [revenueCoords])

  const revenueAreaPath = useMemo(() => {
    if (revenueCoords.length === 0) return ''
    const first = revenueCoords[0]
    const last = revenueCoords[revenueCoords.length - 1]
    const line = revenueCoords
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`)
      .join(' ')
    return `${line} L${last.x},170 L${first.x},170 Z`
  }, [revenueCoords])

  if (loading) {
    return (
      <main
        className="flex-1 flex items-center justify-center min-h-[500px]"
        style={{ backgroundColor: PAGE_BG }}
      >
        <div className="flex flex-col items-center gap-3 text-neutral-500 border-[#DBDBCF] bg-[#FDFCF0] backdrop-blur-sm p-8 rounded-2xl border  shadow-sm">
          <Loader2 size={28} className="animate-spin" style={{ color: INK }} />
          <span className="text-xs font-semibold tracking-wider uppercase text-neutral-600">
            Updating Ledger&hellip;
          </span>
        </div>
      </main>
    )
  }

  return (
    <main
      className="flex-1 p-6 sm:p-10 space-y-8 overflow-y-auto text-neutral-900 border-[#DBDBCF] bg-[#FDFCF0]"
      style={{ backgroundColor: PAGE_BG }}
    >
      <style>{`
        @keyframes reportFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7DFD2]/80 pb-6">
        <div>
          <div
            className="flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase mb-1"
            style={{ color: GOLD }}
          >
            <span className="p-1 rounded-md bg-[#B8863B]/10">
              <Coffee size={13} strokeWidth={2.5} />
            </span>
            <span>Café Financial Ledger</span>
          </div>

          <h1
            className="text-3xl sm:text-4xl font-extrabold tracking-tight font-serif"
            style={{ color: INK }}
          >
            Performance Overview
          </h1>

          <p className="text-xs text-neutral-600 font-medium mt-1">
            Real-time metric breakdown and revenue reports.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('Exporting Report...')}
          className="group relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-white transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg active:scale-[0.98] overflow-hidden"
          style={{ backgroundColor: INK }}
        >
          <Download
            size={15}
            className="transition-transform duration-200 group-hover:-translate-y-0.5"
          />
          <span className="tracking-wider uppercase text-[11px]">Export Report</span>
        </button>
      </div>

      {/* =====================================================
          ERROR BANNER
      ====================================================== */}
      {error && (
        <div
          className="flex items-center gap-3 p-4 rounded-2xl border shadow-sm transition-all"
          style={{
            borderColor: `${ROSE}33`,
            backgroundColor: `${ROSE}0D`,
            color: ROSE,
          }}
        >
          <AlertCircle size={18} className="shrink-0" />
          <span className="text-xs font-semibold">{error}</span>
          <button
            type="button"
            onClick={() => setError('')}
            className="ml-auto p-1 hover:bg-[#B5495B]/10 rounded-lg transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* =====================================================
          FILTER TOOLBAR
      ====================================================== */}
      <div className="border-[#DBDBCF] bg-[#FDFCF0] backdrop-blur-md border  rounded-2xl p-3 sm:p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4 shadow-sm">
        {/* Time Period Pills */}
        <div className="flex items-center bg-[#F7F3EC] p-1 rounded-xl border border-[#E7DFD2]/60 gap-1 overflow-x-auto">
          {timeTabs.map((tab) => {
            const isActive = activeTab === tab
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#2A1F16] shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800 hover:bg-white/50'
                }`}
              >
                {tab}
              </button>
            )
          })}
        </div>

        {/* Date Selection */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2 border-[#DBDBCF] bg-[#FDFCF0] rounded-xl px-3 py-1.5 shadow-2xs hover:border-[#B8863B]/50 transition-colors">
            <Calendar size={14} className="text-neutral-400 shrink-0" />
            <input
              type="date"
              className="text-xs font-semibold text-neutral-800 bg-transparent focus:outline-none cursor-pointer"
            />
          </div>

          <span className="text-xs text-neutral-400 font-bold px-1">to</span>

          <div className="flex items-center gap-2 bg-white border-[#DBDBCF] bg-[#FDFCF0] rounded-xl px-3 py-1.5 shadow-2xs hover:border-[#B8863B]/50 transition-colors">
            <Calendar size={14} className="text-neutral-400 shrink-0" />
            <input
              type="date"
              className="text-xs font-semibold text-neutral-800 bg-transparent focus:outline-none cursor-pointer"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              fetchSummary()
              fetchCharts(
                chartTab === 'Daily'
                  ? 'daily'
                  : chartTab === 'Weekly'
                  ? 'weekly'
                  : 'monthly'
              )
            }}
            className="px-5 py-2 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs hover:opacity-90 active:scale-[0.98] ml-auto sm:ml-0"
            style={{ backgroundColor: INK }}
          >
            Apply
          </button>
        </div>
      </div>

      {/* =====================================================
          METRIC CARDS
      ====================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 border-[#DBDBCF] bg-[#FDFCF0]">
        {[
          {
            label: 'Total Revenue',
            icon: DollarSign,
            value: formatMoney(summary.total_revenue),
            note: 'Completed sales',
            accent: INK,
          },
          {
            label: 'Total Orders',
            icon: ShoppingCart,
            value: summary.total_orders.toLocaleString(),
            note: 'All completed orders',
            accent: GOLD,
          },
          {
            label: 'Avg Order Value',
            icon: TrendingUp,
            value: formatMoney(summary.average_order_value),
            note: 'Average ticket size',
            accent: MATCHA,
          },
          {
            label: 'Refunds',
            icon: RotateCcw,
            value: formatMoney(summary.refunds.amount),
            note: `${summary.refunds.count} total cases`,
            accent: ROSE,
          },
        ].map((card, i) => (
          <div
            key={card.label}
            className="group relative bg-white border border-[#E7DFD2] rounded-2xl p-5 space-y-4 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden"
            style={{
              animation: `reportFadeUp 0.4s ease-out ${i * 70}ms both`,
            }}
          >
            {/* Accent Highlight Bar */}
            <span
              className="absolute inset-x-0 top-0 h-[3px] transition-all duration-300 group-hover:h-[4px]"
              style={{ backgroundColor: card.accent }}
            />

            <div className="flex justify-between items-center text-neutral-500">
              <span className="text-xs font-bold tracking-wider uppercase text-neutral-500">
                {card.label}
              </span>
              <span
                className="p-2 rounded-xl border transition-transform duration-200 group-hover:scale-105"
                style={{
                  backgroundColor: `${card.accent}10`,
                  borderColor: `${card.accent}25`,
                }}
              >
                <card.icon size={16} style={{ color: card.accent }} />
              </span>
            </div>

            <Perforation />

            <div className="space-y-1">
              <div
                className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums tracking-tight"
                style={{ color: INK }}
              >
                {card.value}
              </div>
              <p
                className="text-[11px] font-semibold"
                style={{ color: card.label === 'Refunds' ? ROSE : '#8D7F6F' }}
              >
                {card.note}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* =====================================================
          CHARTS
      ====================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Overview Chart */}
        <div className="lg:col-span-2 bg-white border border-[#E7DFD2] rounded-2xl p-6 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-extrabold text-base font-serif" style={{ color: INK }}>
                Revenue Trends
              </h2>
              <p className="text-[11px] text-neutral-400 font-medium">
                Income visualizer across time periods
              </p>
            </div>

            <div className="flex items-center bg-[#F7F3EC] p-1 rounded-xl border border-[#E7DFD2]/60 text-xs font-bold self-start sm:self-auto">
              {['Daily', 'Weekly', 'Monthly'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleChartTabChange(tab)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    chartTab === tab
                      ? 'bg-white shadow-xs text-[#2A1F16]'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <Perforation />

          {chartLoading ? (
            <div className="h-64 flex items-center justify-center text-neutral-400">
              <Loader2 size={24} className="animate-spin" style={{ color: INK }} />
            </div>
          ) : revenueChart.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-neutral-400 text-xs font-medium">
              No revenue data recorded for this selection.
            </div>
          ) : (
            <div className="relative h-64 w-full pt-2">
              {/* Background Grid */}
              <div className="absolute inset-0 flex flex-col justify-between py-4">
                {[0, 1, 2, 3].map((_, i) => (
                  <div
                    key={i}
                    className="border-b border-dashed"
                    style={{ borderColor: LINE }}
                  />
                ))}
              </div>

              {/* Area SVG Chart */}
              <div className="absolute inset-x-2 top-4 bottom-10">
                <svg
                  className="w-full h-full overflow-visible"
                  viewBox="0 0 600 180"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={INK} stopOpacity="0.18" />
                      <stop offset="100%" stopColor={INK} stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  <path d={revenueAreaPath} fill="url(#revenueFill)" />

                  <polyline
                    points={revenuePoints}
                    fill="none"
                    stroke={INK}
                    strokeWidth="3"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />

                  {revenueCoords.map((pt, idx) => (
                    <g key={idx} className="cursor-pointer group/node">
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="5"
                        fill="white"
                        stroke={INK}
                        strokeWidth="3"
                        className="transition-transform duration-150 group-hover/node:r-7"
                        onMouseEnter={() => setHoveredPoint(pt)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    </g>
                  ))}
                </svg>

                {/* Floating Tooltip */}
                {hoveredPoint && (
                  <div
                    className="absolute pointer-events-none bg-[#2A1F16] text-white px-2.5 py-1.5 rounded-lg text-[11px] font-mono shadow-xl -translate-x-1/2 -translate-y-12 transition-all z-10"
                    style={{
                      left: `${(hoveredPoint.x / 600) * 100}%`,
                      top: `${(hoveredPoint.y / 180) * 100}%`,
                    }}
                  >
                    <div className="font-bold">{formatMoney(hoveredPoint.value)}</div>
                    <div className="text-[9px] text-neutral-300">
                      {hoveredPoint.label}
                    </div>
                  </div>
                )}
              </div>

              {/* X Axis Labels */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] font-bold text-neutral-400 px-2 uppercase tracking-wider">
                {revenueChart.map((item, index) => (
                  <span key={index}>{item.label}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Orders Volume Chart */}
        <div className="bg-white border border-[#E7DFD2] rounded-2xl p-6 space-y-5 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="font-extrabold text-base font-serif" style={{ color: INK }}>
              Order Volume
            </h2>
            <p className="text-[11px] text-neutral-400 font-medium">
              Completed transaction density
            </p>
          </div>

          <Perforation />

          {chartLoading ? (
            <div className="h-64 flex items-center justify-center text-neutral-400">
              <Loader2 size={24} className="animate-spin" style={{ color: INK }} />
            </div>
          ) : ordersChart.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-neutral-400 text-xs font-medium">
              No orders recorded.
            </div>
          ) : (
            <div className="relative h-64 w-full pt-2">
              {/* Background Grid */}
              <div className="absolute inset-0 flex flex-col justify-between py-4">
                {[0, 1, 2, 3].map((_, i) => (
                  <div
                    key={i}
                    className="border-b border-dashed"
                    style={{ borderColor: LINE }}
                  />
                ))}
              </div>

              {/* Bar Elements */}
              <div className="absolute inset-x-2 top-4 bottom-10 flex items-end justify-between gap-2.5">
                {ordersChart.map((item, index) => {
                  const height = (item.value / ordersMax) * 100
                  const isHighest = item.value === ordersMax

                  return (
                    <div
                      key={index}
                      className="flex-1 h-full flex items-end group/bar relative"
                    >
                      <div
                        className="w-full rounded-t-lg transition-all duration-200 group-hover/bar:brightness-95 cursor-pointer"
                        style={{
                          height: `${Math.max(height, 4)}%`,
                          backgroundColor: isHighest ? GOLD : '#EDE7DB',
                        }}
                      />
                      {/* Tooltip */}
                      <div className="opacity-0 group-hover/bar:opacity-100 pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 bg-[#2A1F16] text-white text-[10px] font-mono py-1 px-2 rounded-md transition-opacity whitespace-nowrap z-10">
                        {item.value} orders
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* X Axis */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] font-bold text-neutral-400 px-2 uppercase tracking-wider">
                {ordersChart.map((item, index) => (
                  <span key={index}>{item.label}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}