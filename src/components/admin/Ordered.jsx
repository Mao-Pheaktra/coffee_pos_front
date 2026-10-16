import React, { useEffect, useState } from 'react'
import { getOrderSettings, updateOrderSettings } from '../../services/orderSettingService'

export default function Ordered() {
  const [sources, setSources] = useState({
    walkIn: true,
    qrOrder: true,
  })

  const [types, setTypes] = useState({
    dineIn: true,
    takeaway: true,
    delivery: false,
  })

  const [processing, setProcessing] = useState({
    autoConfirm: false,
    allowCancellation: true,
    allowNotes: true,
  })

  const [defaults, setDefaults] = useState({
    orderType: 'Dine In',
    orderSource: 'Walk-in',
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

      const response = await getOrderSettings()
      const data = response.data

      setSources({
        walkIn: Boolean(data.walk_in_orders),
        qrOrder: Boolean(data.e_orders),
      })

      setTypes({
        dineIn: Boolean(data.dine_in),
        takeaway: Boolean(data.takeaway),
        delivery: Boolean(data.delivery),
      })

      setProcessing({
        autoConfirm: Boolean(data.auto_confirm_orders),
        allowCancellation: Boolean(data.allow_order_cancellation),
        allowNotes: Boolean(data.allow_order_notes),
      })

      setDefaults({
        orderType: convertOrderTypeFromApi(data.default_order_type),
        orderSource: convertOrderSourceFromApi(data.default_order_source),
      })
    } catch (err) {
      console.error('Failed to fetch order settings:', err)

      setError(
        err.response?.data?.message ||
        'Failed to load order settings.'
      )
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // CONVERT API → UI
  // =========================

  const convertOrderTypeFromApi = (value) => {
    switch (value) {
      case 'DINE_IN':
        return 'Dine In'
      case 'TAKEAWAY':
        return 'Takeaway'
      case 'DELIVERY':
        return 'Delivery'
      default:
        return 'Dine In'
    }
  }

  const convertOrderSourceFromApi = (value) => {
    switch (value) {
      case 'WALK_IN':
        return 'Walk-in'
      case 'E_ORDER':
        return 'QR / E-Order'
      default:
        return 'Walk-in'
    }
  }

  // =========================
  // TOGGLES
  // =========================

  const toggleSource = (key) => {
    setSources(prev => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const toggleType = (key) => {
    setTypes(prev => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const toggleProcessing = (key) => {
    setProcessing(prev => ({
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
        walk_in_orders: sources.walkIn,
        e_orders: sources.qrOrder,

        dine_in: types.dineIn,
        takeaway: types.takeaway,
        delivery: types.delivery,

        auto_confirm_orders: processing.autoConfirm,
        allow_order_cancellation: processing.allowCancellation,
        allow_order_notes: processing.allowNotes,

        default_order_type: convertOrderTypeToApi(
          defaults.orderType
        ),

        default_order_source: convertOrderSourceToApi(
          defaults.orderSource
        ),
      }

      const response = await updateOrderSettings(payload)

      // Update UI from saved response
      const data = response.data

      setSources({
        walkIn: Boolean(data.walk_in_orders),
        qrOrder: Boolean(data.e_orders),
      })

      setTypes({
        dineIn: Boolean(data.dine_in),
        takeaway: Boolean(data.takeaway),
        delivery: Boolean(data.delivery),
      })

      setProcessing({
        autoConfirm: Boolean(data.auto_confirm_orders),
        allowCancellation: Boolean(data.allow_order_cancellation),
        allowNotes: Boolean(data.allow_order_notes),
      })

      setDefaults({
        orderType: convertOrderTypeFromApi(data.default_order_type),
        orderSource: convertOrderSourceFromApi(data.default_order_source),
      })

      setSuccess('Order settings saved successfully.')

      setTimeout(() => {
        setSuccess('')
      }, 3000)
    } catch (err) {
      console.error('Failed to save order settings:', err)

      setError(
        err.response?.data?.message ||
        'Failed to save order settings.'
      )
    } finally {
      setSaving(false)
    }
  }

  // =========================
  // CONVERT UI → API
  // =========================

  const convertOrderTypeToApi = (value) => {
    switch (value) {
      case 'Dine In':
        return 'DINE_IN'
      case 'Takeaway':
        return 'TAKEAWAY'
      case 'Delivery':
        return 'DELIVERY'
      default:
        return 'DINE_IN'
    }
  }

  const convertOrderSourceToApi = (value) => {
    switch (value) {
      case 'Walk-in':
        return 'WALK_IN'
      case 'QR / E-Order':
        return 'E_ORDER'
      default:
        return 'WALK_IN'
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
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="text-sm font-semibold text-neutral-500">
          Loading order settings...
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
            Order Settings
          </h2>

          <p className="text-xs text-neutral-500 font-medium">
            Configure how orders are received and processed.
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

      {/* ================= MESSAGES ================= */}

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

      {/* ================= ORDER SOURCES ================= */}

      <div className="bg-white border border-neutral-200 rounded-[24px] p-6 space-y-4 shadow-2xs">

        <h3 className="font-bold text-sm text-neutral-900">
          Order Sources
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* WALK IN */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5 flex flex-col justify-between space-y-4">

            <div className="flex items-start justify-between">

              <div>
                <div className="font-bold text-xs text-neutral-900">
                  Walk-in Orders
                </div>

                <p className="text-[11px] text-neutral-500 font-medium mt-0.5">
                  Allow staff to input orders directly into the POS system for walk-in customers.
                </p>
              </div>

              <button
                type="button"
                onClick={() => toggleSource('walkIn')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ml-4 ${
                  sources.walkIn
                    ? 'bg-[#1f1611]'
                    : 'bg-neutral-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    sources.walkIn
                      ? 'translate-x-5'
                      : 'translate-x-0'
                  }`}
                />
              </button>

            </div>
          </div>

          {/* QR */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5 flex flex-col justify-between space-y-4">

            <div className="flex items-start justify-between">

              <div>
                <div className="font-bold text-xs text-neutral-900">
                  QR / E-Orders
                </div>

                <p className="text-[11px] text-neutral-500 font-medium mt-0.5">
                  Accept orders placed by customers scanning table QR codes or via the online menu.
                </p>
              </div>

              <button
                type="button"
                onClick={() => toggleSource('qrOrder')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ml-4 ${
                  sources.qrOrder
                    ? 'bg-[#1f1611]'
                    : 'bg-neutral-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    sources.qrOrder
                      ? 'translate-x-5'
                      : 'translate-x-0'
                  }`}
                />
              </button>

            </div>
          </div>

        </div>
      </div>

      {/* ================= ORDER TYPES ================= */}

      <div className="bg-white border border-neutral-200 rounded-[24px] p-6 space-y-4 shadow-2xs">

        <h3 className="font-bold text-sm text-neutral-900">
          Order Types
        </h3>

        <div className="divide-y divide-neutral-100 space-y-4">

          {[
            {
              key: 'dineIn',
              title: 'Dine In',
              description: 'Orders served at tables within the café.',
            },
            {
              key: 'takeaway',
              title: 'Takeaway',
              description: 'Orders packaged for customers to take out.',
            },
            {
              key: 'delivery',
              title: 'Delivery',
              description: 'Orders delivered via third-party integrations.',
            },
          ].map(item => (
            <div
              key={item.key}
              className="flex items-center justify-between pt-4"
            >
              <div>
                <div className="font-bold text-xs text-neutral-900">
                  {item.title}
                </div>

                <div className="text-[11px] text-neutral-500 font-medium">
                  {item.description}
                </div>
              </div>

              <button
                type="button"
                onClick={() => toggleType(item.key)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  types[item.key]
                    ? 'bg-[#1f1611]'
                    : 'bg-neutral-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    types[item.key]
                      ? 'translate-x-5'
                      : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}

        </div>
      </div>

      {/* ================= PROCESSING ================= */}

      <div className="bg-white border border-neutral-200 rounded-[24px] p-6 space-y-4 shadow-2xs">

        <h3 className="font-bold text-sm text-neutral-900">
          Order Processing
        </h3>

        <div className="divide-y divide-neutral-100 space-y-4">

          {[
            {
              key: 'autoConfirm',
              title: 'Auto Confirm Orders',
              description:
                'Automatically accept incoming QR/E-Orders without manual approval.',
            },
            {
              key: 'allowCancellation',
              title: 'Allow Order Cancellation',
              description:
                'Permit customers to cancel unconfirmed E-Orders.',
            },
            {
              key: 'allowNotes',
              title: 'Allow Order Notes',
              description:
                'Enable customers to add custom requests to specific items.',
            },
          ].map(item => (
            <div
              key={item.key}
              className="flex items-center justify-between pt-4"
            >
              <div>
                <div className="font-bold text-xs text-neutral-900">
                  {item.title}
                </div>

                <div className="text-[11px] text-neutral-500 font-medium">
                  {item.description}
                </div>
              </div>

              <button
                type="button"
                onClick={() => toggleProcessing(item.key)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  processing[item.key]
                    ? 'bg-[#1f1611]'
                    : 'bg-neutral-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    processing[item.key]
                      ? 'translate-x-5'
                      : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}

        </div>
      </div>

      {/* ================= DEFAULT SETTINGS ================= */}

      <div className="bg-white border border-neutral-200 rounded-[24px] p-6 space-y-4 shadow-2xs">

        <h3 className="font-bold text-sm text-neutral-900">
          Default Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* ORDER TYPE */}
          <div className="space-y-1.5">

            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              Default Order Type
            </label>

            <select
              aria-label="Default Order Type"
              value={defaults.orderType}
              onChange={(e) =>
                setDefaults(prev => ({
                  ...prev,
                  orderType: e.target.value,
                }))
              }
              className="w-full px-3.5 py-2 bg-white border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-900 focus:outline-hidden cursor-pointer shadow-2xs"
            >
              <option>Dine In</option>
              <option>Takeaway</option>
              <option>Delivery</option>
            </select>

          </div>

          {/* ORDER SOURCE */}
          <div className="space-y-1.5">

            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              Default Order Source
            </label>

            <select
              aria-label="Default Order Source"
              value={defaults.orderSource}
              onChange={(e) =>
                setDefaults(prev => ({
                  ...prev,
                  orderSource: e.target.value,
                }))
              }
              className="w-full px-3.5 py-2 bg-white border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-900 focus:outline-hidden cursor-pointer shadow-2xs"
            >
              <option>Walk-in</option>
              <option>QR / E-Order</option>
            </select>

          </div>

        </div>
      </div>

    </div>
  )
}