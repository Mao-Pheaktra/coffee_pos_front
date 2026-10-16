import React from 'react'
import SettingsNavbar from '../components/common/SettingsNavbar'


export default function SettingsLayout({ children }) {
  return (
    <div className="min-h-full bg-white">
      <SettingsNavbar />

      <main className="px-8 py-8">
        {children}
      </main>
    </div>
  )
}