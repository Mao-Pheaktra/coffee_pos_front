import React from 'react'
import { Delete } from 'lucide-react'

export default function Calculator({ value = '0', onChange, totalDue = 0 }) {
  // Safe Math Expression Evaluator
  const evaluateMath = (str) => {
    try {
      const cleaned = str.replace(/×/g, '*').replace(/÷/g, '/')
      if (/^[0-9+\-*/.\s]+$/.test(cleaned)) {
        // eslint-disable-next-line no-new-func
        const res = Function(`'use strict'; return (${cleaned})`)()
        if (!isNaN(res) && isFinite(res)) {
          return Number(res.toFixed(2))
        }
      }
    } catch (e) {
      return 0
    }
    return parseFloat(str) || 0
  }

  // Calculator Keypad Logic
  const handleKeyPress = (val) => {
    if (val === 'AC') {
      onChange('0')
    } else if (val === 'delete') {
      onChange(value.length > 1 ? value.slice(0, -1) : '0')
    } else if (val === '=') {
      const result = evaluateMath(value)
      onChange(result.toString())
    } else if (['+', '-', '*', '/'].includes(val)) {
      if (value === '0' && val === '-') {
        onChange('-')
        return
      }
      const lastChar = value.slice(-1)
      if (['+', '-', '*', '/'].includes(lastChar)) {
        onChange(value.slice(0, -1) + val)
      } else {
        onChange(value + val)
      }
    } else if (val === '.') {
      const parts = value.split(/[+\-*/]/)
      const currentPart = parts[parts.length - 1]
      if (!currentPart.includes('.')) {
        onChange(value + '.')
      }
    } else {
      onChange(value === '0' ? val : value + val)
    }
  }

  const handlePreset = (amount) => {
    onChange(amount.toFixed(2))
  }

  return (
    <div className="rounded-[28px] border border-stone-200/80 bg-stone-100/70 p-5 shadow-2xs space-y-4">
      {/* Display Box */}
      <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-5 py-3.5 shadow-2xs">
        <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
          Calculator Input
        </span>
        <span className="text-2xl font-black tracking-tight text-stone-900">
          {value}
        </span>
      </div>

      {/* Keypad Grid with Math Operators */}
      <div className="grid grid-cols-4 gap-2">
        <button
          type="button"
          onClick={() => handleKeyPress('AC')}
          className="flex h-12 cursor-pointer items-center justify-center rounded-xl border border-stone-200 bg-rose-50 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-100"
        >
          AC
        </button>
        <button
          type="button"
          onClick={() => handleKeyPress('/')}
          className="flex h-12 cursor-pointer items-center justify-center rounded-xl border border-stone-200 bg-amber-50 text-base font-bold text-amber-800 transition-colors hover:bg-amber-100"
        >
          /
        </button>
        <button
          type="button"
          onClick={() => handleKeyPress('*')}
          className="flex h-12 cursor-pointer items-center justify-center rounded-xl border border-stone-200 bg-amber-50 text-base font-bold text-amber-800 transition-colors hover:bg-amber-100"
        >
          *
        </button>
        <button
          type="button"
          onClick={() => handleKeyPress('-')}
          className="flex h-12 cursor-pointer items-center justify-center rounded-xl border border-stone-200 bg-amber-50 text-base font-bold text-amber-800 transition-colors hover:bg-amber-100"
        >
          -
        </button>

        <button
          type="button"
          onClick={() => handleKeyPress('7')}
          className="flex h-12 cursor-pointer items-center justify-center rounded-xl border border-stone-200 bg-white text-base font-bold text-stone-900 shadow-2xs hover:bg-stone-50"
        >
          7
        </button>
        <button
          type="button"
          onClick={() => handleKeyPress('8')}
          className="flex h-12 cursor-pointer items-center justify-center rounded-xl border border-stone-200 bg-white text-base font-bold text-stone-900 shadow-2xs hover:bg-stone-50"
        >
          8
        </button>
        <button
          type="button"
          onClick={() => handleKeyPress('9')}
          className="flex h-12 cursor-pointer items-center justify-center rounded-xl border border-stone-200 bg-white text-base font-bold text-stone-900 shadow-2xs hover:bg-stone-50"
        >
          9
        </button>
        <button
          type="button"
          onClick={() => handleKeyPress('+')}
          className="flex h-12 cursor-pointer items-center justify-center rounded-xl border border-stone-200 bg-amber-50 text-base font-bold text-amber-800 transition-colors hover:bg-amber-100"
        >
          +
        </button>

        <button
          type="button"
          onClick={() => handleKeyPress('4')}
          className="flex h-12 cursor-pointer items-center justify-center rounded-xl border border-stone-200 bg-white text-base font-bold text-stone-900 shadow-2xs hover:bg-stone-50"
        >
          4
        </button>
        <button
          type="button"
          onClick={() => handleKeyPress('5')}
          className="flex h-12 cursor-pointer items-center justify-center rounded-xl border border-stone-200 bg-white text-base font-bold text-stone-900 shadow-2xs hover:bg-stone-50"
        >
          5
        </button>
        <button
          type="button"
          onClick={() => handleKeyPress('6')}
          className="flex h-12 cursor-pointer items-center justify-center rounded-xl border border-stone-200 bg-white text-base font-bold text-stone-900 shadow-2xs hover:bg-stone-50"
        >
          6
        </button>
        <button
          type="button"
          onClick={() => handleKeyPress('=')}
          className="row-span-2 flex h-full cursor-pointer items-center justify-center rounded-xl border border-[#1f1611] bg-[#1f1611] text-base font-bold text-white shadow-2xs transition-colors hover:bg-[#362922]"
        >
          =
        </button>

        <button
          type="button"
          onClick={() => handleKeyPress('1')}
          className="flex h-12 cursor-pointer items-center justify-center rounded-xl border border-stone-200 bg-white text-base font-bold text-stone-900 shadow-2xs hover:bg-stone-50"
        >
          1
        </button>
        <button
          type="button"
          onClick={() => handleKeyPress('2')}
          className="flex h-12 cursor-pointer items-center justify-center rounded-xl border border-stone-200 bg-white text-base font-bold text-stone-900 shadow-2xs hover:bg-stone-50"
        >
          2
        </button>
        <button
          type="button"
          onClick={() => handleKeyPress('3')}
          className="flex h-12 cursor-pointer items-center justify-center rounded-xl border border-stone-200 bg-white text-base font-bold text-stone-900 shadow-2xs hover:bg-stone-50"
        >
          3
        </button>

        <button
          type="button"
          onClick={() => handleKeyPress('.')}
          className="flex h-12 cursor-pointer items-center justify-center rounded-xl border border-stone-200 bg-white text-base font-bold text-stone-900 shadow-2xs hover:bg-stone-50"
        >
          .
        </button>
        <button
          type="button"
          onClick={() => handleKeyPress('0')}
          className="flex h-12 cursor-pointer items-center justify-center rounded-xl border border-stone-200 bg-white text-base font-bold text-stone-900 shadow-2xs hover:bg-stone-50"
        >
          0
        </button>
        <button
          type="button"
          onClick={() => handleKeyPress('00')}
          className="flex h-12 cursor-pointer items-center justify-center rounded-xl border border-stone-200 bg-white text-base font-bold text-stone-900 shadow-2xs hover:bg-stone-50"
        >
          00
        </button>
        <button
          type="button"
          onClick={() => handleKeyPress('delete')}
          className="flex h-12 cursor-pointer items-center justify-center rounded-xl border border-stone-200 bg-stone-200/80 text-stone-700 hover:bg-stone-300"
        >
          <Delete size={18} />
        </button>
      </div>

      {/* Quick Presets */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        {[Math.ceil(totalDue), 40.0, 50.0].map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => handlePreset(preset)}
            className="cursor-pointer rounded-xl border border-stone-200 bg-white py-2 text-xs font-bold text-stone-700 transition-colors hover:bg-stone-50 shadow-2xs"
          >
            ${preset.toFixed(2)}
          </button>
        ))}
      </div>
    </div>
  )
}