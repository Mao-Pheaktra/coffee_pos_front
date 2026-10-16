import React, { useEffect, useState } from 'react'

export default function SystemStatus() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const time = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  const period = currentTime
    .toLocaleTimeString([], { hour: 'numeric' })
    .slice(-2)

  return (
    <div className="bg-[var(--color-neutral)] border border-[var(--color-border)] rounded-[20px] p-5 shadow-xs flex flex-col justify-between space-y-6">

      <div className="space-y-4">
        <h3 className="font-[family-name:var(--font-heading)] font-bold text-sm">
          System Status
        </h3>

        <div className="space-y-3 text-xs">

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-medium">
                Payment Gateway
              </span>
            </div>

            <span className="text-[var(--color-text-secondary)]">
              Online
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-medium">
                Receipt Printer A
              </span>
            </div>

            <span className="text-[var(--color-text-secondary)]">
              Ready
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="font-medium">
                Inventory Sync
              </span>
            </div>

            <span className="text-[var(--color-text-secondary)]">
              Lagging (2m)
            </span>
          </div>

        </div>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)]/50 rounded-[16px] p-4 text-center space-y-1">

        <div className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight">
          {time}
          <span className="text-xs font-normal text-[var(--color-text-secondary)] ml-1">
            {period}
          </span>
        </div>

        <div className="text-[11px] text-[var(--color-text-secondary)] font-medium">
          Current time
        </div>

      </div>

    </div>
  )
}