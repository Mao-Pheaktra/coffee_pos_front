import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Package,
  Grid,
  Armchair,
  ShoppingBag,
  CreditCard,
  BarChart2,
  Settings,
  User,
  LogOut,
  Coffee,
  CalendarDays
} from 'lucide-react'

export default function SidebarAdmin() {
  const navigate = useNavigate()
  const location = useLocation()
  const currentPath = location.pathname

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard
    },
    {
      id: 'users',
      label: 'Users',
      path: '/user_dashboard',
      icon: Users
    },
    {
      id: 'products',
      label: 'Products',
      path: '/product_dashboard',
      icon: Package
    },
    {
      id: 'categories',
      label: 'Categories',
      path: '/category_dashboard',
      icon: Grid
    },
    {
      id: 'tables',
      label: 'Tables',
      path: '/table_dashboard',
      icon: Armchair
    },
    {
      id: 'orders',
      label: 'Orders',
      path: '/order_dashboard',
      icon: ShoppingBag
    },
    {
      id: 'payments',
      label: 'Payments',
      path: '/payment_dashboard',
      icon: CreditCard
    },
    {
      id: 'reports',
      label: 'Reports',
      path: '/report_dashboard',
      icon: BarChart2
    },
    {
      id: 'events',
      label: 'Events',
      path: '/events',
      icon: CalendarDays
    }
  ]

  const isSettingsActive = currentPath.startsWith('/setting')

  return (
    <aside className="w-64 bg-[var(--color-neutral)] border-r border-[var(--color-border)] flex flex-col justify-between shrink-0 select-none">

      {/* =====================================================
          TOP
      ====================================================== */}
      <div>

        {/* Branding */}
        <div className="py-2 flex items-center gap-3.5 border-b border-[var(--color-border)]">

          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#2d1e17] to-[#120d0a] text-amber-500 shadow-md ring-1 ring-white/10 shrink-0">

            <Coffee className="w-5 h-5 stroke-[2.2]" />

            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
            </span>

          </div>

          <div className="flex flex-col">

            <div className="flex items-center gap-1.5">

              <h5 className="font-[family-name:var(--font-heading)] font-bold text-sm tracking-tight text-[var(--color-text)]">
                BrewAdmin
              </h5>

              <span className="px-1.5 py-0.5 text-[9px] font-semibold tracking-wider text-amber-700 bg-amber-100 rounded-md dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/30">
                PRO
              </span>

            </div>

            <p className="text-[11px] text-[var(--color-text-secondary)] font-medium leading-tight">
              Regional Manager
            </p>

          </div>

        </div>


        {/* =====================================================
            MAIN NAVIGATION
        ====================================================== */}

        <nav className="p-4 space-y-1">

          {navItems.map((item) => {

            const Icon = item.icon

            const isActive =
              currentPath === item.path

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-[var(--radius-lg)] text-xs font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#1f1611] text-white shadow-xs'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]'
                }`}
              >

                <Icon size={16} />

                <span>
                  {item.label}
                </span>

              </button>
            )
          })}


          {/* =================================================
              SETTINGS
          ================================================== */}

          <div className="pt-0">

            <button
              type="button"
              onClick={() => navigate('/setting/general')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-[var(--radius-lg)] text-xs font-semibold transition-colors cursor-pointer ${
                isSettingsActive
                  ? 'bg-[#1f1611] text-white shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]'
              }`}
            >

              <Settings size={16} />

              <span>
                Settings
              </span>

            </button>

          </div>

        </nav>

      </div>


      {/* =====================================================
          BOTTOM
      ====================================================== */}

      <div className="p-4 border-t border-[var(--color-border)] space-y-1">

        {/* Profile */}
        <button
          type="button"
          onClick={() => navigate('/admin_profile')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-[var(--radius-lg)] text-xs font-semibold transition-colors cursor-pointer ${
            currentPath === '/admin_profile'
              ? 'bg-[#1f1611] text-white shadow-xs'
              : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]'
          }`}
        >

          <User size={16} />

          <span>
            Profile
          </span>

        </button>


        {/* Logout */}
        <button
          type="button"
          onClick={() => alert('Logged out')}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-[var(--radius-lg)] text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        >

          <LogOut size={16} />

          <span>
            Logout
          </span>

        </button>

      </div>

    </aside>
  )
}