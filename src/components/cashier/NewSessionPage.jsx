import React, { useState } from 'react'
import {
  ArrowLeft,
  ShoppingBag,
  Users,
  MapPin,
  Check,
} from 'lucide-react'
import {
  useNavigate,
  useParams,
  useLocation,
} from 'react-router-dom'

export default function NewSessionPage({ onBack }) {
  const navigate = useNavigate()
  const { tableId } = useParams()
  const location = useLocation()

  // =========================================================
  // TABLE DATA
  // =========================================================

  const table = location.state?.table || null

  const tableName =
    table?.name ||
    table?.table_number ||
    table?.tableNumber ||
    `Table ${tableId}`

  const capacity =
    table?.capacity ||
    table?.seats ||
    null


  // =========================================================
  // GUESTS
  // =========================================================

  const [guests, setGuests] = useState(2)


  // =========================================================
  // OPEN PRODUCT PAGE
  // =========================================================
  //
  // IMPORTANT:
  // This page is ONLY for DINE_IN.
  //
  // Therefore we explicitly send:
  //
  // orderType: 'DINE_IN'
  //
  // The Product page will then know:
  // - this is DINE_IN
  // - which table
  // - how many guests
  //
  // =========================================================

  const handleToProduct = () => {
    navigate('/product', {
      state: {
        orderType: 'DINE_IN',

        tableId: tableId,

        table: table,

        guests: guests,

        isNewSession: true,
      },
    })
  }


  // =========================================================
  // BACK TO TABLE
  // =========================================================

  const handleBackToTable = () => {
    if (onBack) {
      onBack()
      return
    }

    navigate('/table')
  }


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col text-stone-900 select-none">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="bg-white border-b border-stone-200 px-8 py-4 flex items-center">

        <div className="flex items-center gap-4">

          {/* BACK BUTTON */}

          <button
            type="button"
            onClick={handleBackToTable}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-stone-100 border border-stone-200 hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>


          {/* TITLE */}

          <div>

            <h1 className="font-bold text-lg">
              New Session — {tableName}
            </h1>

            <p className="text-xs text-stone-500 mt-0.5">
              Start a new dine-in order for this table
            </p>

          </div>

        </div>

      </div>


      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div className="flex-1 p-8 max-w-3xl mx-auto w-full">

        <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm">

          {/* =================================================
              TITLE
          ================================================== */}

          <div className="mb-6">

            <div className="flex items-center gap-2">

              <div className="w-9 h-9 rounded-xl bg-stone-900 text-white flex items-center justify-center">
                <UtensilsIcon />
              </div>

              <div>

                <h2 className="font-bold text-base text-stone-900">
                  Configure Seating
                </h2>

                <p className="text-xs text-stone-500 mt-1">
                  Select the number of guests before creating the order.
                </p>

              </div>

            </div>

          </div>


          {/* =================================================
              ORDER TYPE
          ================================================== */}

          <div className="mb-6 rounded-2xl border border-stone-200 bg-stone-50 p-4">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-xl bg-white border border-stone-200 flex items-center justify-center">
                  <MapPin size={17} />
                </div>

                <div>

                  <p className="text-[10px] uppercase tracking-wider font-bold text-stone-400">
                    Order Type
                  </p>

                  <p className="mt-1 text-sm font-extrabold text-stone-900">
                    Dine In
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-1.5 rounded-full bg-stone-900 px-3 py-1.5 text-[10px] font-bold text-white">
                <Check size={12} />
                DINE_IN
              </div>

            </div>

          </div>


          {/* =================================================
              TABLE INFORMATION
          ================================================== */}

          <div className="grid grid-cols-2 gap-3 mb-6">

            {/* TABLE */}

            <div className="rounded-2xl bg-stone-50 border border-stone-200 p-4">

              <div className="flex items-center gap-2">

                <MapPin
                  size={14}
                  className="text-stone-400"
                />

                <p className="text-[10px] uppercase tracking-wider font-bold text-stone-400">
                  Table
                </p>

              </div>

              <p className="mt-2 text-lg font-extrabold text-stone-900">
                {tableName}
              </p>

            </div>


            {/* CAPACITY */}

            <div className="rounded-2xl bg-stone-50 border border-stone-200 p-4">

              <div className="flex items-center gap-2">

                <Users
                  size={14}
                  className="text-stone-400"
                />

                <p className="text-[10px] uppercase tracking-wider font-bold text-stone-400">
                  Capacity
                </p>

              </div>

              <p className="mt-2 text-lg font-extrabold text-stone-900">
                {capacity || '-'}
              </p>

            </div>

          </div>


          {/* =================================================
              GUESTS
          ================================================== */}

          <div className="space-y-3">

            <div>

              <label className="text-xs font-bold text-stone-700">
                Number of Guests
              </label>

              <p className="text-[11px] text-stone-400 mt-1">
                Select how many customers are sitting at this table.
              </p>

            </div>


            <div className="flex flex-wrap gap-3">

              {[1, 2, 4, 6, 8].map((number) => {

                const isSelected =
                  guests === number

                return (
                  <button
                    key={number}
                    type="button"
                    onClick={() => setGuests(number)}
                    className={`w-12 h-12 rounded-2xl text-xs font-bold transition-all cursor-pointer border flex items-center justify-center gap-1 ${
                      isSelected
                        ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >

                    {isSelected && (
                      <Check size={13} />
                    )}

                    {number}

                  </button>
                )
              })}

            </div>

          </div>


          {/* =================================================
              SUMMARY
          ================================================== */}

          <div className="mt-8 rounded-2xl border border-stone-200 bg-[#faf8f5] p-4">

            <p className="text-[10px] uppercase tracking-wider font-bold text-stone-400">
              Session Summary
            </p>

            <div className="mt-3 grid grid-cols-3 gap-3">

              {/* ORDER TYPE */}

              <div>

                <p className="text-[10px] text-stone-400">
                  Order Type
                </p>

                <p className="mt-1 text-xs font-bold text-stone-900">
                  Dine In
                </p>

              </div>


              {/* TABLE */}

              <div>

                <p className="text-[10px] text-stone-400">
                  Table
                </p>

                <p className="mt-1 text-xs font-bold text-stone-900">
                  {tableName}
                </p>

              </div>


              {/* GUESTS */}

              <div>

                <p className="text-[10px] text-stone-400">
                  Guests
                </p>

                <p className="mt-1 text-xs font-bold text-stone-900">
                  {guests}
                </p>

              </div>

            </div>

          </div>


          {/* =================================================
              ACTION
          ================================================== */}

          <div className="mt-8 pt-5 border-t border-stone-200 flex justify-end">

            <button
              type="button"
              onClick={handleToProduct}
              className="px-6 py-3 bg-stone-900 text-white rounded-full text-xs font-bold inline-flex items-center gap-2 hover:bg-stone-800 transition-colors cursor-pointer shadow-sm"
            >

              <ShoppingBag size={16} />

              Open Menu & Add Items

            </button>

          </div>

        </div>

      </div>

    </div>
  )
}


// =========================================================
// SMALL ICON COMPONENT
// =========================================================

function UtensilsIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 2v20" />
      <path d="M3 2v6a4 4 0 0 0 8 0V2" />
      <path d="M3 6h8" />
      <path d="M17 2v20" />
      <path d="M21 2v6a4 4 0 0 1-4 4" />
    </svg>
  )
}