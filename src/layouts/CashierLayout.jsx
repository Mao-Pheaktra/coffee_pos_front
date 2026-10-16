import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import NavbarCashier from '../components/common/NavbarCashier'
import SidebarCashier from '../components/common/SidebarCashier'

const CashierLayout = () => {
  const navigate = useNavigate()

  // =========================================================
  // START NEW ORDER
  // =========================================================
  const handleOpenNewOrder = (orderData) => {
    console.log('New order from Navbar:', orderData)

    navigate('/product', {
      state: orderData,
    })
  }


  const handleGoToTables = () => {
    navigate('/table')
  }

  return (
    <div className="h-screen overflow-hidden bg-(--color-background) flex">
      

      <div className="h-screen shrink-0">
        <SidebarCashier />
      </div>
      <div className="flex min-w-0 flex-1 flex-col h-screen overflow-hidden">
   
        <div className="shrink-0">
          <NavbarCashier
            onOpenNewOrder={handleOpenNewOrder}
            onGoToTables={handleGoToTables}
          />
        </div>

        
        <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>

      </div>
    </div>
  )
}

export default CashierLayout