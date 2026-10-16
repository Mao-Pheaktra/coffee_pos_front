import React, { useEffect, useState } from 'react'
import {
  DollarSign,
  ShoppingBag,
  Layers,
  Smartphone,
  CheckCircle2,
  Clock,
  Coffee,
  Loader2,
  RefreshCw,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react'

import { getCashierDashboard } from '../../services/cashierService'

export default function DashboardMetrics() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await getCashierDashboard()
      setDashboard(response?.data || {})
    } catch (err) {
      console.error('Failed to fetch cashier dashboard:', err)
      setError(
        err.response?.data?.message || 'Failed to load cashier dashboard metrics.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 rounded-2xl bg-white/50 border border-slate-100 shadow-xs backdrop-blur-md">
        <Loader2 size={24} className="animate-spin text-slate-800 mb-3" />
        <p className="text-xs font-medium text-slate-500 tracking-wide">
          Syncing dashboard metrics...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-5 shadow-xs backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            <div>
              <p className="text-xs font-semibold text-rose-900">
                Failed to load dashboard metrics
              </p>
              <p className="text-[11px] font-normal text-rose-600/90 mt-0.5">
                {error}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchDashboard}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-rose-900 hover:bg-rose-950 text-white rounded-xl text-xs font-medium transition-all cursor-pointer active:scale-95"
          >
            <RefreshCw size={12} />
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  const {
    total_sales = 0,
    total_orders = 0,
    open_table_sessions = 0,
    pending_orders = 0,
    preparing_orders = 0,
    ready_orders = 0,
    completed_orders = 0,
    e_orders = 0,
    available_tables = 0,
    occupied_tables = 0,
  } = dashboard || {}

  const totalTables = available_tables + occupied_tables
  const tableOccupancyRate =
    totalTables > 0 ? Math.round((open_table_sessions / totalTables) * 100) : 0

  return (
    <div className="space-y-5">
      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Today's Sales - Featured Modern Hero Card */}
        <div className="group relative overflow-hidden bg-white text-white rounded-2xl p-5 shadow-sm border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Sparkles size={14} className="text-emerald-400" />
              <span className="text-[11px] font-semibold tracking-wider uppercase">
                Today's Revenue
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px] font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <TrendingUp size={11} /> Live
            </span>
          </div>

          <div>
            <div className="text-3xl font-extrabold tracking-tight text-slate-900">
              ${Number(total_sales).toFixed(2)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-normal">
              Gross sales record today
            </p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs hover:border-slate-200 transition-all flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Total Orders
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center">
              <ShoppingBag size={16} />
            </div>
          </div>

          <div>
            <div className="text-2xl font-bold tracking-tight text-slate-900">
              {total_orders}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-normal">
              POS counter & online channel
            </p>
          </div>
        </div>

        {/* Table Occupancy */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs hover:border-slate-200 transition-all flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Table Occupancy
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100/60 text-amber-600 flex items-center justify-center">
              <Layers size={16} />
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {open_table_sessions}
                <span className="text-xs font-normal text-slate-400 ml-1">
                  / {totalTables} tables
                </span>
              </span>
              <span className="text-xs font-medium text-amber-600">
                {tableOccupancyRate}%
              </span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div
                className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(tableOccupancyRate, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* E-Orders Card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs hover:border-slate-200 transition-all flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              E-Orders Channel
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100/60 text-sky-600 flex items-center justify-center">
              <Smartphone size={16} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {e_orders}
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5 font-normal">
                Incoming queue
              </p>
            </div>

            <button
              type="button"
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-medium transition-all flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <span>Queue</span>
              <ArrowUpRight size={13} />
            </button>
          </div>
        </div>

      </div>

      {/* Active Order Pipeline */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Active Order Pipeline
          </span>
          <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
            {pending_orders + preparing_orders + ready_orders} Active Orders
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Pending */}
          <div className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-100/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100/80 text-orange-600 flex items-center justify-center shrink-0">
              <Clock size={16} />
            </div>
            <div>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">
                Pending
              </span>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                {pending_orders}
              </span>
            </div>
          </div>

          {/* Preparing */}
          <div className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-100/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100/80 text-amber-600 flex items-center justify-center shrink-0">
              <Coffee size={16} />
            </div>
            <div>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">
                Preparing
              </span>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                {preparing_orders}
              </span>
            </div>
          </div>

          {/* Ready */}
          <div className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-100/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">
                Ready
              </span>
              <span className="text-lg font-bold tracking-tight text-emerald-600">
                {ready_orders}
              </span>
            </div>
          </div>

          {/* Online Queue */}
          <div className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-100/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100/80 text-sky-600 flex items-center justify-center shrink-0">
              <Smartphone size={16} />
            </div>
            <div>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">
                Online Queue
              </span>
              <span className="text-lg font-bold tracking-tight text-sky-600">
                {e_orders}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}