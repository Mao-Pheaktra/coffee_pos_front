import React from 'react'
import DashboardMetrics from '../../components/cashier/DashboardMetrics'
import TableOverview from '../../components/cashier/TableOverview'
import RecentOrders from '../../components/cashier/RecentOrders'
import SystemStatus from '../../components/cashier/SystemStatus'

export default function CashierDashboard() {
  return (
    <div className="space-y-6">
      <DashboardMetrics />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TableOverview />
        <RecentOrders />
        <SystemStatus />
      </div>
    </div>
  )
}