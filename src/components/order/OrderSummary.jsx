import React from 'react'

const HelpIcon = ({ size = 15, color = '#3E2723' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
    <path
      d="M9.5 9a2.5 2.5 0 1 1 3.4 2.32c-.7.28-1.4.9-1.4 1.68v.3"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="12" cy="17" r="0.9" fill={color} />
  </svg>
)

const OrderSummary = ({ items = [], totals = { lines: [] }, onGetHelp }) => {
  const colors = {
    primary: '#3E2723',
    neutral: '#FDFCF0',
    border: '#DBDBCF',
    text: '#2B2422',
    textSecondary: '#6F6864',
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
          Summary
        </div>

        {/* Safe mapping with fallback array */}
        {(items || []).map((item, index) => (
          <div
            key={item.id || item.name || index}
            className="flex gap-3 py-4"
            style={{
              borderBottom: `1px solid ${colors.border}`,
              paddingTop: index === 0 ? 0 : undefined,
            }}
          >
            <div
              className="w-[52px] h-[52px] rounded-xl flex-shrink-0 shadow-sm bg-cover bg-center"
              style={{ backgroundImage: item.gradient || `url(${item.image})` }}
            />

            <div>
              <div
                className="text-sm font-bold"
                style={{ color: colors.text }}
              >
                {item.name}
              </div>

              {item.note && (
                <div
                  className="text-xs mt-0.5"
                  style={{ color: colors.textSecondary }}
                >
                  {item.note}
                </div>
              )}
            </div>

            <div
              className="ml-auto text-sm font-bold whitespace-nowrap"
              style={{ color: colors.text }}
            >
              ${Number(item.price || 0).toFixed(2)}
            </div>
          </div>
        ))}

        <div className="pt-4">
          {/* Safe mapping for totals lines */}
          {(totals?.lines || []).map((line, index) => (
            <div
              key={line.label || index}
              className="flex justify-between text-sm py-1"
              style={{ color: colors.textSecondary }}
            >
              <span>{line.label}</span>
              <span>{line.value}</span>
            </div>
          ))}

          <div
            className="flex justify-between font-extrabold text-base mt-2 pt-3"
            style={{
              color: colors.text,
              borderTop: `1px solid ${colors.border}`,
            }}
          >
            <span>Total</span>
            <span>{totals?.grandTotal}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onGetHelp}
          className="w-full mt-6 px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          style={{
            backgroundColor: 'transparent',
            border: `1.5px solid ${colors.primary}`,
            color: colors.primary,
            letterSpacing: '0.04em',
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.backgroundColor = colors.primary
            event.currentTarget.style.color = colors.textLight
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.backgroundColor = 'transparent'
            event.currentTarget.style.color = colors.primary
          }}
        >
          <HelpIcon />
          Get help
        </button>
      </div>
    </div>
  )
}

export default OrderSummary