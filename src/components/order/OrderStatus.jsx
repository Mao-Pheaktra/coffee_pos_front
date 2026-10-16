import React from 'react'

const CheckIcon = ({ size = 12, color = '#FDFCF2' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M20 6L9 17l-5-5"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const OrderStatus = ({ steps }) => {
  const colors = {
    primary: '#3E2723',
    tertiary: '#4A5D4E',
    neutral: '#FDFCF0',
    surface: '#F1F0E4',
    border: '#DBDBCF',
    text: '#2B2422',
    textSecondary: '#6F6864',
    textMuted: '#8C8782',
    textLight: '#FDFCF2',
  }

  return (
    <div
      className="rounded-2xl border shadow-sm"
      style={{
        backgroundColor: colors.neutral,
        borderColor: colors.border,
      }}
    >
      <div className="p-6">
        <div
          className="text-xs font-bold uppercase mb-4"
          style={{
            color: colors.textSecondary,
            letterSpacing: '0.06em',
          }}
        >
          Status
        </div>

        <div className="flex flex-col">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1
            const railColor =
              step.state === 'done'
                ? colors.tertiary
                : colors.border

            return (
              <div
                key={step.title}
                className={`grid grid-cols-[28px_1fr] gap-4 ${
                  isLast ? 'pb-0' : 'pb-6'
                }`}
              >
                <div className="relative flex justify-center">
                  {!isLast && (
                    <div
                      className="absolute top-7 -bottom-6 w-0.5"
                      style={{ backgroundColor: railColor }}
                    />
                  )}

                  {step.state === 'done' && (
                    <div
                      className="w-[26px] h-[26px] rounded-full flex items-center justify-center z-10 flex-shrink-0"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <CheckIcon />
                    </div>
                  )}

                  {step.state === 'current' && (
                    <div
                      className="w-[26px] h-[26px] rounded-full flex items-center justify-center z-10 flex-shrink-0"
                      style={{
                        backgroundColor: colors.neutral,
                        border: `2px solid ${colors.tertiary}`,
                      }}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: colors.tertiary }}
                      />
                    </div>
                  )}

                  {step.state === 'pending' && (
                    <div
                      className="w-[26px] h-[26px] rounded-full z-10 flex-shrink-0"
                      style={{
                        backgroundColor: colors.surface,
                        border: `2px solid ${colors.border}`,
                      }}
                    />
                  )}
                </div>

                <div>
                  <div
                    className="text-xs font-bold uppercase"
                    style={{
                      color:
                        step.state === 'pending'
                          ? colors.textMuted
                          : colors.text,
                    }}
                  >
                    {step.title}
                  </div>

                  <div
                    className="text-sm mt-0.5"
                    style={{
                      color:
                        step.state === 'pending'
                          ? colors.textMuted
                          : colors.textSecondary,
                    }}
                  >
                    {step.meta}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default OrderStatus