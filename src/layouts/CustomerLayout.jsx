import React from 'react'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import { Outlet } from 'react-router-dom'

const CustomerLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar/>
        <main className='flex-1'>
          <Outlet/>
        </main>
      <Footer/>
    </div>
  )
}

export default CustomerLayout