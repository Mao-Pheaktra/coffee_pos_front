import React from 'react'

const PinIcon = ({ size = 14, color = '#FDFCF2' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 22s7-7.58 7-13a7 7 0 1 0-14 0c0 5.42 7 13 7 13z"
      fill={color}
    />
    <circle cx="12" cy="9" r="2.5" fill="#4A5D4E" />
  </svg>
)

const OrderHeader = ({
  orderId,
  eta,
  courier,
  destination,
}) => {
  const colors = {
    primary: '#3E2723',
    secondary: '#E6D5C3',
    secondaryDark: '#D5C0A8',
    secondaryLight: '#F0E4D7',
    tertiary: '#4A5D4E',
    tertiaryLight: '#718274',
    neutral: '#FDFCF0',
    border: '#DBDBCF',
    text: '#2B2422',
    textSecondary: '#6F6864',
    textLight: '#FDFCF2',
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div
            className="text-xs font-bold uppercase tracking-widest mb-2"
            style={{ color: colors.tertiary }}
          >
            Mini Café · Pickup order
          </div>

          <h1
            className="text-3xl font-extrabold"
            style={{ color: colors.text }}
          >
            Order #{orderId}
          </h1>
        </div>

        <div
          className="flex items-center gap-2 px-6 py-3 rounded-full shadow-md"
          style={{
            backgroundColor: colors.tertiary,
            color: colors.textLight,
          }}
        >
          <span className="text-xs font-semibold uppercase opacity-80">
            Arriving
          </span>

          <span className="text-lg font-bold">
            {eta}
          </span>
        </div>
      </div>

      <div
        className="rounded-2xl border shadow-sm overflow-hidden mb-6"
        style={{
          backgroundColor: colors.neutral,
          borderColor: colors.border,
        }}
      >
        <div
          className="relative h-[340px]"
          style={{
            background: `linear-gradient(180deg, ${colors.secondaryLight}, ${colors.secondary})`,
          }}
        >
          <svg
            viewBox="0 0 640 340"
            preserveAspectRatio="xMidYMid slice"
            className="w-full h-full block"
          >
            <rect
              x="20"
              y="20"
              width="140"
              height="90"
              rx="10"
              fill={colors.tertiaryLight}
              opacity="0.35"
            />

            <rect
              x="420"
              y="190"
              width="170"
              height="120"
              rx="10"
              fill={colors.tertiaryLight}
              opacity="0.35"
            />

            <path
              d="M0 150 H640"
              stroke={colors.neutral}
              strokeWidth="14"
              opacity="0.7"
            />

            <path
              d="M0 150 H640"
              stroke={colors.border}
              strokeWidth="1"
              strokeDasharray="6 6"
            />

            <path
              d="M230 0 V340"
              stroke={colors.neutral}
              strokeWidth="14"
              opacity="0.7"
            />

            <path
              d="M230 0 V340"
              stroke={colors.border}
              strokeWidth="1"
              strokeDasharray="6 6"
            />

            <path
              d="M0 260 H640"
              stroke={colors.neutral}
              strokeWidth="10"
              opacity="0.5"
            />

            <path
              d="M440 0 V340"
              stroke={colors.neutral}
              strokeWidth="10"
              opacity="0.5"
            />

            <g fill={colors.secondaryDark} opacity="0.8">
              <rect x="40" y="180" width="46" height="34" rx="4" />
              <rect x="100" y="200" width="60" height="46" rx="4" />
              <rect x="270" y="40" width="50" height="40" rx="4" />
              <rect x="330" y="60" width="40" height="60" rx="4" />
              <rect x="480" y="30" width="60" height="44" rx="4" />
              <rect x="550" y="60" width="42" height="70" rx="4" />
              <rect x="60" y="260" width="50" height="50" rx="4" />
              <rect x="330" y="230" width="46" height="40" rx="4" />
            </g>

            <path
              d="M96 196 C160 196,190 150,260 150 S360 90,400 90 S470 150,520 168"
              fill="none"
              stroke={colors.primary}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="1 12"
            />

            <circle cx="96" cy="196" r="9" fill={colors.primary} />
            <circle
              cx="96"
              cy="196"
              r="15"
              fill={colors.primary}
              opacity="0.18"
            />

            <path
              d="M520 168 c0-16-13-24-22-24s-22 8-22 24c0 15 22 34 22 34s22-19 22-34z"
              fill={colors.tertiary}
            />

            <circle
              cx="498"
              cy="167"
              r="6"
              fill={colors.neutral}
            />
          </svg>

          {/* Render Courier overlay only if courier data exists */}
          {courier && (
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-3">
              <div
                className="flex items-center gap-3 rounded-2xl shadow-md px-4 py-3"
                style={{ backgroundColor: colors.neutral }}
              >
                <div
                  className="w-[34px] h-[34px] rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.textLight,
                  }}
                >
                  {courier?.initials}
                </div>

                <div>
                  <div
                    className="text-sm font-bold"
                    style={{ color: colors.text }}
                  >
                    {courier?.name}
                  </div>

                  <div
                    className="text-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    {courier?.detail}
                  </div>
                </div>
              </div>

              <div
                className="rounded-2xl shadow-md px-4 py-3 text-right"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.textLight,
                }}
              >
                <div className="text-xl font-extrabold leading-none">
                  {courier?.minsAway}
                </div>

                <div className="text-[10px] uppercase opacity-85">
                  min away
                </div>
              </div>
            </div>
          )}

          <div
            className="absolute bottom-4 left-4 flex items-center gap-3 rounded-2xl shadow-md px-4 py-3"
            style={{ backgroundColor: colors.neutral }}
          >
            <div
              className="w-[30px] h-[30px] rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: colors.tertiary }}
            >
              <PinIcon />
            </div>

            <div>
              <div
                className="text-[10px] font-bold uppercase"
                style={{
                  color: colors.textSecondary,
                  letterSpacing: '0.08em',
                }}
              >
                Destination
              </div>

              <div
                className="text-sm font-semibold"
                style={{ color: colors.text }}
              >
                {destination}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderHeader