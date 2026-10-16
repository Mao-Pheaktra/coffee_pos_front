import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Terminal,
  Grid3X3,
  ClipboardList,
  Bell,
  Settings,
  ChevronDown,
  LogOut,
} from 'lucide-react'

export default function SidebarCashier() {
  const navigate = useNavigate()
  const location = useLocation()

  const currentPath = location.pathname

  // =========================================================
  // ORDER PATH
  // =========================================================

  const isOrdersPath =
    currentPath === '/eorder' ||
    currentPath === '/order' ||
    currentPath.startsWith('/eorder/') ||
    currentPath.startsWith('/order/')

  const [isOrdersOpen, setIsOrdersOpen] = useState(isOrdersPath)

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    navigate('/login', { replace: true })
  }

  // =========================================================
  // NAVIGATION ITEM
  // =========================================================

  const navButtonClass = (active) =>
    `
      group relative
      flex h-14 w-14 flex-col items-center justify-center
      gap-1 rounded-2xl
      transition-all duration-200
      cursor-pointer
      ${
        active
          ? 'bg-[#362922] text-white shadow-sm'
          : 'text-neutral-500 hover:bg-[#2a1e19] hover:text-white'
      }
    `

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <aside
      className="
        sticky top-0 z-50
        flex h-screen w-20 shrink-0
        flex-col
        bg-[#1f1611]
        text-white
        select-none
      "
    >
      {/* =====================================================
          TOP
      ====================================================== */}

      <div className="flex flex-1 flex-col items-center">

        {/* LOGO */}
        <div className="flex h-20 w-full items-center justify-center border-b border-white/5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#362922] shadow-sm">
            <span className="text-sm font-black tracking-tight text-amber-400">
              P
            </span>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="mt-6 flex flex-col items-center gap-2">

          {/* DASHBOARD */}
          <button
            type="button"
            title="Dashboard"
            onClick={() => navigate('/cashier_dashboard')}
            className={navButtonClass(
              currentPath === '/cashier_dashboard'
            )}
          >
            <LayoutDashboard size={19} strokeWidth={1.8} />

            <span className="text-[9px] font-semibold">
              Dashboard
            </span>

            {currentPath === '/cashier_dashboard' && (
              <span className="absolute -left-3 h-7 w-1 rounded-r-full bg-amber-400" />
            )}
          </button>

          {/* PRODUCT */}
          <button
            type="button"
            title="Products"
            onClick={() => navigate('/product')}
            className={navButtonClass(
              currentPath === '/product' ||
                currentPath.startsWith('/product/')
            )}
          >
            <Terminal size={19} strokeWidth={1.8} />

            <span className="text-[9px] font-semibold">
              Product
            </span>

            {(currentPath === '/product' ||
              currentPath.startsWith('/product/')) && (
              <span className="absolute -left-3 h-7 w-1 rounded-r-full bg-amber-400" />
            )}
          </button>

          {/* TABLES */}
          <button
            type="button"
            title="Tables"
            onClick={() => navigate('/table')}
            className={navButtonClass(
              currentPath === '/table' ||
                currentPath.startsWith('/table/')
            )}
          >
            <Grid3X3 size={19} strokeWidth={1.8} />

            <span className="text-[9px] font-semibold">
              Tables
            </span>

            {(currentPath === '/table' ||
              currentPath.startsWith('/table/')) && (
              <span className="absolute -left-3 h-7 w-1 rounded-r-full bg-amber-400" />
            )}
          </button>

          {/* =================================================
              ORDERS
          ================================================== */}

          <div className="relative">

            <button
              type="button"
              title="Orders"
              onClick={() => setIsOrdersOpen((prev) => !prev)}
              className={navButtonClass(isOrdersPath)}
            >
              <div className="relative">
                <ClipboardList size={19} strokeWidth={1.8} />

                <ChevronDown
                  size={9}
                  strokeWidth={2}
                  className={`
                    absolute -right-3 bottom-0
                    transition-transform duration-200
                    ${
                      isOrdersOpen
                        ? 'rotate-180 text-amber-400'
                        : 'text-neutral-500'
                    }
                  `}
                />
              </div>

              <span className="text-[9px] font-semibold">
                Orders
              </span>

              {isOrdersPath && (
                <span className="absolute -left-3 h-7 w-1 rounded-r-full bg-amber-400" />
              )}
            </button>

            {/* ORDER DROPDOWN */}
            {isOrdersOpen && (
              <div
                className="
                  absolute left-full top-0 ml-3
                  w-52
                  overflow-hidden
                  rounded-2xl
                  border border-white/10
                  bg-[#241914]
                  p-2
                  shadow-2xl
                "
              >

                {/* HEADER */}
                <div className="px-3 pb-2 pt-1">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">
                    Order Management
                  </p>
                </div>

                <div className="h-px bg-white/5" />

                {/* E-ORDERS */}
                <button
                  type="button"
                  onClick={() => navigate('/eorder')}
                  className={`
                    mt-2 flex w-full items-center justify-between
                    rounded-xl px-3 py-2.5
                    text-left
                    transition-all
                    cursor-pointer
                    ${
                      currentPath === '/eorder' ||
                      currentPath.startsWith('/eorder/')
                        ? 'bg-[#362922] text-amber-400'
                        : 'text-neutral-300 hover:bg-[#30221c] hover:text-white'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`
                        flex h-7 w-7 items-center justify-center rounded-lg
                        ${
                          currentPath === '/eorder' ||
                          currentPath.startsWith('/eorder/')
                            ? 'bg-amber-400/10 text-amber-400'
                            : 'bg-white/5 text-neutral-400'
                        }
                      `}
                    >
                      <ClipboardList size={14} />
                    </div>

                    <div>
                      <p className="text-xs font-semibold">
                        E-Orders
                      </p>

                      <p className="text-[9px] text-neutral-500">
                        Online orders
                      </p>
                    </div>
                  </div>

                  {/* NOTIFICATION */}
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[8px] font-bold text-white">
                    3
                  </span>
                </button>

                {/* WALK-IN */}
                <button
                  type="button"
                  onClick={() => navigate('/order')}
                  className={`
                    mt-1 flex w-full items-center
                    rounded-xl px-3 py-2.5
                    text-left
                    transition-all
                    cursor-pointer
                    ${
                      currentPath === '/order' ||
                      currentPath.startsWith('/order/')
                        ? 'bg-[#362922] text-amber-400'
                        : 'text-neutral-300 hover:bg-[#30221c] hover:text-white'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`
                        flex h-7 w-7 items-center justify-center rounded-lg
                        ${
                          currentPath === '/order' ||
                          currentPath.startsWith('/order/')
                            ? 'bg-amber-400/10 text-amber-400'
                            : 'bg-white/5 text-neutral-400'
                        }
                      `}
                    >
                      <Terminal size={14} />
                    </div>

                    <div>
                      <p className="text-xs font-semibold">
                        Walk-In Orders
                      </p>

                      <p className="text-[9px] text-neutral-500">
                        Counter orders
                      </p>
                    </div>
                  </div>
                </button>

              </div>
            )}
          </div>

          {/* =================================================
              ORDER HISTORY / ALERTS
          ================================================== */}

          <button
            type="button"
            title="Order History"
            onClick={() => navigate('/order_history')}
            className={navButtonClass(
              currentPath === '/order_history' ||
                currentPath.startsWith('/order_history/')
            )}
          >
            <div className="relative">
              <Bell size={19} strokeWidth={1.8} />

              {/* NOTIFICATION DOT */}
              <span
                className="
                  absolute -right-1 -top-1
                  h-2 w-2
                  rounded-full
                  bg-red-500
                  ring-2 ring-[#1f1611]
                "
              />
            </div>

            <span className="text-[9px] font-semibold">
              Alerts
            </span>

            {(currentPath === '/order_history' ||
              currentPath.startsWith('/order_history/')) && (
              <span className="absolute -left-3 h-7 w-1 rounded-r-full bg-amber-400" />
            )}
          </button>

        </nav>
      </div>

      {/* =====================================================
          BOTTOM
      ====================================================== */}

      <div className="flex flex-col items-center gap-2 border-t border-white/5 px-3 py-5">

        {/* SETTINGS */}
       

        {/* LOGOUT */}
        <button
          type="button"
          title="Logout"
          onClick={handleLogout}
          className="
            group
            flex h-12 w-12
            items-center justify-center
            rounded-2xl
            text-neutral-500
            transition-all
            hover:bg-red-500/10
            hover:text-red-400
            active:scale-95
            cursor-pointer
          "
        >
          <LogOut
            size={19}
            strokeWidth={1.8}
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </button>

      </div>
    </aside>
  )
}