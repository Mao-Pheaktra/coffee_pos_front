import React from 'react'
import NavbarAdmin from '../components/common/NavbarAdmin'
import SidebarAdmin from '../components/common/SidebarAdmin'
import { Outlet } from 'react-router-dom'

const DashboardLayout = () => {
  return (
    /* 1. Limit layout height to viewport and prevent page-level scroll */
    <div className="h-screen bg-(--color-background) flex overflow-hidden">
      {/* 2. Sidebar stays fixed on the left */}
      <SidebarAdmin />

      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* 3. Navbar stays fixed at the top of the content area */}
        <NavbarAdmin />

        {/* 4. Only the main content area scrolls when content exceeds height */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout