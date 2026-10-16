import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { BookOpen, ClipboardList, Clock, ShoppingBag } from 'lucide-react'

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  // Determine active tab based on current path
  const getActiveTab = () => {
    const path = location.pathname
    if (path.includes('/mobile_menu') || path === '/') return 'menu'
    if (path.includes('/current')) return 'current'
    if (path.includes('/history')) return 'history'
    if (path.includes('/total')) return 'total'
    return 'menu'
  }

  const activeTab = getActiveTab()

  return (
    <div className="absolute bottom-3 left-4 right-4 bg-[var(--color-neutral)]/95 backdrop-blur-md border border-[var(--color-border)] rounded-[var(--radius-pill)] px-4 py-2 flex items-center justify-between shadow-lg z-25">
      
      {/* Menu Tab */}
      <button
        type="button"
        onClick={() => navigate('/mobile_menu')}
        className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-[var(--radius-pill)] transition-all cursor-pointer ${
          activeTab === 'menu' 
            ? 'bg-[var(--color-secondary-light)] text-[var(--color-primary)] font-bold' 
            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
        }`}
      >
        <BookOpen size={18} />
        <span className="text-[10px]">Menu</span>
      </button>

      {/* My Orders Tab */}
      <button
        type="button"
        onClick={() => navigate('/current')}
        className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-[var(--radius-pill)] transition-all cursor-pointer ${
          activeTab === 'current' 
            ? 'bg-[var(--color-secondary-light)] text-[var(--color-primary)] font-bold' 
            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
        }`}
      >
        <ClipboardList size={18} />
        <span className="text-[10px]">My Orders</span>
      </button>

      {/* History Tab */}
      <button
        type="button"
        onClick={() => navigate('/history')}
        className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-[var(--radius-pill)] transition-all cursor-pointer ${
          activeTab === 'history' 
            ? 'bg-[var(--color-secondary-light)] text-[var(--color-primary)] font-bold' 
            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
        }`}
      >
        <Clock size={18} />
        <span className="text-[10px]">History</span>
      </button>

      {/* Total / Cart Tab */}
      <button
        type="button"
        onClick={() => navigate('/total')}
        className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-[var(--radius-pill)] transition-all cursor-pointer ${
          activeTab === 'total' 
            ? 'bg-[var(--color-secondary-light)] text-[var(--color-primary)] font-bold' 
            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
        }`}
      >
        <ShoppingBag size={18} />
        <span className="text-[10px]">Total</span>
      </button>

    </div>
  )
}