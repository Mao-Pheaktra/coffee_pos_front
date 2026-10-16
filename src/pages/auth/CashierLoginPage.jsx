import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Coffee, Delete, Check, ArrowRight } from 'lucide-react'

export default function CashierLoginPage() {
  const navigate = useNavigate()
  const [pin, setPin] = useState(['', '', '', ''])

  const handleNumberClick = (num) => {
    const nextIndex = pin.findIndex((val) => val === '')
    if (nextIndex !== -1) {
      const newPin = [...pin]
      newPin[nextIndex] = num.toString()
      setPin(newPin)
    }
  }

  const handleDelete = () => {
    const lastFilledIndex = pin.map((val) => val !== '').lastIndexOf(true)
    if (lastFilledIndex !== -1) {
      const newPin = [...pin]
      newPin[lastFilledIndex] = ''
      setPin(newPin)
    }
  }

  const handleCheck = () => {
    if (pin.every((val) => val !== '')) {
      navigate('/cashier_dashboard') // Change to your POS dashboard route
    } else {
      alert('Please enter a 4-digit staff PIN.')
    }
  }

  const handleTerminalLogin = (e) => {
    e.preventDefault()
    if (pin.every((val) => val !== '')) {
      navigate('/cashier_dashboard')
    } else {
      alert('Please enter a 4-digit staff PIN.')
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 font-[family-name:var(--font-body)] overflow-hidden">
      
      {/* Background Cafe Image with Blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center filter blur-xs scale-105 opacity-40"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=1200')` }}
      />
      <div className="absolute inset-0 bg-black/30" />

      {/* POS Login Card */}
      <div className="relative z-10 w-full max-w-[360px] bg-[#f4ece4]/95 backdrop-blur-md border border-[var(--color-border)] rounded-[28px] shadow-2xl p-6 sm:p-8 flex flex-col items-center text-center space-y-6">
        
        {/* Top Logo / Icon */}
        <div className="space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#1f1611] text-white flex items-center justify-center shadow-md">
            <Coffee size={22} />
          </div>
          <h1 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[#1f1611] tracking-tight">
            Artisan POS
          </h1>
          <p className="text-[11px] text-[var(--color-text-secondary)] font-medium">
            Staff Login
          </p>
        </div>

        {/* PIN Dot Display Box */}
        <div className="w-full space-y-2">
          <p className="text-[11px] font-semibold text-[var(--color-text)]">
            Enter Staff PIN
          </p>
          <div className="w-full h-12 bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)] flex items-center justify-center gap-4 shadow-2xs">
            {pin.map((digit, index) => (
              <div
                key={index}
                className={`w-3.5 h-3.5 rounded-full transition-all ${
                  digit !== '' ? 'bg-[#1f1611]' : 'bg-[#e5d9cf]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Keypad Grid */}
        <div className="w-full grid grid-cols-3 gap-2.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleNumberClick(num)}
              className="h-12 bg-white hover:bg-neutral-50 active:scale-95 border border-[var(--color-border)] rounded-[var(--radius-lg)] text-base font-bold text-[#1f1611] shadow-2xs transition-all cursor-pointer flex items-center justify-center"
            >
              {num}
            </button>
          ))}

          {/* Delete Button */}
          <button
            type="button"
            onClick={handleDelete}
            className="h-12 bg-white hover:bg-neutral-50 active:scale-95 border border-[var(--color-border)] rounded-[var(--radius-lg)] text-[#1f1611] shadow-2xs transition-all cursor-pointer flex items-center justify-center"
            aria-label="Delete"
          >
            <Delete size={18} />
          </button>

          {/* Zero Button */}
          <button
            type="button"
            onClick={() => handleNumberClick(0)}
            className="h-12 bg-white hover:bg-neutral-50 active:scale-95 border border-[var(--color-border)] rounded-[var(--radius-lg)] text-base font-bold text-[#1f1611] shadow-2xs transition-all cursor-pointer flex items-center justify-center"
          >
            0
          </button>

          {/* Check / Submit Keypad Button */}
          <button
            type="button"
            onClick={handleCheck}
            className="h-12 bg-[#fbdcd5] hover:bg-[#f6ccc4] active:scale-95 border border-[#f3b9ad] rounded-[var(--radius-lg)] text-[#a33824] shadow-2xs transition-all cursor-pointer flex items-center justify-center"
            aria-label="Confirm PIN"
          >
            <Check size={18} />
          </button>
        </div>

        {/* Login to Terminal Button */}
        <button
          type="button"
          onClick={handleTerminalLogin}
          className="w-full py-3 px-4 bg-[#1f1611] text-white rounded-[var(--radius-pill)] text-xs font-semibold inline-flex items-center justify-center gap-2 hover:bg-[var(--color-primary)] transition-colors shadow-md cursor-pointer"
        >
          Login to Terminal
          <ArrowRight size={14} />
        </button>

      </div>
    </div>
  )
}