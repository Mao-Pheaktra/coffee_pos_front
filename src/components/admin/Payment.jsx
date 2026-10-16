import React, { useEffect, useState } from 'react'
import {
  Banknote,
  QrCode,
  CreditCard,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'

import {
  getPaymentSettings,
  updatePaymentSettings,
} from '../../services/paymentSettingService'

export default function Payment() {
  const [methods, setMethods] = useState({
    cash: true,
    qr: true,
    card: true,
  })

  const [behavior, setBehavior] = useState({
    partialPayment: false,
    requirePayment: true,
    autoMarkPaid: false,
  })

  const [defaultMethod, setDefaultMethod] =
    useState('CASH')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // =====================================================
  // FETCH PAYMENT SETTINGS
  // =====================================================

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await getPaymentSettings()

      const settings = response.data

      setMethods({
        cash: Boolean(settings.cash),
        qr: Boolean(settings.qr_payment),
        card: Boolean(settings.card),
      })

      setBehavior({
        partialPayment: Boolean(
          settings.allow_partial_payment
        ),
        requirePayment: Boolean(
          settings.require_payment_before_completion
        ),
        autoMarkPaid: Boolean(
          settings.auto_mark_paid
        ),
      })

      setDefaultMethod(
        settings.default_payment_method || 'CASH'
      )
    } catch (err) {
      console.error(
        'Failed to fetch payment settings:',
        err
      )

      setError(
        err.response?.data?.message ||
          'Failed to load payment settings.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  // =====================================================
  // TOGGLE PAYMENT METHOD
  // =====================================================

  const toggleMethod = (key) => {
    setMethods((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  // =====================================================
  // TOGGLE BEHAVIOR
  // =====================================================

  const toggleBehavior = (key) => {
    setBehavior((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  // =====================================================
  // SAVE
  // =====================================================

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const payload = {
        cash: methods.cash,
        qr_payment: methods.qr,
        card: methods.card,

        default_payment_method: defaultMethod,

        allow_partial_payment:
          behavior.partialPayment,

        require_payment_before_completion:
          behavior.requirePayment,

        auto_mark_paid:
          behavior.autoMarkPaid,
      }

      const response =
        await updatePaymentSettings(payload)

      // Update UI with returned backend data
      const settings = response.data

      setMethods({
        cash: Boolean(settings.cash),
        qr: Boolean(settings.qr_payment),
        card: Boolean(settings.card),
      })

      setBehavior({
        partialPayment: Boolean(
          settings.allow_partial_payment
        ),
        requirePayment: Boolean(
          settings.require_payment_before_completion
        ),
        autoMarkPaid: Boolean(
          settings.auto_mark_paid
        ),
      })

      setDefaultMethod(
        settings.default_payment_method
      )

      setSuccess(
        response.message ||
          'Payment settings updated successfully.'
      )
    } catch (err) {
      console.error(
        'Failed to update payment settings:',
        err
      )

      if (err.response?.status === 422) {
        const errors = err.response?.data?.errors

        if (errors) {
          const firstError =
            Object.values(errors)[0]?.[0]

          setError(
            firstError || 'Validation failed.'
          )
        } else {
          setError('Validation failed.')
        }
      } else {
        setError(
          err.response?.data?.message ||
            'Failed to update payment settings.'
        )
      }
    } finally {
      setSaving(false)
    }
  }

  // =====================================================
  // CANCEL
  // =====================================================

  const handleCancel = () => {
    setSuccess('')
    setError('')

    fetchSettings()
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-1 items-center justify-center">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-500">
          <Loader2
            size={20}
            className="animate-spin"
          />
          Loading payment settings...
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div>
        <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-neutral-900">
          Payment Settings
        </h2>

        <p className="text-xs font-medium text-neutral-500">
          Configure how your café accepts payments,
          manages default methods, and handles
          transaction workflows.
        </p>
      </div>

      {/* =====================================================
          SUCCESS / ERROR
      ====================================================== */}

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-xs font-semibold text-green-700">
          <CheckCircle size={17} />
          {success}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
          <AlertCircle size={17} />
          {error}
        </div>
      )}

      {/* =====================================================
          AVAILABLE PAYMENT METHODS
      ====================================================== */}

      <div className="space-y-3">

        <h3 className="text-sm font-bold text-neutral-900">
          Available Payment Methods
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          {/* CASH */}

          <div className="flex flex-col justify-between space-y-4 rounded-[20px] border border-neutral-200 bg-white p-5 shadow-2xs">

            <div className="flex items-start justify-between">

              <span className="rounded-xl border border-neutral-200 bg-neutral-100 p-2 text-neutral-700">
                <Banknote size={18} />
              </span>

              <button
                type="button"
                onClick={() =>
                  toggleMethod('cash')
                }
                className={`flex h-6 w-11 cursor-pointer items-center rounded-full p-1 transition-colors ${
                  methods.cash
                    ? 'bg-emerald-600'
                    : 'bg-neutral-300'
                }`}
              >
                <div
                  className={`h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                    methods.cash
                      ? 'translate-x-5'
                      : 'translate-x-0'
                  }`}
                />
              </button>

            </div>

            <div>

              <div className="text-xs font-bold text-neutral-900">
                Cash
              </div>

              <p className="mt-0.5 text-[11px] font-medium text-neutral-500">
                Accept physical currency. Requires
                till management and manual
                reconciliation.
              </p>

            </div>
          </div>

          {/* QR */}

          <div className="flex flex-col justify-between space-y-4 rounded-[20px] border border-neutral-200 bg-white p-5 shadow-2xs">

            <div className="flex items-start justify-between">

              <span className="rounded-xl border border-neutral-200 bg-neutral-100 p-2 text-neutral-700">
                <QrCode size={18} />
              </span>

              <button
                type="button"
                onClick={() =>
                  toggleMethod('qr')
                }
                className={`flex h-6 w-11 cursor-pointer items-center rounded-full p-1 transition-colors ${
                  methods.qr
                    ? 'bg-emerald-600'
                    : 'bg-neutral-300'
                }`}
              >
                <div
                  className={`h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                    methods.qr
                      ? 'translate-x-5'
                      : 'translate-x-0'
                  }`}
                />
              </button>

            </div>

            <div>

              <div className="text-xs font-bold text-neutral-900">
                QR Payment
              </div>

              <p className="mt-0.5 text-[11px] font-medium text-neutral-500">
                Mobile wallets and bank transfers
                via dynamic QR codes shown on
                the POS.
              </p>

            </div>
          </div>

          {/* CARD */}

          <div className="flex flex-col justify-between space-y-4 rounded-[20px] border border-neutral-200 bg-white p-5 shadow-2xs">

            <div className="flex items-start justify-between">

              <span className="rounded-xl border border-neutral-200 bg-neutral-100 p-2 text-neutral-700">
                <CreditCard size={18} />
              </span>

              <button
                type="button"
                onClick={() =>
                  toggleMethod('card')
                }
                className={`flex h-6 w-11 cursor-pointer items-center rounded-full p-1 transition-colors ${
                  methods.card
                    ? 'bg-emerald-600'
                    : 'bg-neutral-300'
                }`}
              >
                <div
                  className={`h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                    methods.card
                      ? 'translate-x-5'
                      : 'translate-x-0'
                  }`}
                />
              </button>

            </div>

            <div>

              <div className="text-xs font-bold text-neutral-900">
                Card
              </div>

              <p className="mt-0.5 text-[11px] font-medium text-neutral-500">
                Credit and debit cards via
                integrated payment terminal
                (NFC and Chip).
              </p>

            </div>
          </div>

        </div>
      </div>

      {/* =====================================================
          DEFAULT CONFIGURATION
      ====================================================== */}

      <div className="space-y-4 rounded-[24px] border border-neutral-200 bg-white p-6 shadow-2xs">

        <h3 className="text-sm font-bold text-neutral-900">
          Default Configuration
        </h3>

        <div className="max-w-lg space-y-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">

          <div>

            <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Default Payment Method
            </span>

            <p className="text-[11px] font-medium text-neutral-500">
              This method is pre-selected on the
              checkout screen to speed up
              transactions.
            </p>

          </div>

          <select
            aria-label="Default Payment Method"
            value={defaultMethod}
            onChange={(e) =>
              setDefaultMethod(e.target.value)
            }
            className="w-full cursor-pointer rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-900 shadow-2xs focus:outline-hidden"
          >

            <option value="CASH">
              Cash
            </option>

            <option value="QR_PAYMENT">
              QR Payment
            </option>

            <option value="CARD">
              Card (Integrated Terminal)
            </option>

          </select>

        </div>
      </div>

      {/* =====================================================
          PAYMENT BEHAVIOR
      ====================================================== */}

      <div className="space-y-5 rounded-[24px] border border-neutral-200 bg-white p-6 shadow-2xs">

        <h3 className="text-sm font-bold text-neutral-900">
          Payment Behavior
        </h3>

        <div className="space-y-4 divide-y divide-neutral-100">

          {/* PARTIAL */}

          <div className="flex items-center justify-between pt-4">

            <div>

              <div className="text-xs font-bold text-neutral-900">
                Allow Partial Payment
              </div>

              <div className="text-[11px] font-medium text-neutral-500">
                Enable splitting a single order
                across multiple payment methods
                (e.g., half cash, half card).
              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                toggleBehavior(
                  'partialPayment'
                )
              }
              className={`flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-1 transition-colors ${
                behavior.partialPayment
                  ? 'bg-emerald-600'
                  : 'bg-neutral-300'
              }`}
            >
              <div
                className={`h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                  behavior.partialPayment
                    ? 'translate-x-5'
                    : 'translate-x-0'
                }`}
              />
            </button>

          </div>

          {/* REQUIRE PAYMENT */}

          <div className="flex items-center justify-between pt-4">

            <div>

              <div className="text-xs font-bold text-neutral-900">
                Require Payment Before Completion
              </div>

              <div className="text-[11px] font-medium text-neutral-500">
                Prevent closing an order ticket
                until the full balance has been
                settled.
              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                toggleBehavior(
                  'requirePayment'
                )
              }
              className={`flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-1 transition-colors ${
                behavior.requirePayment
                  ? 'bg-emerald-600'
                  : 'bg-neutral-300'
              }`}
            >
              <div
                className={`h-4 w-4 transform rounded-full bg-white shadow-md shadow-md transition-transform ${
                  behavior.requirePayment
                    ? 'translate-x-5'
                    : 'translate-x-0'
                }`}
              />
            </button>

          </div>

          {/* AUTO MARK */}

          <div className="flex items-center justify-between pt-4">

            <div>

              <div className="text-xs font-bold text-neutral-900">
                Automatically Mark Paid Orders
              </div>

              <div className="text-[11px] font-medium text-neutral-500">
                Move fully paid tickets to the
                'Completed' tab immediately
                without manual confirmation.
              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                toggleBehavior(
                  'autoMarkPaid'
                )
              }
              className={`flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-1 transition-colors ${
                behavior.autoMarkPaid
                  ? 'bg-emerald-600'
                  : 'bg-neutral-300'
              }`}
            >
              <div
                className={`h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                  behavior.autoMarkPaid
                    ? 'translate-x-5'
                    : 'translate-x-0'
                }`}
              />
            </button>

          </div>

        </div>
      </div>

      {/* =====================================================
          ACTION BUTTONS
      ====================================================== */}

      <div className="flex items-center justify-end gap-3 pt-2">

        <button
          type="button"
          onClick={handleCancel}
          disabled={saving}
          className="cursor-pointer rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-xs font-bold text-neutral-700 shadow-2xs transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          CANCEL
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#1f1611] px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
        >

          {saving ? (
            <>
              <Loader2
                size={15}
                className="animate-spin"
              />

              SAVING...
            </>
          ) : (
            'SAVE CHANGES'
          )}

        </button>

      </div>

    </div>
  )
}