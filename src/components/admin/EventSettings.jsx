import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Zap,
  Ticket,
} from 'lucide-react'

import {
  getEventSettings,
  updateEventSettings,
} from '../../services/eventSettingService'

export default function EventSettings() {
  const navigate = useNavigate()
  const location = useLocation()

  const settingsNav = [
    {
      id: 'general',
      label: 'General',
      path: '/setting/general',
    },
    {
      id: 'security',
      label: 'Security',
      path: '/setting/security',
    },
    {
      id: 'payment',
      label: 'Payment',
      path: '/setting/payments',
    },
    {
      id: 'order',
      label: 'Order',
      path: '/setting/ordered',
    },
    {
      id: 'notification',
      label: 'Notifications',
      path: '/setting/notification',
    },
    {
      id: 'events',
      label: 'Events',
      path: '/setting/events',
    },
  ]

  const [settings, setSettings] = useState({
    events_enabled: false,
    coupons_enabled: false,
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)

      const response = await getEventSettings()

      setSettings(
        response?.settings || {
          events_enabled: false,
          coupons_enabled: false,
        }
      )
    } catch (error) {
      console.error('Failed to load event settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (field) => {
    const updatedSettings = {
      ...settings,
      [field]: !settings[field],
    }

    try {
      setSaving(true)

      const response = await updateEventSettings(updatedSettings)

      setSettings(response.settings)
    } catch (error) {
      console.error('Failed to update event settings:', error)

      await loadSettings()
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-sm text-stone-500">
        Loading event settings...
      </div>
    )
  }

  return (
    <div className="min-h-full bg-stone-50">

      {/* =====================================================
          SETTINGS NAVBAR
      ====================================================== */}
      <div className="border-b border-stone-200 bg-white">

        {/* Header */}
        <div className="px-6 pt-5">

          <h1 className="text-xl font-bold text-stone-900">
            Settings
          </h1>

          <p className="mt-1 text-sm text-stone-500">
            Manage your system settings.
          </p>

        </div>

        {/* Navigation */}
        <div className="mt-4 px-6">

          <div className="flex gap-7 overflow-x-auto">

            {settingsNav.map((item) => {

              const isActive =
                location.pathname === item.path

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`relative shrink-0 pb-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-stone-900'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  {item.label}

                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-stone-900" />
                  )}
                </button>
              )
            })}

          </div>

        </div>

      </div>

      {/* =====================================================
          EVENT SETTINGS CONTENT
      ====================================================== */}
      <div className="p-6">

        <div className="rounded-2xl border border-stone-200 bg-white p-5">

          <div className="mb-5">

            <h2 className="text-base font-bold text-stone-900">
              Event & Coupon Settings
            </h2>

            <p className="mt-1 text-xs text-stone-500">
              Control promotional events and coupons without changing the code.
            </p>

          </div>

          {/* Events */}
          <div className="flex items-center justify-between border-b border-stone-100 py-4">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Zap size={18} />
              </div>

              <div>

                <p className="text-sm font-semibold text-stone-900">
                  Promotional Events
                </p>

                <p className="text-xs text-stone-500">
                  Allow promotional events to be created and displayed.
                </p>

              </div>

            </div>

            <button
              type="button"
              disabled={saving}
              onClick={() => handleToggle('events_enabled')}
              className={`relative h-6 w-11 rounded-full transition ${
                settings.events_enabled
                  ? 'bg-emerald-600'
                  : 'bg-stone-300'
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                  settings.events_enabled
                    ? 'left-6'
                    : 'left-1'
                }`}
              />
            </button>

          </div>

          {/* Coupons */}
          <div className="flex items-center justify-between py-4">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Ticket size={18} />
              </div>

              <div>

                <p className="text-sm font-semibold text-stone-900">
                  Coupons
                </p>

                <p className="text-xs text-stone-500">
                  Allow promotional coupons to be created.
                </p>

              </div>

            </div>

            <button
              type="button"
              disabled={saving}
              onClick={() => handleToggle('coupons_enabled')}
              className={`relative h-6 w-11 rounded-full transition ${
                settings.coupons_enabled
                  ? 'bg-emerald-600'
                  : 'bg-stone-300'
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                  settings.coupons_enabled
                    ? 'left-6'
                    : 'left-1'
                }`}
              />
            </button>

          </div>

        </div>

      </div>

    </div>
  )
}