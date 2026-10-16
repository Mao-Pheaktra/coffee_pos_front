import React from 'react'
import { Outlet } from 'react-router-dom'

const AuthLayout = () => {
  return (
    <main className="min-h-screen bg-(--color-background)">
        <Outlet/>
    </main>
  )
}

export default AuthLayout