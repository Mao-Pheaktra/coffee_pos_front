import React, { useEffect, useMemo, useState } from 'react'
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Utensils,
  CheckCircle2,
  Users,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Save,
  Hash,
  UserRound,
  QrCode,
} from 'lucide-react'

import {
  getAdminTables,
  getAdminTableSummary,
  getAdminTable,
  createAdminTable,
  updateAdminTable,
  deleteAdminTable,
} from '../../services/adminTableService'

export default function Table() {
  const [tables, setTables] = useState([])

  const [summary, setSummary] = useState({
    total_tables: 0,
    available_tables: 0,
    occupied_tables: 0,
    inactive_tables: 0,
  })

  const [loading, setLoading] = useState(true)
  const [summaryLoading, setSummaryLoading] = useState(true)

  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')

  const [page, setPage] = useState(1)
  const [perPage] = useState(10)

  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)

  // View
  const [viewingTable, setViewingTable] = useState(null)
  const [viewLoading, setViewLoading] = useState(false)

  // Create
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // Edit
  const [editingTable, setEditingTable] = useState(null)

  // Submit
  const [submitLoading, setSubmitLoading] = useState(false)

  // Delete
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const [formData, setFormData] = useState({
    table_number: '',
    capacity: 2,
    status: 'available',
  })

  // ========================================
  // FETCH SUMMARY
  // ========================================

  const fetchSummary = async () => {
    try {
      setSummaryLoading(true)

      const response = await getAdminTableSummary()

      setSummary(
        response?.data || {
          total_tables: 0,
          available_tables: 0,
          occupied_tables: 0,
          inactive_tables: 0,
        }
      )
    } catch (err) {
      console.error('Failed to fetch table summary:', err)
    } finally {
      setSummaryLoading(false)
    }
  }

  // ========================================
  // FETCH TABLES
  // ========================================

  const fetchTables = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await getAdminTables({
        page,
        perPage,
        search,
        status:
          selectedStatus === 'All'
            ? ''
            : selectedStatus.toLowerCase(),
      })

      const pagination = response?.data || response

      if (Array.isArray(pagination)) {
        setTables(pagination)
        setLastPage(1)
        setTotal(pagination.length)
      } else {
        setTables(pagination?.data || [])
        setLastPage(pagination?.last_page || 1)
        setTotal(pagination?.total || 0)
      }
    } catch (err) {
      console.error('Failed to fetch tables:', err)

      setError(
        err?.response?.data?.message ||
          'Failed to load tables.'
      )

      setTables([])
    } finally {
      setLoading(false)
    }
  }

  // ========================================
  // INITIAL SUMMARY
  // ========================================

  useEffect(() => {
    fetchSummary()
  }, [])

  // ========================================
  // FETCH TABLES
  // ========================================

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTables()
    }, 300)

    return () => clearTimeout(timer)
  }, [page, search, selectedStatus])

  // ========================================
  // OPEN CREATE
  // ========================================

  const handleOpenCreate = () => {
    setFormData({
      table_number: '',
      capacity: 2,
      status: 'available',
    })

    setIsCreateOpen(true)
  }

  // ========================================
  // CREATE
  // ========================================

  const handleCreateSubmit = async (e) => {
    e.preventDefault()

    try {
      setSubmitLoading(true)
      setError('')

      await createAdminTable({
        table_number: formData.table_number.trim(),
        capacity: Number(formData.capacity),
        status: formData.status,
      })

      setIsCreateOpen(false)

      await Promise.all([
        fetchTables(),
        fetchSummary(),
      ])
    } catch (err) {
      console.error('Failed to create table:', err)

      const validationErrors =
        err?.response?.data?.errors

      if (validationErrors) {
        const firstError =
          Object.values(validationErrors)[0]?.[0]

        setError(
          firstError ||
            'Validation failed.'
        )
      } else {
        setError(
          err?.response?.data?.message ||
            'Failed to create table.'
        )
      }
    } finally {
      setSubmitLoading(false)
    }
  }

  // ========================================
  // VIEW
  // ========================================

  const handleOpenView = async (table) => {
    try {
      setViewLoading(true)

      setViewingTable(table)

      const response =
        await getAdminTable(table.id)

      setViewingTable(
        response?.data ||
          response ||
          table
      )
    } catch (err) {
      console.error(
        'Failed to fetch table:',
        err
      )
    } finally {
      setViewLoading(false)
    }
  }

  // ========================================
  // EDIT
  // ========================================

  const handleOpenEdit = (table) => {
    setEditingTable(table)

    setFormData({
      table_number:
        table.table_number || '',
      capacity:
        table.capacity || 2,
      status:
        String(
          table.status || 'available'
        ).toLowerCase(),
    })
  }

  // ========================================
  // UPDATE
  // ========================================

  const handleUpdateSubmit = async (e) => {
    e.preventDefault()

    try {
      setSubmitLoading(true)
      setError('')

      await updateAdminTable(
        editingTable.id,
        {
          table_number:
            formData.table_number.trim(),
          capacity:
            Number(formData.capacity),
          status:
            formData.status,
        }
      )

      setEditingTable(null)

      await Promise.all([
        fetchTables(),
        fetchSummary(),
      ])
    } catch (err) {
      console.error(
        'Failed to update table:',
        err
      )

      const validationErrors =
        err?.response?.data?.errors

      if (validationErrors) {
        const firstError =
          Object.values(validationErrors)[0]?.[0]

        setError(
          firstError ||
            'Validation failed.'
        )
      } else {
        setError(
          err?.response?.data?.message ||
            'Failed to update table.'
        )
      }
    } finally {
      setSubmitLoading(false)
    }
  }

  // ========================================
  // DELETE
  // ========================================

  const handleDelete = async (table) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete ${table.table_number}?`
      )

    if (!confirmed) return

    try {
      setDeleteLoading(true)
      setDeleteId(table.id)
      setError('')

      await deleteAdminTable(table.id)

      await Promise.all([
        fetchTables(),
        fetchSummary(),
      ])
    } catch (err) {
      console.error(
        'Failed to delete table:',
        err
      )

      setError(
        err?.response?.data?.message ||
          'Failed to delete table.'
      )
    } finally {
      setDeleteLoading(false)
      setDeleteId(null)
    }
  }

  // ========================================
  // STATUS
  // ========================================

  const getTableStatus = (table) => {
    const status = String(
      table.status || 'available'
    ).toLowerCase()

    if (status === 'available') {
      return 'Available'
    }

    if (status === 'occupied') {
      return 'Occupied'
    }

    if (status === 'inactive') {
      return 'Inactive'
    }

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    )
  }

  const getStatusClass = (status) => {
    const normalized =
      String(status).toLowerCase()

    if (normalized === 'available') {
      return {
        badge:
          'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot:
          'bg-emerald-500',
      }
    }

    if (normalized === 'occupied') {
      return {
        badge:
          'bg-amber-50 text-amber-700 border-amber-200',
        dot:
          'bg-amber-500',
      }
    }

    return {
      badge:
        'bg-stone-100 text-stone-600 border-stone-200',
      dot:
        'bg-stone-400',
    }
  }

  // ========================================
  // DISPLAY
  // ========================================

  const displayedTables = useMemo(() => {
    return tables
  }, [tables])

  // ========================================
  // FORM
  // ========================================

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto  text-neutral-900">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight font-(--font-heading)">
            Table Management
          </h2>

          <p className="text-xs text-neutral-500 font-medium mt-1">
            Manage dining areas, capacities, and QR assignments.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-5 py-2.5 bg-[#1f1611] text-white rounded-full text-xs font-bold flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors cursor-pointer shadow-sm"
        >
          <Plus size={16} />
          Add Table
        </button>
      </div>

      {/* ======================================
          ERROR
      ====================================== */}

      {error && (
        <div className="flex items-center justify-between gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-medium">

          <div className="flex items-center gap-2">
            <X size={15} />
            <span>{error}</span>
          </div>

          <button
            type="button"
            onClick={() => setError('')}
          >
            <X size={14} />
          </button>

        </div>
      )}

      {/* ======================================
          METRICS
      ====================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* TOTAL */}

        <div className="border-[#DBDBCF] bg-[#FDFCF0] rounded-[20px] p-5 space-y-3 shadow-2xs">

          <div className="flex justify-between items-center text-neutral-500 text-xs font-medium">

            <span>TOTAL TABLES</span>

            <span className="p-1.5 bg-neutral-100 border border-neutral-200 rounded-lg">
              <Utensils size={16} />
            </span>

          </div>

          <div className="font-extrabold text-xl text-neutral-900">

            {summaryLoading ? (
              <Loader2
                size={20}
                className="animate-spin text-neutral-400"
              />
            ) : (
              summary.total_tables
            )}

          </div>

        </div>

        {/* AVAILABLE */}

        <div className="border-[#DBDBCF] bg-[#FDFCF0] rounded-[20px] p-5 space-y-3 shadow-2xs">

          <div className="flex justify-between items-center text-neutral-500 text-xs font-medium">

            <span>AVAILABLE</span>

            <span className="p-1.5 bg-emerald-50 border border-emerald-100 rounded-lg">
              <CheckCircle2
                size={16}
                className="text-emerald-600"
              />
            </span>

          </div>

          <div className="font-extrabold text-xl text-neutral-900">

            {summaryLoading ? (
              <Loader2
                size={20}
                className="animate-spin text-neutral-400"
              />
            ) : (
              summary.available_tables
            )}

          </div>

        </div>

        {/* OCCUPIED */}

        <div className="border-[#DBDBCF] bg-[#FDFCF0] rounded-[20px] p-5 space-y-3 shadow-2xs">

          <div className="flex justify-between items-center text-neutral-500 text-xs font-medium">

            <span>OCCUPIED</span>

            <span className="p-1.5 bg-amber-50 border border-amber-100 rounded-lg">
              <Users
                size={16}
                className="text-amber-600"
              />
            </span>

          </div>

          <div className="font-extrabold text-xl text-neutral-900">

            {summaryLoading ? (
              <Loader2
                size={20}
                className="animate-spin text-neutral-400"
              />
            ) : (
              summary.occupied_tables
            )}

          </div>

        </div>

      </div>

      {/* ======================================
          TABLE CARD
      ====================================== */}

      <div className="border-[#DBDBCF] bg-[#FDFCF0] rounded-3xl p-6 space-y-6 shadow-2xs">

        {/* SEARCH / FILTER */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          <div className="relative w-full sm:w-80">

            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search table number..."
              className="w-full px-4 py-2.5 border-[#DBDBCF] bg-[#FDFCF0] rounded-full text-xs font-medium text-neutral-900 focus:outline-none focus:border-neutral-400 shadow-2xs"
            />

          </div>

          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg">

            {[
              'All',
              'Available',
              'Occupied',
              'Inactive',
            ].map((status) => (

              <button
                key={status}
                type="button"
                onClick={() => {
                  setSelectedStatus(status)
                  setPage(1)
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  selectedStatus === status
                    ? 'bg-white text-neutral-900 shadow-sm font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {status}
              </button>

            ))}

          </div>

        </div>

        {/* ======================================
            TABLE
        ====================================== */}

        <div className="overflow-x-auto">

          <table className="w-full text-left text-xs">

            <thead>

              <tr className="border-b border-neutral-200 text-neutral-400 font-semibold">

                <th className="pb-3 uppercase tracking-wider text-[10px]">
                  Table No.
                </th>

                <th className="pb-3 uppercase tracking-wider text-[10px]">
                  Capacity
                </th>

                <th className="pb-3 uppercase tracking-wider text-[10px]">
                  Status
                </th>

                <th className="pb-3 uppercase tracking-wider text-[10px]">
                  QR Code
                </th>

                <th className="pb-3 uppercase tracking-wider text-[10px] text-right">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-neutral-200">

              {loading ? (

                <tr>

                  <td
                    colSpan="5"
                    className="py-16 text-center"
                  >

                    <div className="flex justify-center items-center gap-2 text-neutral-400">

                      <Loader2
                        size={18}
                        className="animate-spin"
                      />

                      Loading tables...

                    </div>

                  </td>

                </tr>

              ) : displayedTables.length === 0 ? (

                <tr>

                  <td
                    colSpan="5"
                    className="py-16 text-center text-neutral-400"
                  >
                    No tables found.
                  </td>

                </tr>

              ) : (

                displayedTables.map((table) => {

                  const status =
                    getTableStatus(table)

                  const statusStyle =
                    getStatusClass(
                      table.status
                    )

                  return (

                    <tr
                      key={table.id}
                      className="hover:bg-neutral-50 transition-colors"
                    >

                      {/* TABLE NUMBER */}

                      <td className="py-3.5">

                        <div className="flex items-center gap-3">

                          <div className="w-8 h-8 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center">

                            <Utensils
                              size={14}
                              className="text-neutral-500"
                            />

                          </div>

                          <span className="font-bold text-neutral-900">
                            {table.table_number}
                          </span>

                        </div>

                      </td>

                      {/* CAPACITY */}

                      <td className="py-3.5">

                        <div className="flex items-center gap-2 text-neutral-600">

                          <Users size={14} />

                          <span className="font-bold text-neutral-900">
                            {table.capacity}
                          </span>

                          <span className="text-neutral-400">
                            seats
                          </span>

                        </div>

                      </td>

                      {/* STATUS */}

                      <td className="py-3.5">

                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${statusStyle.badge}`}
                        >

                          <span
                            className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}
                          />

                          {status}

                        </span>

                      </td>

                      {/* QR */}

                      <td className="py-3.5">

                        {table.qr_code ? (

                          <div className="flex items-center gap-2">

                            <img
                              src={table.qr_code}
                              alt={`QR ${table.table_number}`}
                              className="w-10 h-10 border border-neutral-200 rounded-md bg-white"
                            />

                            <QrCode
                              size={14}
                              className="text-neutral-400"
                            />

                          </div>

                        ) : (

                          <span className="text-neutral-400">
                            No QR
                          </span>

                        )}

                      </td>

                      {/* ACTIONS */}

                      <td className="py-3.5 text-left">

                        <div className="inline-flex items-center gap-1.5">

                          <button
                            type="button"
                            onClick={() =>
                              handleOpenView(
                                table
                              )
                            }
                            className="p-1.5 bg-white border border-neutral-200 rounded-md hover:bg-neutral-100 text-neutral-600 transition-colors cursor-pointer"
                            title="View"
                          >
                            <Eye size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleOpenEdit(
                                table
                              )
                            }
                            className="p-1.5 bg-white border border-neutral-200 rounded-md hover:bg-neutral-100 text-neutral-600 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>

                          <button
                            type="button"
                            disabled={
                              deleteLoading &&
                              deleteId ===
                                table.id
                            }
                            onClick={() =>
                              handleDelete(
                                table
                              )
                            }
                            className="p-1.5 bg-white border border-neutral-200 rounded-md hover:bg-red-50 text-red-600 transition-colors cursor-pointer disabled:opacity-50"
                            title="Delete"
                          >

                            {deleteLoading &&
                            deleteId ===
                              table.id ? (
                              <Loader2
                                size={14}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2
                                size={14}
                              />
                            )}

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

        {/* ======================================
            PAGINATION
        ====================================== */}

        <div className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">

          <div>

            Showing{' '}

            <span className="font-semibold text-neutral-900">

              {tables.length === 0
                ? 0
                : (page - 1) *
                    perPage +
                  1}

            </span>

            {' '}to{' '}

            <span className="font-semibold text-neutral-900">

              {(page - 1) *
                perPage +
                tables.length}

            </span>

            {' '}of{' '}

            <span className="font-semibold text-neutral-900">
              {total}
            </span>{' '}
            tables

          </div>

          <div className="flex items-center gap-1">

            <button
              type="button"
              disabled={page <= 1}
              onClick={() =>
                setPage((p) =>
                  Math.max(1, p - 1)
                )
              }
              className="w-8 h-8 rounded-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-100 text-neutral-500 disabled:text-neutral-300 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>

            <span className="px-3 text-xs font-semibold text-neutral-700">
              Page {page} of {lastPage}
            </span>

            <button
              type="button"
              disabled={page >= lastPage}
              onClick={() =>
                setPage((p) =>
                  Math.min(
                    lastPage,
                    p + 1
                  )
                )
              }
              className="w-8 h-8 rounded-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-100 text-neutral-500 disabled:text-neutral-300 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>

          </div>

        </div>

      </div>

      {/* ======================================
          CREATE / EDIT MODAL
      ====================================== */}

      {(isCreateOpen || editingTable) && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm">

          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6 border border-neutral-200 shadow-xl">

            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">

              <div className="flex items-center gap-2">

                {editingTable ? (
                  <Edit
                    size={18}
                    className="text-neutral-700"
                  />
                ) : (
                  <Plus
                    size={18}
                    className="text-neutral-700"
                  />
                )}

                <h3 className="text-base font-semibold text-neutral-900">

                  {editingTable
                    ? 'Edit Table'
                    : 'Add New Table'}

                </h3>

              </div>

              <button
                type="button"
                onClick={() => {
                  setIsCreateOpen(false)
                  setEditingTable(null)
                }}
                className="text-neutral-400 hover:text-neutral-600 p-1 rounded-lg hover:bg-neutral-100 cursor-pointer"
              >
                <X size={18} />
              </button>

            </div>

            <form
              onSubmit={
                editingTable
                  ? handleUpdateSubmit
                  : handleCreateSubmit
              }
              className="space-y-4"
            >

              {/* TABLE NUMBER */}

              <div>

                <label className="block text-neutral-600 text-xs font-semibold mb-1.5">
                  Table Number
                </label>

                <div className="relative">

                  <Hash
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  />

                  <input
                    type="text"
                    required
                    value={
                      formData.table_number
                    }
                    onChange={(e) =>
                      handleFormChange(
                        'table_number',
                        e.target.value
                      )
                    }
                    placeholder="T-01"
                    className="w-full pl-9 pr-3 py-2.5 border border-neutral-200 rounded-lg text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400"
                  />

                </div>

              </div>

              {/* CAPACITY */}

              <div>

                <label className="block text-neutral-600 text-xs font-semibold mb-1.5">
                  Capacity
                </label>

                <div className="relative">

                  <Users
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  />

                  <input
                    type="number"
                    required
                    min="1"
                    value={
                      formData.capacity
                    }
                    onChange={(e) =>
                      handleFormChange(
                        'capacity',
                        e.target.value
                      )
                    }
                    className="w-full pl-9 pr-3 py-2.5 border border-neutral-200 rounded-lg text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400"
                  />

                </div>

              </div>

              {/* STATUS */}

              <div>

                <label className="block text-neutral-600 text-xs font-semibold mb-1.5">
                  Status
                </label>

                <select
                  value={formData.status}
                  onChange={(e) =>
                    handleFormChange(
                      'status',
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-xs text-neutral-800 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400"
                >

                  <option value="available">
                    Available
                  </option>

                  <option value="occupied">
                    Occupied
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>

                </select>

              </div>

              {/* BUTTONS */}

              <div className="pt-4 flex justify-end gap-2 border-t border-neutral-100">

                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false)
                    setEditingTable(null)
                  }}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1f1611] hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg cursor-pointer disabled:opacity-50"
                >

                  {submitLoading ? (
                    <Loader2
                      size={14}
                      className="animate-spin"
                    />
                  ) : editingTable ? (
                    <Save size={14} />
                  ) : (
                    <Plus size={14} />
                  )}

                  {editingTable
                    ? 'Save Changes'
                    : 'Create Table'}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* ======================================
          VIEW MODAL
      ====================================== */}

      {viewingTable && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm">

          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 border border-neutral-200 shadow-xl">

            <div className="flex items-start justify-between border-b border-neutral-100 pb-4">

              <div>

                <h3 className="text-lg font-bold text-neutral-900">
                  {viewingTable.table_number}
                </h3>

                <p className="text-xs text-neutral-400">
                  Table ID: #{viewingTable.id}
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setViewingTable(null)
                }
                className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X size={18} />
              </button>

            </div>

            {viewLoading ? (

              <div className="py-8 flex justify-center">

                <Loader2
                  size={20}
                  className="animate-spin text-neutral-400"
                />

              </div>

            ) : (

              <div className="space-y-4">

                <div className="grid grid-cols-2 gap-4">

                  <div className="bg-neutral-50 rounded-xl p-4">

                    <p className="text-[10px] uppercase font-bold text-neutral-400">
                      Capacity
                    </p>

                    <p className="text-lg font-bold text-neutral-900 mt-1">
                      {viewingTable.capacity}
                    </p>

                    <p className="text-[11px] text-neutral-400">
                      seats
                    </p>

                  </div>

                  <div className="bg-neutral-50 rounded-xl p-4">

                    <p className="text-[10px] uppercase font-bold text-neutral-400">
                      Status
                    </p>

                    <p className="text-sm font-bold text-neutral-900 mt-2">
                      {getTableStatus(
                        viewingTable
                      )}
                    </p>

                  </div>

                </div>

                {viewingTable.qr_code && (

                  <div className="flex flex-col items-center gap-3 border border-neutral-200 rounded-xl p-4">

                    <p className="text-xs font-semibold text-neutral-600">
                      Table QR Code
                    </p>

                    <img
                      src={
                        viewingTable.qr_code
                      }
                      alt={`QR ${viewingTable.table_number}`}
                      className="w-48 h-48"
                    />

                  </div>

                )}

              </div>

            )}

            <div className="flex justify-end border-t border-neutral-100 pt-4">

              <button
                type="button"
                onClick={() =>
                  setViewingTable(null)
                }
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-lg cursor-pointer"
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