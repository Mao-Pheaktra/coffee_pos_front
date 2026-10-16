import React, { useEffect, useState, useCallback } from 'react'
import { Loader2, RefreshCw, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getCashierTables } from '../../services/cashierService'

// Helper to normalize multi-format API payloads safely
const extractTableList = (response) => {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response?.data?.data)) return response.data.data
  if (Array.isArray(response?.tables)) return response.tables
  if (Array.isArray(response?.data?.tables)) return response.data.tables
  return []
}

// Helper to resolve normalized table statuses
const getTableStatus = (table) => {
  const status = String(
    table?.status ||
      table?.table_status ||
      table?.availability_status ||
      ''
  ).toLowerCase()

  if (['needs_bill', 'needs bill', 'bill'].includes(status)) {
    return 'needs_bill'
  }

  if (['occupied', 'busy'].includes(status)) {
    return 'occupied'
  }

  return 'available'
}

export default function TableOverview() {
  const navigate = useNavigate()

  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchTables = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const response = await getCashierTables()
      const tableList = extractTableList(response)
      
      setTables(tableList)
    } catch (err) {
      console.error('Failed to fetch cashier tables:', err)
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Failed to load tables.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTables()
  }, [fetchTables])

  const handleViewMap = () => {
    navigate('/table')
  }

  const handleTableClick = (table) => {
    navigate('/table', { state: { table } })
  }

  if (loading) {
    return (
      <div className="bg-[var(--color-neutral)] border border-[var(--color-border)] rounded-[20px] p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-[family-name:var(--font-heading)] font-bold text-sm">
            Tables Overview
          </h3>
          <Loader2
            size={16}
            className="animate-spin text-[var(--color-text-secondary)]"
          />
        </div>

        <div className="flex items-center justify-center py-10">
          <div className="text-center">
            <Loader2
              size={24}
              className="mx-auto mb-2 animate-spin text-[var(--color-primary)]"
            />
            <p className="text-xs font-medium text-[var(--color-text-secondary)]">
              Loading tables...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-[var(--color-neutral)] border border-[var(--color-border)] rounded-[20px] p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-[family-name:var(--font-heading)] font-bold text-sm">
            Tables Overview
          </h3>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-xs font-semibold text-red-700">{error}</p>
          <button
            type="button"
            onClick={fetchTables}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#1f1611] px-3 py-2 text-xs font-bold text-white hover:bg-[#362922] transition-colors"
          >
            <RefreshCw size={13} />
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[var(--color-neutral)] border border-[var(--color-border)] rounded-[20px] p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-[family-name:var(--font-heading)] font-bold text-sm">
          Tables Overview
        </h3>

        <button
          type="button"
          onClick={handleViewMap}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)] hover:underline bg-transparent border-none cursor-pointer"
        >
          <MapPin size={13} />
          View Map
        </button>
      </div>

      {/* Table Grid / Empty State */}
      {tables.length === 0 ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
          <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
            No tables found.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {tables.map((table) => {
            const status = getTableStatus(table)
            const isOccupied = status === 'occupied'
            const needsBill = status === 'needs_bill'

            const tableName =
              table?.name ||
              table?.table_number ||
              table?.tableNumber ||
              `Table ${table?.id}`

            const statusDotColor = needsBill
              ? 'bg-amber-400'
              : isOccupied
              ? 'bg-red-400'
              : 'bg-emerald-500'

            const statusLabel = needsBill
              ? 'Needs Bill'
              : isOccupied
              ? 'Occupied'
              : 'Available'

            return (
              <button
                key={table.id}
                type="button"
                onClick={() => handleTableClick(table)}
                className={`h-24 rounded-[16px] p-3 flex flex-col justify-between shadow-xs text-left transition-all hover:-translate-y-0.5 ${
                  isOccupied || needsBill
                    ? 'bg-[#1f1611] text-white hover:bg-[#2b1d16]'
                    : 'bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)]'
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="font-bold text-xs truncate max-w-[80%]">
                    {tableName}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${statusDotColor}`} />
                </div>

                <div
                  className={`text-[10px] font-medium ${
                    isOccupied || needsBill
                      ? 'text-amber-200'
                      : 'text-[var(--color-text-secondary)]'
                  }`}
                >
                  {statusLabel}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}