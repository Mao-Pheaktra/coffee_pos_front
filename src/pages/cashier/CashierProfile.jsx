import React, { useEffect, useState } from 'react'
import {
  FileText,
  Clock,
  Star,
  Calendar,
  Pencil,
  ChevronRight,
  Moon,
  Bell,
  Lock,
  History,
  User,
  Mail,
  Phone,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from 'lucide-react'

import { getCashierProfile } from '../../services/profileService'

export default function CashierProfile() {
  const [cashier, setCashier] = useState(null)

  const [darkMode, setDarkMode] = useState(false)
  const [notificationSounds, setNotificationSounds] = useState(true)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // =========================================================
  // LOAD CASHIER PROFILE
  // =========================================================

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true)
        setError('')

        // -----------------------------------------------------
        // First get cached logged-in user
        // -----------------------------------------------------

        const storedUser = localStorage.getItem('user')

        let localUser = null

        if (storedUser) {
          try {
            localUser = JSON.parse(storedUser)
          } catch (err) {
            console.error('Invalid user in localStorage:', err)
          }
        }

        // -----------------------------------------------------
        // Try API
        // -----------------------------------------------------

        try {
          const response = await getCashierProfile()

          const apiUser =
            response?.data?.data ||
            response?.data ||
            response

          if (apiUser) {
            setCashier({
              ...localUser,
              ...apiUser,
            })

            // Update localStorage with latest user
            localStorage.setItem(
              'user',
              JSON.stringify({
                ...localUser,
                ...apiUser,
              })
            )

            return
          }
        } catch (apiError) {
          console.warn(
            'Failed to fetch cashier profile from API. Using local user.',
            apiError
          )
        }

        // -----------------------------------------------------
        // Fallback to localStorage
        // -----------------------------------------------------

        if (localUser) {
          setCashier(localUser)
        } else {
          throw new Error('Unable to load cashier profile.')
        }
      } catch (err) {
        console.error('Failed to load cashier profile:', err)

        setError(
          err?.response?.data?.message ||
            err?.message ||
            'Failed to load cashier profile.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={26}
            className="animate-spin text-[#3d271d]"
          />

          <p className="text-xs font-semibold text-neutral-500">
            Loading cashier profile...
          </p>
        </div>
      </div>
    )
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error && !cashier) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />

          <div>
            <p className="text-sm font-bold">
              Failed to load profile
            </p>

            <p className="mt-1 text-xs">
              {error}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // =========================================================
  // USER DATA
  // =========================================================

  const name =
    cashier?.name ||
    cashier?.username ||
    cashier?.full_name ||
    'Cashier'

  const email =
    cashier?.email ||
    'No email available'

  const phone =
    cashier?.phone ||
    cashier?.phone_number ||
    'No phone number'

  const role =
    cashier?.role ||
    'cashier'

  const userId =
    cashier?.id ||
    cashier?.user_id ||
    '-'

  const avatar =
    cashier?.avatar ||
    cashier?.profile_image ||
    cashier?.image ||
    cashier?.photo ||
    null

  const avatarUrl =
    avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=3d271d&color=fff&size=200`

  const formattedRole =
    String(role)
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase())

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-4 font-sans text-neutral-800 sm:p-6">

      {/* =====================================================
          TOP PROFILE HEADER
      ====================================================== */}

      <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">

        {/* Decorative line */}
        <div className="absolute left-0 right-0 top-0 h-1 bg-[#3d271d]" />

        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">

          {/* PROFILE */}
          <div className="flex items-center gap-4">

            {/* Avatar */}
            <div className="relative shrink-0">
              <img
                src={avatarUrl}
                alt={name}
                className="h-16 w-16 rounded-full border-2 border-neutral-100 object-cover shadow-xs"
                onError={(event) => {
                  event.currentTarget.src =
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      name
                    )}&background=3d271d&color=fff&size=200`
                }}
              />

              {/* Online */}
              <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-emerald-500" />
            </div>

            <div>

              <h1 className="text-xl font-extrabold tracking-tight text-neutral-900">
                {name}
              </h1>

              <p className="mt-0.5 text-xs font-semibold capitalize text-neutral-500">
                {formattedRole}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold">

                <span className="text-neutral-400">
                  ID: #{userId}
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  Active
                </span>

              </div>
            </div>
          </div>

          {/* EDIT */}
          <button
            type="button"
            className="inline-flex cursor-pointer items-center gap-1.5 self-start rounded-xl border border-neutral-200/60 bg-neutral-100 px-3.5 py-1.5 text-xs font-bold text-neutral-700 transition-colors hover:bg-neutral-200/80 sm:self-center"
          >
            <Pencil size={13} />
            Edit Profile
          </button>

        </div>
      </div>

      {/* =====================================================
          MAIN GRID
      ====================================================== */}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

        {/* ===================================================
            LEFT
        ==================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">

          {/* TOTAL ORDERS */}

          <div className="flex flex-col justify-between space-y-6 rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs">

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Total Orders Handled
              </span>

              <FileText
                size={16}
                className="text-neutral-400"
              />
            </div>

            <div>
              <div className="text-3xl font-extrabold tracking-tight text-neutral-900">
                {cashier?.metrics?.totalOrders || '0'}
              </div>

              <p className="mt-2 text-[11px] font-semibold text-neutral-400">
                Orders processed
              </p>
            </div>
          </div>

          {/* TRANSACTION TIME */}

          <div className="flex flex-col justify-between space-y-6 rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs">

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Avg Transaction Time
              </span>

              <Clock
                size={16}
                className="text-neutral-400"
              />
            </div>

            <div>
              <div className="text-3xl font-extrabold tracking-tight text-neutral-900">
                {cashier?.metrics?.avgTransactionTime || '--'}
              </div>

              <p className="mt-2 text-[11px] font-semibold text-neutral-400">
                Average processing time
              </p>
            </div>
          </div>

          {/* CUSTOMER RATING */}

          <div className="flex flex-col justify-between space-y-6 rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs">

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Customer Rating
              </span>

              <Star
                size={16}
                className="text-neutral-400"
              />
            </div>

            <div>
              <div className="flex items-baseline text-3xl font-extrabold tracking-tight text-neutral-900">
                {cashier?.metrics?.customerRating || '--'}

                {cashier?.metrics?.customerRating && (
                  <span className="ml-1 text-sm font-semibold text-neutral-400">
                    /5.0
                  </span>
                )}
              </div>

              <p className="mt-2 text-[11px] font-semibold text-neutral-400">
                {cashier?.metrics?.reviewCount
                  ? `Based on ${cashier.metrics.reviewCount} reviews`
                  : 'No reviews available'}
              </p>
            </div>
          </div>

          {/* TOTAL SHIFTS */}

          <div className="flex flex-col justify-between space-y-6 rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs">

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Total Shifts
              </span>

              <Calendar
                size={16}
                className="text-neutral-400"
              />
            </div>

            <div>
              <div className="text-3xl font-extrabold tracking-tight text-neutral-900">
                {cashier?.metrics?.totalShifts || '0'}
              </div>

              <p className="mt-2 text-[11px] font-semibold text-neutral-400">
                {cashier?.metrics?.startDate
                  ? `Since ${cashier.metrics.startDate}`
                  : 'Shift information'}
              </p>
            </div>
          </div>

        </div>

        {/* ===================================================
            RIGHT COLUMN
        ==================================================== */}

        <div className="space-y-4">

          {/* PERSONAL INFORMATION */}

          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs">

            <h3 className="text-sm font-bold text-neutral-900">
              Personal Information
            </h3>

            <div className="space-y-3">

              {/* EMAIL */}

              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase text-neutral-400">
                  Email Address
                </label>

                <div className="flex items-center gap-2 truncate rounded-xl border border-neutral-200/60 bg-neutral-100/70 px-3 py-2 text-xs font-semibold text-neutral-700">
                  <Mail
                    size={13}
                    className="shrink-0 text-neutral-400"
                  />

                  <span className="truncate">
                    {email}
                  </span>
                </div>
              </div>

              {/* PHONE */}

              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase text-neutral-400">
                  Phone Number
                </label>

                <div className="flex items-center gap-2 rounded-xl border border-neutral-200/60 bg-neutral-100/70 px-3 py-2 text-xs font-semibold text-neutral-700">
                  <Phone
                    size={13}
                    className="shrink-0 text-neutral-400"
                  />

                  <span>
                    {phone}
                  </span>
                </div>
              </div>

              {/* ROLE */}

              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase text-neutral-400">
                  Account Role
                </label>

                <div className="flex items-center gap-2 rounded-xl border border-neutral-200/60 bg-neutral-100/70 px-3 py-2 text-xs font-semibold capitalize text-neutral-700">
                  <ShieldCheck
                    size={13}
                    className="shrink-0 text-neutral-400"
                  />

                  <span>
                    {formattedRole}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* SECURITY */}

          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs">

            <h3 className="text-sm font-bold text-neutral-900">
              Security & Preferences
            </h3>

            <div className="space-y-2.5">

              {/* CHANGE PIN */}

              <button
                type="button"
                className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-neutral-200/80 bg-white p-3 text-xs font-bold text-neutral-800 transition-colors hover:bg-neutral-50"
              >
                <div className="flex items-center gap-2.5">
                  <Lock
                    size={15}
                    className="text-neutral-500"
                  />

                  <span>
                    Change POS PIN
                  </span>
                </div>

                <ChevronRight
                  size={15}
                  className="text-neutral-400"
                />
              </button>

              {/* DARK MODE */}

              <div className="flex items-center justify-between p-2">

                <div className="flex items-center gap-2.5 text-xs font-semibold text-neutral-700">
                  <Moon
                    size={15}
                    className="text-neutral-500"
                  />

                  <span>
                    Dark Mode
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setDarkMode((prev) => !prev)}
                  className={`relative h-5 w-9 cursor-pointer rounded-full p-0.5 transition-colors ${
                    darkMode
                      ? 'bg-neutral-900'
                      : 'bg-neutral-200'
                  }`}
                >
                  <div
                    className={`h-4 w-4 rounded-full bg-white shadow-xs transition-transform ${
                      darkMode
                        ? 'translate-x-4'
                        : 'translate-x-0'
                    }`}
                  />
                </button>

              </div>

              {/* NOTIFICATION SOUND */}

              <div className="flex items-center justify-between p-2">

                <div className="flex items-center gap-2.5 text-xs font-semibold text-neutral-700">
                  <Bell
                    size={15}
                    className="text-neutral-500"
                  />

                  <span>
                    Notification Sounds
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setNotificationSounds((prev) => !prev)
                  }
                  className={`relative h-5 w-9 cursor-pointer rounded-full p-0.5 transition-colors ${
                    notificationSounds
                      ? 'bg-neutral-900'
                      : 'bg-neutral-200'
                  }`}
                >
                  <div
                    className={`h-4 w-4 rounded-full bg-white shadow-xs transition-transform ${
                      notificationSounds
                        ? 'translate-x-4'
                        : 'translate-x-0'
                    }`}
                  />
                </button>

              </div>

            </div>
          </div>

        </div>
      </div>

      {/* =====================================================
          SHIFT HISTORY
      ====================================================== */}

      <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-xs">

        <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50/50 px-5 py-4">

          <div className="flex items-center gap-2">

            <History
              size={16}
              className="text-neutral-700"
            />

            <h3 className="text-sm font-bold text-neutral-900">
              Shift History
            </h3>

          </div>

          <button
            type="button"
            className="cursor-pointer text-xs font-semibold text-neutral-500 hover:text-neutral-900"
          >
            View All
          </button>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full border-collapse text-left">

            <thead>
              <tr className="border-b border-neutral-100 text-[10px] font-bold uppercase tracking-wider text-neutral-400">

                <th className="px-5 py-3">
                  Date
                </th>

                <th className="px-5 py-3">
                  Role
                </th>

                <th className="px-5 py-3">
                  Time In
                </th>

                <th className="px-5 py-3">
                  Time Out
                </th>

                <th className="px-5 py-3">
                  Total Hours
                </th>

                <th className="px-5 py-3 text-right">
                  Status
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-100 text-xs font-semibold text-neutral-700">

              {cashier?.shiftHistory?.length > 0 ? (
                cashier.shiftHistory.map((shift) => (
                  <tr
                    key={shift.id}
                    className="transition-colors hover:bg-neutral-50/60"
                  >

                    <td className="px-5 py-3.5 font-bold text-neutral-900">
                      {shift.date}
                    </td>

                    <td className="px-5 py-3.5 text-neutral-500">
                      {shift.role}
                    </td>

                    <td className="px-5 py-3.5">
                      {shift.timeIn}
                    </td>

                    <td className="px-5 py-3.5 text-neutral-400">
                      {shift.timeOut}
                    </td>

                    <td className="px-5 py-3.5 font-bold">
                      {shift.totalHours}
                    </td>

                    <td className="px-5 py-3.5 text-right">

                      <span className="inline-flex items-center rounded-md border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                        {shift.status}
                      </span>

                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-10 text-center text-xs font-medium text-neutral-400"
                  >
                    No shift history available.
                  </td>
                </tr>
              )}

            </tbody>

          </table>
        </div>
      </div>

    </div>
  )
}