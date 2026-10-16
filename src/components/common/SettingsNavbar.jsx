import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

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
    id: 'payments',
    label: 'Payment',
    path: '/setting/payments',
  },
  {
    id: 'ordered',
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

export default function SettingsNavbar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="border-[#DBDBCF] bg-[#FDFCF0]">

      {/* Header */}
      <div className="px-8 pt-7">

        <h1 className="text-2xl font-bold text-stone-900">
          Settings
        </h1>

        <p className="mt-1 text-sm text-stone-500">
          Manage your system settings.
        </p>

      </div>

      {/* Tabs */}
      <div className="px-8 mt-6">

        <div className="flex items-center gap-8 overflow-x-auto">

          {settingsNav.map((item) => {

            const isActive =
              location.pathname === item.path

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.path)}
                className={`
                  relative
                  shrink-0
                  pb-3
                  text-sm
                  font-medium
                  transition-colors
                  ${
                    isActive
                      ? 'text-stone-900'
                      : 'text-stone-500 hover:text-stone-900'
                  }
                `}
              >

                {item.label}

                {isActive && (
                  <span
                    className="
                      absolute
                      bottom-0
                      left-0
                      right-0
                      h-[2px]
                      rounded-full
                      bg-stone-900
                    "
                  />
                )}

              </button>
            )
          })}

        </div>

      </div>

    </div>
  )
}