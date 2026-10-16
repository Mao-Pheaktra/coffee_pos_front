import React from 'react'
import { Coffee } from 'lucide-react'

const roastSegments = [
  { color: 'var(--color-secondary-light)' },
  { color: 'var(--color-secondary-dark)' },
  { color: 'var(--color-primary-light)' },
  { color: 'var(--color-primary)' },
  { color: 'var(--color-primary-dark)' },
]

const arcPaths = [
  'M30,180 A140,140 0 0,1 56.74,97.68',
  'M56.74,97.68 A140,140 0 0,1 126.74,46.86',
  'M126.74,46.86 A140,140 0 0,1 213.26,46.86',
  'M213.26,46.86 A140,140 0 0,1 283.26,97.68',
  'M283.26,97.68 A140,140 0 0,1 310,180',
]

const RoastDial = () => {
  return (
    <div className="relative w-full max-w-[380px] mx-auto">
      <svg viewBox="0 0 340 210" className="w-full h-auto">
        {arcPaths.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={roastSegments[i].color}
            strokeWidth="26"
            strokeLinecap="butt"
          />
        ))}
        {/* pivot */}
        <circle cx="170" cy="180" r="10" fill="var(--color-primary-dark)" />
        {/* needle pointing at Medium-Dark */}
        <line
          x1="170"
          y1="180"
          x2="233"
          y2="90"
          stroke="var(--color-primary-dark)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="233" cy="90" r="6" fill="var(--color-primary-dark)" />
      </svg>

      <div className="text-center -mt-2">
        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--color-tertiary-dark)]">
          House roast
        </p>
        <p className="font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-text)]">
          Medium–Dark
        </p>
      </div>

      <div className="absolute -top-2 -right-2 sm:top-0 sm:right-0 bg-[var(--color-neutral)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-md)] px-4 py-3 flex items-center gap-2">
        <Coffee size={18} className="text-[var(--color-tertiary-dark)]" />
        <div className="leading-tight">
          <p className="text-[11px] text-[var(--color-text-muted)]">Fresh roast</p>
          <p className="text-sm font-semibold text-[var(--color-text)]">Every Tuesday</p>
        </div>
      </div>
    </div>
  )
}

export default RoastDial