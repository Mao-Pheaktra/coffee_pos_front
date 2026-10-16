import React, { useState } from 'react'
import {
  Bell,
  User,
  Plus,
  Minus,
  X,
  Users,
  ArrowRight,
  ExternalLink,
  Loader2,
  RefreshCw,
  Utensils,
  ShoppingBag,
  AlertCircle,
  RotateCcw,
} from 'lucide-react'

import { getCashierTables } from '../../services/cashierService'
import { useNavigate } from 'react-router-dom'

export default function NavbarCashier({
  onOpenNewOrder,
  onGoToTables,
}) {
  const [showNewOrder, setShowNewOrder] = useState(false)
  const navigate = useNavigate()

  // Order information
  const [orderType, setOrderType] = useState('DINE_IN')
  const [selectedTable, setSelectedTable] = useState('')
  const [selectedTableData, setSelectedTableData] = useState(null)
  const [guests, setGuests] = useState(1)

  // Tables
  const [tables, setTables] = useState([])
  const [loadingTables, setLoadingTables] = useState(false)
  const [tableError, setTableError] = useState('')

  // =========================================================
  // FETCH AVAILABLE TABLES
  // =========================================================

  const fetchAvailableTables = async () => {
    try {
      setLoadingTables(true)
      setTableError('')

      const response = await getCashierTables()

      const tableData =
        Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : Array.isArray(response?.data?.data)
              ? response.data.data
              : []

      // ONLY AVAILABLE TABLES
      const availableTables = tableData.filter(
        (table) =>
          String(table?.status || '').toUpperCase() === 'AVAILABLE'
      )

      setTables(availableTables)
    } catch (error) {
      console.error('Failed to load available tables:', error)

      setTables([])

      setTableError(
        error?.response?.data?.message ||
          'Failed to load available tables.'
      )
    } finally {
      setLoadingTables(false)
    }
  }

  // =========================================================
  // OPEN NEW ORDER
  // =========================================================

  const handleOpenNewOrder = () => {
    setShowNewOrder(true)

    // Default state
    setOrderType('DINE_IN')
    setSelectedTable('')
    setSelectedTableData(null)
    setGuests(1)

    // Fetch only available tables
    fetchAvailableTables()
  }

  // =========================================================
  // CLOSE NEW ORDER
  // =========================================================

  const handleCloseNewOrder = () => {
    setShowNewOrder(false)

    setOrderType('DINE_IN')
    setSelectedTable('')
    setSelectedTableData(null)
    setGuests(1)
  }

  // =========================================================
  // CLEAR ORDER INFORMATION
  // =========================================================

  const handleClear = () => {
    setOrderType('DINE_IN')
    setSelectedTable('')
    setSelectedTableData(null)
    setGuests(1)

    // Refresh available tables
    fetchAvailableTables()
  }

  // =========================================================
  // SELECT ORDER TYPE
  // =========================================================

  const handleSelectOrderType = (type) => {
    setOrderType(type)

    // Reset table and guests whenever order type changes
    setSelectedTable('')
    setSelectedTableData(null)
    setGuests(1)

    if (type === 'DINE_IN') {
      fetchAvailableTables()
    }
  }

  // =========================================================
  // SELECT TABLE
  // =========================================================

  const handleSelectTable = (table) => {
    setSelectedTable(table.id)
    setSelectedTableData(table)

    // Reset guest number when changing table
    setGuests(1)
  }

  // =========================================================
  // GUEST COUNTER
  // =========================================================

  const getTableCapacity = () => {
    if (!selectedTableData) return 1

    return Number(
      selectedTableData.capacity ||
        selectedTableData.max_capacity ||
        selectedTableData.maxCapacity ||
        1
    )
  }

  const handleIncrementGuests = () => {
    const capacity = getTableCapacity()

    setGuests((prev) => {
      if (prev >= capacity) {
        return prev
      }

      return prev + 1
    })
  }

  const handleDecrementGuests = () => {
    setGuests((prev) => Math.max(1, prev - 1))
  }

  // =========================================================
  // START ORDER
  // =========================================================

  const handleStartOrder = () => {
    if (!orderType) return

    // Dine-in requires table
    if (orderType === 'DINE_IN' && !selectedTable) {
      return
    }

    const orderData = {
      // Main order type
      orderType,

      // Table ID
      tableId:
        orderType === 'DINE_IN'
          ? selectedTable
          : null,

      // Complete table object
      table:
        orderType === 'DINE_IN'
          ? selectedTableData
          : null,

      // Number of guests
      guests:
        orderType === 'DINE_IN'
          ? guests
          : null,

      // Useful aliases
      tableName:
        orderType === 'DINE_IN'
          ? (
              selectedTableData?.name ||
              selectedTableData?.table_number ||
              selectedTableData?.tableNumber ||
              selectedTable
            )
          : null,

      capacity:
        orderType === 'DINE_IN'
          ? getTableCapacity()
          : null,
    }

    console.log('Starting order with:', orderData)

    // Close modal
    setShowNewOrder(false)

    // Send data to parent
    if (onOpenNewOrder) {
      onOpenNewOrder(orderData)
    }
  }

  // =========================================================
  // GO TO TABLES PAGE
  // =========================================================

  const handleGoToTablesPage = () => {
    setShowNewOrder(false)

    if (onGoToTables) {
      onGoToTables()
    }
  }

  // =========================================================
  // TABLE NAME HELPER
  // =========================================================

  const getTableName = (table) => {
    return (
      table?.name ||
      table?.table_number ||
      table?.tableNumber ||
      table?.id ||
      'Unknown'
    )
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <header className="flex h-16 shrink-0 items-center justify-between border-b border-stone-200 bg-[#FDFCF8] px-6 shadow-sm sm:px-8">

        {/* LEFT */}
        <div className="flex items-center gap-8">

          <h1 className="text-xl font-extrabold tracking-tight text-[#1f1611]">
            Plouk Cafe
          </h1>

          
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 sm:gap-4">

          {/* NOTIFICATION */}
          <button
            type="button"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-stone-100 hover:text-[#1f1611]"
          >
            <Bell size={18} />
          </button>

          {/* USER */}
          {/* USER PROFILE */}
        <button
          type="button"
          onClick={() => navigate('/cashier_profile')}
          title="My Profile"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-stone-500 transition-all hover:bg-[#1f1611] hover:text-white hover:border-[#1f1611] active:scale-95"
        >
          <User size={18} />
        </button>

          {/* NEW ORDER */}
          <button
            type="button"
            onClick={handleOpenNewOrder}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#1f1611] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#36241c] active:scale-[0.98]"
          >
            <Plus size={15} />
            <span>New Order</span>
          </button>

        </div>
      </header>

      {/* =====================================================
          NEW ORDER MODAL
      ====================================================== */}

      {showNewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">

          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">

            {/* =================================================
                MODAL HEADER
            ================================================== */}

            <div className="flex items-center justify-between border-b border-stone-100 px-8 py-6">

              <div>
                <h2 className="text-xl font-bold tracking-tight text-stone-900">
                  New Order
                </h2>

                <p className="mt-1 text-xs text-stone-500">
                  Select the service type and table
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseNewOrder}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
              >
                <X size={18} />
              </button>

            </div>

            {/* =================================================
                MODAL BODY
            ================================================== */}

            <div className="space-y-6 px-8 py-6">

              {/* =================================================
                  ORDER TYPE
              ================================================== */}

              <div className="flex items-center justify-between">

                <div className="flex justify-center">

                  <div className="inline-flex rounded-full bg-stone-100 p-1">

                    {/* DINE IN */}
                    <button
                      type="button"
                      onClick={() =>
                        handleSelectOrderType('DINE_IN')
                      }
                      className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-7 py-2 text-xs font-bold tracking-wider transition-all ${
                        orderType === 'DINE_IN'
                          ? 'bg-[#1f1611] text-white shadow-sm'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      <Utensils size={13} />
                      DINE-IN
                    </button>

                    {/* TAKEAWAY */}
                    <button
                      type="button"
                      onClick={() =>
                        handleSelectOrderType('TAKEAWAY')
                      }
                      className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-7 py-2 text-xs font-bold tracking-wider transition-all ${
                        orderType === 'TAKEAWAY'
                          ? 'bg-[#1f1611] text-white shadow-sm'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      <ShoppingBag size={13} />
                      TAKEAWAY
                    </button>

                  </div>

                </div>

                {/* CLEAR BUTTON */}
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-[11px] font-bold text-stone-600 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  title="Clear table, guests and order type"
                >
                  <RotateCcw size={13} />
                  Clear
                </button>

              </div>

              {/* =================================================
                  DINE-IN
              ================================================== */}

              {orderType === 'DINE_IN' && (
                <div className="space-y-4">

                  {/* HEADER */}
                  <div className="flex items-center justify-between">

                    <div>
                      <h3 className="text-sm font-bold text-stone-800">
                        Select Available Table
                      </h3>

                      <p className="mt-1 text-[11px] text-stone-400">
                        Only currently available tables are shown.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">

                      {/* REFRESH */}
                      <button
                        type="button"
                        onClick={fetchAvailableTables}
                        disabled={loadingTables}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-500 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Refresh tables"
                      >
                        {loadingTables ? (
                          <Loader2
                            size={14}
                            className="animate-spin"
                          />
                        ) : (
                          <RefreshCw size={14} />
                        )}
                      </button>

                      {/* TABLE LAYOUT */}
                      <button
                        type="button"
                        onClick={handleGoToTablesPage}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-[11px] font-semibold text-stone-700 transition hover:bg-stone-100 hover:text-stone-900"
                      >
                        <span>View Tables Layout</span>
                        <ExternalLink size={12} />
                      </button>

                    </div>
                  </div>

                  {/* =================================================
                      ERROR
                  ================================================== */}

                  {tableError && (
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-3">

                      <div className="flex items-center gap-2">

                        <AlertCircle
                          size={15}
                          className="shrink-0 text-red-500"
                        />

                        <p className="text-xs font-semibold text-red-700">
                          {tableError}
                        </p>

                      </div>

                      <button
                        type="button"
                        onClick={fetchAvailableTables}
                        className="text-[11px] font-bold text-red-700 hover:underline"
                      >
                        Retry
                      </button>

                    </div>
                  )}

                  {/* =================================================
                      LOADING
                  ================================================== */}

                  {loadingTables && (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-stone-200 bg-stone-50 py-10">

                      <Loader2
                        size={24}
                        className="animate-spin text-stone-500"
                      />

                      <p className="mt-3 text-xs font-semibold text-stone-500">
                        Loading available tables...
                      </p>

                    </div>
                  )}

                  {/* =================================================
                      TABLE LIST
                  ================================================== */}

                  {!loadingTables && !tableError && (
                    <>
                      {tables.length === 0 ? (

                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 bg-stone-50 py-10 text-center">

                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
                            <Users size={22} />
                          </div>

                          <p className="mt-3 text-sm font-bold text-stone-700">
                            No tables available
                          </p>

                          <p className="mt-1 text-[11px] text-stone-400">
                            All tables are currently occupied.
                          </p>

                        </div>

                      ) : (

                        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">

                          {tables.map((table) => {

                            const isSelected =
                              String(selectedTable) ===
                              String(table.id)

                            const tableCapacity = Number(
                              table.capacity ||
                                table.max_capacity ||
                                table.maxCapacity ||
                                0
                            )

                            return (
                              <button
                                key={table.id}
                                type="button"
                                onClick={() =>
                                  handleSelectTable(table)
                                }
                                className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border py-5 transition-all ${
                                  isSelected
                                    ? 'border-[#1f1611] bg-[#F5F0EA] text-[#1f1611] shadow-sm ring-2 ring-[#1f1611]'
                                    : 'border-stone-200 bg-white text-stone-800 hover:border-stone-300 hover:bg-stone-50'
                                }`}
                              >

                                <span className="text-2xl font-black">
                                  {getTableName(table)}
                                </span>

                                <div className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-stone-400">

                                  <Users size={12} />

                                  <span>
                                    {tableCapacity}
                                  </span>

                                </div>

                              </button>
                            )
                          })}

                        </div>

                      )}
                    </>
                  )}

                  {/* =================================================
                      SELECTED TABLE + GUESTS
                  ================================================== */}

                  {selectedTableData && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        {/* TABLE INFORMATION */}
                        <div>

                          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                            Selected Table
                          </p>

                          <p className="mt-0.5 text-sm font-extrabold text-emerald-950">

                            Table {getTableName(selectedTableData)}

                            <span className="ml-2 text-xs font-normal text-emerald-700">
                              Max Capacity: {getTableCapacity()}
                            </span>

                          </p>

                        </div>

                        {/* GUEST COUNTER */}
                        <div className="flex items-center gap-3">

                          <span className="text-xs font-bold text-stone-700">
                            Number of Guests:
                          </span>

                          <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white p-1 shadow-sm">

                            {/* MINUS */}
                            <button
                              type="button"
                              onClick={handleDecrementGuests}
                              disabled={guests <= 1}
                              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-stone-200 bg-stone-50 text-stone-600 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
                              title="Decrease guests"
                            >
                              <Minus size={13} />
                            </button>

                            {/* NUMBER */}
                            <span className="w-7 text-center text-xs font-extrabold text-stone-900 tabular-nums">
                              {guests}
                            </span>

                            {/* PLUS */}
                            <button
                              type="button"
                              onClick={handleIncrementGuests}
                              disabled={
                                guests >= getTableCapacity()
                              }
                              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg bg-[#1f1611] text-white transition hover:bg-[#36241c] disabled:cursor-not-allowed disabled:opacity-40"
                              title={`Maximum ${getTableCapacity()} guests`}
                            >
                              <Plus size={13} />
                            </button>

                          </div>

                        </div>

                      </div>

                    </div>
                  )}

                </div>
              )}

              {/* =================================================
                  TAKEAWAY
              ================================================== */}

              {orderType === 'TAKEAWAY' && (
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6 text-center">

                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#1f1611] shadow-sm">
                    <ShoppingBag size={22} />
                  </div>

                  <p className="mt-3 text-sm font-bold text-stone-800">
                    Takeaway Order
                  </p>

                  <p className="mt-1 text-xs text-stone-500">
                    No table selection is required.
                    Continue to the product menu.
                  </p>

                </div>
              )}

            </div>

            {/* =================================================
                MODAL FOOTER
            ================================================== */}

            <div className="flex items-center justify-between border-t border-stone-100 px-8 py-5">

              {/* CLEAR */}
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-bold text-stone-600 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <RotateCcw size={14} />
                Clear
              </button>

              <div className="flex items-center gap-6">

                {/* CANCEL */}
                <button
                  type="button"
                  onClick={handleCloseNewOrder}
                  className="cursor-pointer text-xs font-bold text-stone-600 transition hover:text-stone-900"
                >
                  Cancel
                </button>

                {/* START */}
                <button
                  type="button"
                  disabled={
                    !orderType ||
                    (
                      orderType === 'DINE_IN' &&
                      !selectedTable
                    )
                  }
                  onClick={handleStartOrder}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#1f1611] px-6 py-3 text-xs font-bold text-white transition-all hover:bg-[#36241c] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span>Start Order</span>
                  <ArrowRight size={15} />
                </button>

              </div>

            </div>

          </div>
        </div>
      )}
    </>
  )
}