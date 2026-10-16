import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  QrCode,
  RefreshCw,
  Loader2,
  Users,
  AlertCircle,
  Maximize2,
  X,
  ExternalLink,
} from 'lucide-react'
import { getAdminCafeTables } from '../../services/cafeTableService'

export default function TableQrPage() {
  const navigate = useNavigate()

  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedTable, setSelectedTable] = useState(null)

  // =========================================================
  // FETCH TABLES
  // =========================================================

  const fetchTables = async () => {
    try {
      setLoading(true)
      setError('')

      console.log('========================================')
      console.log('FETCH ADMIN CAFE TABLES')
      console.log('========================================')

      const response = await getAdminCafeTables()

      console.log('FULL RESPONSE:', response)

      /*
       * Expected Laravel response:
       *
       * {
       *   message: "Cafe tables retrieved successfully",
       *   data: {
       *     current_page: 1,
       *     data: [
       *       {...},
       *       {...}
       *     ]
       *   }
       * }
       */

      const tablesData =
        response?.data?.data ||
        response?.data ||
        []

      /*
       * Safety check
       *
       * Prevent:
       *
       * tables.filter is not a function
       *
       * or
       *
       * tables.map is not a function
       */

      const normalizedTables = Array.isArray(tablesData)
        ? tablesData
        : []

      console.log('TABLE DATA:', normalizedTables)
      console.log(
        'TABLE COUNT:',
        normalizedTables.length
      )

      setTables(normalizedTables)

    } catch (err) {
      console.error(
        'Failed to fetch cafe tables:',
        err
      )

      console.error(
        'SERVER RESPONSE:',
        err.response?.data
      )

      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to load cafe tables.'
      )

      setTables([])

    } finally {
      setLoading(false)
    }
  }

  // =========================================================
  // LOAD TABLES
  // =========================================================

  useEffect(() => {
    fetchTables()
  }, [])

  // =========================================================
  // OPEN QR MODAL
  // =========================================================

  const handleOpenQR = (table) => {
    setSelectedTable(table)
  }

  // =========================================================
  // CLOSE QR MODAL
  // =========================================================

  const handleCloseQR = () => {
    setSelectedTable(null)
  }

  // =========================================================
  // GET CUSTOMER WELCOME URL
  // =========================================================

  const getWelcomeUrl = (tableNumber) => {
    return `/table_welcome?table=${encodeURIComponent(
      tableNumber
    )}`
  }

  // =========================================================
  // SIMULATE QR SCAN
  // =========================================================

