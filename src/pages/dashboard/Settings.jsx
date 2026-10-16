import React from 'react'
import { Outlet } from 'react-router-dom'
import SettingsNavbar from '../../components/common/SettingsNavbar'


export default function Settings() {
  return (
    <div className="min-h-full border-[#DBDBCF] bg-[#FDFCF0]">
      <SettingsNavbar />

      <main className="px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}