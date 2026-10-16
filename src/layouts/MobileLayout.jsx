import React from 'react'
import { Outlet } from 'react-router-dom'
import BottomNav from '../components/common/BottomNav'

const MobileLayout = () => {
  return (
    <div className="min-h-screen bg-(--color-background) flex items-center justify-center p-0 md:p-6">

      {/* Phone Screen */}
      <div
        className="
          w-full
          max-w-[400px]
          h-screen
          md:h-[840px]
          md:rounded-[40px]
          bg-(--color-background)
          md:border-8
          md:border-(--color-border)
          shadow-xl
          overflow-hidden
          relative
          flex
          flex-col
        "
      >

        {/* =====================================================
            SCROLLABLE PAGE CONTENT
        ===================================================== */}
        <main
          className="
            flex-1
            min-h-0
            overflow-y-auto
            pb-24
            [scrollbar-width:none]
            [-ms-overflow-style:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
          <Outlet />
        </main>

        {/* =====================================================
            FIXED BOTTOM NAVBAR
        ===================================================== */}
        <div
          className="
            absolute
            bottom-0
            left-0
            right-0
            z-50
          "
        >
          <BottomNav />
        </div>

      </div>

    </div>
  )
}

export default MobileLayout