const handleSimulateScan = (table) => {
  if (!table?.table_number) {
    console.error('Cannot simulate scan: table number is missing.')
    return
  }

  const tableNumber = table.table_number

  console.log('========================================')
  console.log('SIMULATE QR SCAN')
  console.log('TABLE ID:', table.id)
  console.log('TABLE NUMBER:', tableNumber)
  console.log('========================================')

  setSelectedTable(null)

  navigate(
    `/table_welcome?table=${encodeURIComponent(tableNumber)}`
  )
}

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f0ea] flex items-center justify-center p-6">

        <div className="flex flex-col items-center text-center">

          <div className="w-14 h-14 rounded-2xl bg-[#e9dfd3] flex items-center justify-center mb-4">

            <Loader2
              size={26}
              className="text-[#3e2723] animate-spin"
            />

          </div>

          <h2 className="text-lg font-bold text-[#2d2420]">
            Loading Table QR Codes
          </h2>

          <p className="text-sm text-[#796c62] mt-1">
            Please wait...
          </p>

        </div>

      </div>
    )
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="min-h-screen bg-[#f4f0ea] flex items-center justify-center p-6">

        <div className="w-full max-w-md bg-white border border-[#dfd6cc] rounded-3xl shadow-sm p-8 text-center">

          <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-4">

            <AlertCircle
              size={28}
              className="text-red-500"
            />

          </div>

          <h1 className="text-xl font-bold text-[#2d2420]">
            Unable to Load Tables
          </h1>

          <p className="text-sm text-[#796c62] mt-2 leading-relaxed">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchTables}
            className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#1f1611] text-white text-sm font-semibold hover:bg-[#3e2723] transition-colors"
          >
            <RefreshCw size={16} />
            Try Again
          </button>

        </div>

      </div>
    )
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="min-h-screen bg-[#f4f0ea] p-5 md:p-8">

      <div className="max-w-7xl mx-auto">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-2xl bg-[#e9dfd3] flex items-center justify-center">

              <QrCode
                size={25}
                className="text-[#3e2723]"
              />

            </div>

            <div>

              <h1 className="text-2xl md:text-3xl font-bold text-[#2d2420]">
                Table QR Codes
              </h1>

              <p className="text-sm text-[#796c62] mt-1">
                Scan a QR code or simulate a scan to open the
                customer table welcome page.
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={fetchTables}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white border border-[#ded6cc] text-[#3e2723] text-sm font-semibold hover:bg-[#faf8f5] transition-colors shadow-sm"
          >

            <RefreshCw size={16} />

            Refresh

          </button>

        </div>

        {/* =====================================================
            INFORMATION
        ===================================================== */}

        <div className="mb-8 bg-[#fffaf4] border border-[#eadfd3] rounded-3xl p-5">

          <div className="flex items-start gap-3">

            <div className="w-10 h-10 rounded-xl bg-[#eee5da] flex items-center justify-center flex-shrink-0">

              <QrCode
                size={19}
                className="text-[#3e2723]"
              />

            </div>

            <div>

              <h3 className="text-sm font-bold text-[#2d2420]">
                Table QR Ordering
              </h3>

              <p className="text-xs text-[#796c62] leading-relaxed mt-1">
                Customers can scan the actual QR code with
                their phone. For testing, click
                <strong> Simulate QR Scan</strong>.
              </p>

            </div>

          </div>

        </div>

        {/* =====================================================
            NO TABLES
        ===================================================== */}

        {tables.length === 0 ? (

          <div className="bg-white border border-[#ded6cc] rounded-3xl p-12 text-center">

            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#eee5da] flex items-center justify-center mb-5">

              <QrCode
                size={32}
                className="text-[#8d8177]"
              />

            </div>

            <h2 className="text-xl font-bold text-[#2d2420]">
              No Tables Found
            </h2>

            <p className="text-sm text-[#796c62] mt-2">
              Create a cafe table from the table management page.
            </p>

          </div>

        ) : (

          /* =====================================================
             TABLE GRID
          ===================================================== */

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

            {tables.map((table) => (

              <div
                key={table.id}
                className="bg-white border border-[#ded6cc] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >

                {/* =================================================
                    CARD HEADER
                ================================================= */}

                <div className="px-5 py-4 border-b border-[#eee7df] flex items-center justify-between">

                  <div>

                    <p className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#9a8d83]">
                      Table
                    </p>

                    <h2 className="text-xl font-bold text-[#2d2420] mt-0.5">
                      #{table.table_number}
                    </h2>

                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-[#796c62]">

                    <Users
                      size={14}
                      className="text-[#82756b]"
                    />

                    <span>
                      {table.capacity || 0} Seats
                    </span>

                  </div>

                </div>

                {/* =================================================
                    QR IMAGE
                ================================================= */}

                <div className="p-5">

                  <div className="relative bg-[#faf9f7] border border-[#eee7df] rounded-2xl p-5">

                    {table.qr_code ? (

                      <>

                        <img
                          src={table.qr_code}
                          alt={`QR Code for Table ${table.table_number}`}
                          className="w-full aspect-square object-contain"
                        />

                        {/* View QR */}

                        <button
                          type="button"
                          onClick={() =>
                            handleOpenQR(table)
                          }
                          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white border border-[#ded6cc] shadow-sm flex items-center justify-center text-[#3e2723] hover:bg-[#f7f3ee] transition-colors"
                          title="View QR"
                        >

                          <Maximize2 size={15} />

                        </button>

                      </>

                    ) : (

                      <div className="aspect-square flex flex-col items-center justify-center text-center">

                        <QrCode
                          size={42}
                          className="text-[#b5aaa1] mb-3"
                        />

                        <p className="text-xs font-medium text-[#8d8177]">
                          QR code unavailable
                        </p>

                      </div>

                    )}

                  </div>

                </div>

                {/* =================================================
                    ACTION
                ================================================= */}

                <div className="px-5 pb-5">

                  <button
                    type="button"
                    onClick={() =>
                      handleSimulateScan(table)
                    }
                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#3e2723] text-white text-xs font-bold hover:bg-[#2d1b18] active:scale-[0.98] transition-all shadow-sm"
                  >

                    <ExternalLink size={14} />

                    Simulate QR Scan

                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

      {/* =========================================================
          QR MODAL
      ========================================================= */}

      {selectedTable && (

        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-5"
          onClick={handleCloseQR}
        >

          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* ===================================================
                MODAL HEADER
            =================================================== */}

            <div className="px-6 py-5 border-b border-[#eee7df] flex items-center justify-between">

              <div>

                <p className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#9a8d83]">
                  Table QR
                </p>

                <h2 className="text-xl font-bold text-[#2d2420] mt-1">
                  Table #{selectedTable.table_number}
                </h2>

              </div>

              <button
                type="button"
                onClick={handleCloseQR}
                className="w-9 h-9 rounded-full bg-[#f5f1ec] flex items-center justify-center text-[#5f5148] hover:bg-[#ece6df] transition-colors"
              >

                <X size={18} />

              </button>

            </div>

            {/* ===================================================
                MODAL BODY
            =================================================== */}

            <div className="p-8">

              {selectedTable.qr_code ? (

                <div className="bg-[#faf9f7] border border-[#eee7df] rounded-3xl p-6">

                  <img
                    src={selectedTable.qr_code}
                    alt={`QR Code for Table ${selectedTable.table_number}`}
                    className="w-full max-w-[320px] mx-auto aspect-square object-contain"
                  />

                </div>

              ) : (

                <div className="h-80 flex flex-col items-center justify-center">

                  <QrCode
                    size={50}
                    className="text-[#b5aaa1] mb-4"
                  />

                  <p className="text-sm text-[#796c62]">
                    QR code is unavailable.
                  </p>

                </div>

              )}

              {/* =================================================
                  TABLE INFO
              ================================================= */}

              <div className="mt-5 bg-[#faf7f2] rounded-2xl p-4">

                <p className="text-xs text-[#796c62] text-center leading-relaxed">

                  This QR code belongs to

                  <span className="font-bold text-[#3e2723]">
                    {' '}
                    Table #{selectedTable.table_number}
                  </span>

                  .

                </p>

              </div>

              {/* =================================================
                  SIMULATE QR
              ================================================= */}

              <button
                type="button"
                onClick={() =>
                  handleSimulateScan(selectedTable)
                }
                className="w-full mt-5 py-3.5 rounded-2xl bg-[#3e2723] text-white text-xs font-bold inline-flex items-center justify-center gap-2 hover:bg-[#2d1b18] active:scale-[0.98] transition-all shadow-md"
              >

                <ExternalLink size={14} />

                Simulate QR Scan

              </button>

              {/* =================================================
                  CLOSE
              ================================================= */}

              <button
                type="button"
                onClick={handleCloseQR}
                className="w-full mt-2 py-3.5 rounded-2xl text-[#796c62] text-xs font-semibold hover:bg-[#faf7f2] transition-colors"
              >

                Close

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}