import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Utensils,
  Bell,
  ArrowRight,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { getCustomerTable } from '../../services/customerTableService'

export default function TableWelcomePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [tableNumber, setTableNumber] = useState('')
  const [tableId, setTableId] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [sessionCode, setSessionCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // =========================================================
  // FIND TABLE
  // =========================================================

useEffect(() => {
  const findTable = async () => {
    try {
      setLoading(true)
      setError('')

      /*
       * ================================================
       * GET TABLE NUMBER FROM URL
       * ================================================
       */

      const tableFromUrl =
        searchParams.get('table') ||
        searchParams.get('table_number') ||
        searchParams.get('tableNumber')

      console.log('========================================')
      console.log('TABLE WELCOME')
      console.log('CURRENT URL:', window.location.href)
      console.log('TABLE FROM URL:', tableFromUrl)
      console.log('========================================')

      /*
       * ================================================
       * FALLBACK TO LOCAL STORAGE
       * ================================================
       */

      const storedTable =
        localStorage.getItem('cafe_table')

      const table =
        tableFromUrl ||
        storedTable

      if (!table) {
        setError(
          'No table information was found.'
        )

        return
      }

      /*
       * ================================================
       * FETCH TABLE
       * ================================================
       */

      console.log(
        'Fetching customer table:',
        table
      )

      const response =
        await getCustomerTable(table)

      console.log(
        '========== CUSTOMER TABLE =========='
      )

      console.log(
        'FULL RESPONSE:',
        response
      )

      /*
       * customerTableService returns:
       *
       * response.data
       *
       * Backend:
       *
       * {
       *   message: "...",
       *   data: {
       *      id,
       *      table_number,
       *      active_session
       *   }
       * }
       */

      const data =
        response?.data || response

      console.log(
        'TABLE DATA:',
        data
      )

      if (!data) {
        throw new Error(
          'Table was not found.'
        )
      }

      /*
       * ================================================
       * TABLE NUMBER
       * ================================================
       */

      const number =
        data.table_number ||
        data.tableNumber ||
        table

      setTableNumber(number)

      /*
       * ================================================
       * TABLE ID
       * ================================================
       */

      if (data.id) {
        setTableId(data.id)

        localStorage.setItem(
          'cafe_table_id',
          String(data.id)
        )
      }

      /*
       * ================================================
       * SAVE TABLE NUMBER
       * ================================================
       */

      localStorage.setItem(
        'cafe_table',
        number
      )

      /*
       * ================================================
       * ACTIVE SESSION
       * ================================================
       */

      const activeSession =
        data.active_session ||
        data.activeSession ||
        null

      if (activeSession) {

        console.log(
          'ACTIVE TABLE SESSION:',
          activeSession
        )

        if (activeSession.id) {

          setSessionId(
            activeSession.id
          )

          localStorage.setItem(
            'table_session_id',
            String(activeSession.id)
          )
        }

        if (activeSession.session_code) {

          setSessionCode(
            activeSession.session_code
          )

          localStorage.setItem(
            'table_session_code',
            activeSession.session_code
          )
        }

      } else {

        console.log(
          'No active table session.'
        )

        setSessionId(null)
        setSessionCode('')

        localStorage.removeItem(
          'table_session_id'
        )

        localStorage.removeItem(
          'table_session_code'
        )
      }

    } catch (err) {

      console.error(
        'Failed to fetch customer table:',
        err
      )

      console.error(
        'SERVER RESPONSE:',
        err.response?.data
      )

      setError(
        err.response?.data?.message ||
        err.message ||
        'Unable to find this table.'
      )

    } finally {

      setLoading(false)

    }
  }

  findTable()

}, [searchParams])

  // =========================================================
  // START ORDERING
  // =========================================================

  const handleStartOrdering = () => {

    if (!tableNumber) {
      return
    }

    // -------------------------------------------------------
    // SAVE TABLE
    // -------------------------------------------------------

    localStorage.setItem(
      'cafe_table',
      tableNumber
    )

    // -------------------------------------------------------
    // SAVE TABLE ID
    // -------------------------------------------------------

    if (tableId) {

      localStorage.setItem(
        'cafe_table_id',
        String(tableId)
      )

    }

    // -------------------------------------------------------
    // SAVE SESSION
    // -------------------------------------------------------

    if (sessionId) {

      localStorage.setItem(
        'table_session_id',
        String(sessionId)
      )

    }

    if (sessionCode) {

      localStorage.setItem(
        'table_session_code',
        sessionCode
      )

    }

    // -------------------------------------------------------
    // BUILD MENU URL
    // -------------------------------------------------------

    const params =
      new URLSearchParams()

    if (tableId) {

      params.set(
        'table_id',
        String(tableId)
      )

    }

    if (tableNumber) {

      params.set(
        'table',
        String(tableNumber)
      )

    }

    if (sessionId) {

      params.set(
        'session_id',
        String(sessionId)
      )

    }

    if (sessionCode) {

      params.set(
        'session_code',
        sessionCode
      )

    }

    const menuUrl =
      `/mobile_menu?${params.toString()}`

    console.log('========================================')
    console.log('START ORDERING')
    console.log('TABLE ID:', tableId)
    console.log('TABLE NUMBER:', tableNumber)
    console.log('SESSION ID:', sessionId)
    console.log('SESSION CODE:', sessionCode)
    console.log('MENU URL:', menuUrl)
    console.log('========================================')

    navigate(menuUrl)
  }

  // =========================================================
  // CALL STAFF
  // =========================================================

  const handleCallStaff = () => {

    alert(
      `Assistance requested for Table ${tableNumber}. Staff is on the way!`
    )

  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (
      <div className="min-h-screen bg-[#f3efe8] flex items-center justify-center p-4">

        <div className="w-full max-w-[390px] min-h-[600px] bg-white rounded-[36px] shadow-xl flex flex-col items-center justify-center px-8 text-center">

          <div className="w-16 h-16 rounded-full bg-[#eee5da] flex items-center justify-center mb-5">

            <Loader2
              size={30}
              className="text-[#3e2723] animate-spin"
            />

          </div>

          <h1 className="text-xl font-bold text-[#2d2420]">
            Checking Your Table
          </h1>

          <p className="text-xs text-[#756a62] mt-2 leading-relaxed">
            Please wait while we identify your table.
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
      <div className="min-h-screen bg-[#f3efe8] flex items-center justify-center p-4">

        <div className="w-full max-w-[390px] bg-white rounded-[36px] shadow-xl px-8 py-12 text-center">

          <div className="w-16 h-16 mx-auto rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-5">

            <AlertCircle size={30} />

          </div>

          <h1 className="text-xl font-bold text-[#2d2420]">
            Invalid Table QR
          </h1>

          <p className="text-xs text-[#756a62] leading-relaxed mt-3">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-6 inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#1f1611] text-white rounded-full text-xs font-semibold hover:bg-[#3e2723] transition-colors"
          >

            <RefreshCw size={14} />

            Try Again

          </button>

        </div>

      </div>
    )

  }

  // =========================================================
  // WELCOME PAGE
  // =========================================================

  return (
    <div className="min-h-screen bg-[#f3efe8] flex items-center justify-center p-0 md:p-4">

      <div className="w-full max-w-[390px] min-h-screen md:min-h-[740px] md:rounded-[40px] bg-[#fffdf9] md:border-8 md:border-[#e1d9cf] shadow-xl overflow-hidden flex flex-col justify-between relative">

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="px-6 py-4 bg-[#faf7f2] border-b border-[#e9e2da] flex items-center justify-between">

          <div className="flex items-center gap-2.5">

            <div className="w-8 h-8 rounded-full bg-[#eee5da] text-[#3e2723] flex items-center justify-center">

              <Utensils size={15} />

            </div>

            <span className="font-serif font-bold text-sm text-[#2d2420]">
              Mini Café
            </span>

          </div>

          <div className="px-3 py-1.5 bg-white border border-[#ded6cc] rounded-full text-[11px] font-semibold text-[#3e2723] shadow-sm">

            Table {tableNumber}

          </div>

        </div>

        {/* ===================================================
            MAIN CONTENT
        =================================================== */}

        <div className="px-6 py-6 flex flex-col items-center text-center">

          {/* IMAGE */}

          <div className="w-full max-w-[280px] h-[230px] rounded-[26px] overflow-hidden shadow-md border border-[#e4dcd3] relative">

            <img
              src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600"
              alt="Latte art"
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-black/10" />

          </div>

          {/* WELCOME */}

          <div className="mt-7 space-y-3">

            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8b7c71]">
              Welcome
            </p>

            <h1 className="font-serif text-3xl font-bold text-[#2d2420] tracking-tight leading-tight">

              Welcome to
              <br />

              Table {tableNumber}

            </h1>

            <p className="text-xs text-[#756a62] leading-relaxed max-w-[270px] mx-auto">

              Settle in, browse our menu, and order whenever
              you're ready.

            </p>

          </div>

          {/* TABLE INFORMATION */}

          <div className="mt-6 px-4 py-2.5 rounded-full bg-[#f4eee7] border border-[#e5ddd4]">

            <span className="text-[10px] font-semibold text-[#5f5148]">

              You're ordering from Table {tableNumber}

            </span>

          </div>

          {/* ACTIVE SESSION */}

          {sessionId && (

            <div className="mt-3">

              <span className="text-[9px] text-[#9a8e84]">

                Active dining session

              </span>

            </div>

          )}

        </div>

        {/* ===================================================
            BOTTOM ACTIONS
        =================================================== */}

        <div className="px-6 pb-8 pt-4 space-y-3">

          {/* START ORDERING */}

          <button
            type="button"
            onClick={handleStartOrdering}
            disabled={!tableNumber}
            className="w-full py-3.5 px-4 bg-[#1f1611] text-white rounded-full text-xs font-semibold inline-flex items-center justify-center gap-2 hover:bg-[#3e2723] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >

            Start Ordering

            <ArrowRight size={15} />

          </button>

          {/* CALL STAFF */}

          <button
            type="button"
            onClick={handleCallStaff}
            className="w-full py-3.5 px-4 bg-white border border-[#ded6cc] text-[#2d2420] rounded-full text-xs font-semibold inline-flex items-center justify-center gap-2 hover:bg-[#faf7f2] transition-colors shadow-sm"
          >

            <Bell
              size={15}
              className="text-[#3e2723]"
            />

            Call Staff

          </button>

          <p className="text-center text-[9px] text-[#a0958c] pt-2">

            Mini Café • Secure Table Ordering

          </p>

        </div>

      </div>

    </div>
  )
}