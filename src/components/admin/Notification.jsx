import React, { useEffect, useState } from 'react'
import {
  getNotificationSettings,
  updateNotificationSettings,
} from '../../services/notificationSettingService'

export default function Notification() {
  const [settings, setSettings] = useState({
    new_order: true,
    order_confirmed: true,
    order_ready: true,
    order_cancelled: true,
    payment_received: true,
    new_user_registration: true,
    low_product_availability: true,
    daily_summary_report: false,
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // =========================
  // FETCH SETTINGS
  // =========================

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await getNotificationSettings()

      setSettings({
        new_order: Boolean(response.data.new_order),
        order_confirmed: Boolean(response.data.order_confirmed),
        order_ready: Boolean(response.data.order_ready),
        order_cancelled: Boolean(response.data.order_cancelled),
        payment_received: Boolean(response.data.payment_received),
        new_user_registration: Boolean(
          response.data.new_user_registration
        ),
        low_product_availability: Boolean(
          response.data.low_product_availability
        ),
        daily_summary_report: Boolean(
          response.data.daily_summary_report
        ),
      })
    } catch (err) {
      console.error(
        'Failed to fetch notification settings:',
        err
      )

      setError(
        err.response?.data?.message ||
        'Failed to load notification settings.'
      )
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // TOGGLE
  // =========================

  const toggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  // =========================
  // SAVE
  // =========================

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const payload = {
        new_order: settings.new_order,
        order_confirmed: settings.order_confirmed,
        order_ready: settings.order_ready,
        order_cancelled: settings.order_cancelled,
        payment_received: settings.payment_received,
        new_user_registration: settings.new_user_registration,
        low_product_availability:
          settings.low_product_availability,
        daily_summary_report: settings.daily_summary_report,
      }

      const response =
        await updateNotificationSettings(payload)

      setSettings({
        new_order: Boolean(response.data.new_order),
        order_confirmed: Boolean(response.data.order_confirmed),
        order_ready: Boolean(response.data.order_ready),
        order_cancelled: Boolean(response.data.order_cancelled),
        payment_received: Boolean(response.data.payment_received),
        new_user_registration: Boolean(
          response.data.new_user_registration
        ),
        low_product_availability: Boolean(
          response.data.low_product_availability
        ),
        daily_summary_report: Boolean(
          response.data.daily_summary_report
        ),
      })

      setSuccess(
        'Notification settings saved successfully.'
      )

      setTimeout(() => {
        setSuccess('')
      }, 3000)
    } catch (err) {
      console.error(
        'Failed to save notification settings:',
        err
      )

      setError(
        err.response?.data?.message ||
        'Failed to save notification settings.'
      )
    } finally {
      setSaving(false)
    }
  }

  // =========================
  // CANCEL
  // =========================

  const handleCancel = () => {
    fetchSettings()
    setError('')
    setSuccess('')
  }

  // =========================
  // TOGGLE COMPONENT
  // =========================

  const Toggle = ({ setting }) => (
    <button
      type="button"
      onClick={() => toggleSetting(setting)}
      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
        settings[setting]
          ? 'bg-[#1f1611]'
          : 'bg-neutral-300'
      }`}
    >
      <div
        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
          settings[setting]
            ? 'translate-x-5'
            : 'translate-x-0'
        }`}
      />
    </button>
  )

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="text-sm font-semibold text-neutral-500">
          Loading notification settings...
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6">

      {/* ================= HEADER ================= */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">

        <div>
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight font-[family-name:var(--font-heading)]">
            Notification Settings
          </h2>

          <p className="text-xs text-neutral-500 font-medium">
            Manage how and when your staff or admin team receives
            alerts and updates.
          </p>
        </div>

        <div className="flex items-center gap-3">

          <button
            type="button"
            onClick={handleCancel}
            disabled={saving}
            className="px-4 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
          >
            CANCEL
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-[#1f1611] text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            {saving ? 'SAVING...' : 'SAVE CHANGES'}
          </button>

        </div>
      </div>

      {/* ================= MESSAGE ================= */}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-xs font-semibold">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-xs font-semibold">
          {success}
        </div>
      )}

      {/* ================= ALERT TRIGGERS ================= */}

      <div className="bg-white border border-neutral-200 rounded-[24px] p-6 space-y-4 shadow-2xs">

        <h3 className="font-bold text-sm text-neutral-900">
          Alert Triggers
        </h3>

        <div className="divide-y divide-neutral-100">

          {/* NEW ORDER */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-bold text-xs text-neutral-900">
                New Order Received
              </div>

              <div className="text-[11px] text-neutral-500 font-medium">
                Notify staff when a new order is received.
              </div>
            </div>

            <Toggle setting="new_order" />
          </div>

          {/* ORDER CONFIRMED */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-bold text-xs text-neutral-900">
                Order Confirmed
              </div>

              <div className="text-[11px] text-neutral-500 font-medium">
                Notify when an order has been confirmed.
              </div>
            </div>

            <Toggle setting="order_confirmed" />
          </div>

          {/* ORDER READY */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-bold text-xs text-neutral-900">
                Order Ready
              </div>

              <div className="text-[11px] text-neutral-500 font-medium">
                Notify when an order is ready for the customer.
              </div>
            </div>

            <Toggle setting="order_ready" />
          </div>

          {/* ORDER CANCELLED */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-bold text-xs text-neutral-900">
                Order Cancelled
              </div>

              <div className="text-[11px] text-neutral-500 font-medium">
                Alert staff when an order is cancelled.
              </div>
            </div>

            <Toggle setting="order_cancelled" />
          </div>

          {/* PAYMENT */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-bold text-xs text-neutral-900">
                Payment Received
              </div>

              <div className="text-[11px] text-neutral-500 font-medium">
                Notify when a customer payment is received.
              </div>
            </div>

            <Toggle setting="payment_received" />
          </div>

          {/* NEW USER */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-bold text-xs text-neutral-900">
                New User Registration
              </div>

              <div className="text-[11px] text-neutral-500 font-medium">
                Notify administrators when a new user registers.
              </div>
            </div>

            <Toggle setting="new_user_registration" />
          </div>

          {/* LOW PRODUCT */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-bold text-xs text-neutral-900">
                Low Product Availability
              </div>

              <div className="text-[11px] text-neutral-500 font-medium">
                Alert when products or ingredients have low availability.
              </div>
            </div>

            <Toggle setting="low_product_availability" />
          </div>

          {/* DAILY SUMMARY */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-bold text-xs text-neutral-900">
                Daily Summary Report
              </div>

              <div className="text-[11px] text-neutral-500 font-medium">
                Receive a daily summary of café activity.
              </div>
            </div>

            <Toggle setting="daily_summary_report" />
          </div>

        </div>
      </div>

    </div>
  )
}