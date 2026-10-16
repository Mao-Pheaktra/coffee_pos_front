import React, { useEffect, useState } from 'react'
import { Leaf, Mail, MapPin, Clock } from 'lucide-react'
import { FaInstagram, FaFacebookF } from 'react-icons/fa'
import { getGeneralSettings } from '../../services/generalSettingService'

const exploreLinks = ['Menu', 'Our Story', 'Visit', 'Catering', 'Gift Cards']

const hours = [
  { day: 'Mon – Fri', time: '7:00am – 6:00pm' },
  { day: 'Sat – Sun', time: '8:00am – 5:00pm' },
]

const Footer = () => {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const [settings, setSettings] = useState(null)

  // =====================================================
  // FETCH GENERAL SETTINGS
  // =====================================================

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await getGeneralSettings()

        setSettings(response.data)
      } catch (error) {
        console.error(
          'Failed to fetch general settings:',
          error
        )
      }
    }

    fetchSettings()
  }, [])

  // =====================================================
  // NEWSLETTER
  // =====================================================

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!email.includes('@')) return

    setSent(true)
  }

  // =====================================================
  // GENERAL SETTINGS
  // =====================================================

  const cafeName =
    settings?.cafe_name || 'Fern & Ember'

  const logo = settings?.logo

  const address =
    settings?.address ||
    '214 Willow Street\nRiverside District'

  const phoneNumber =
    settings?.phone_number

  return (
    <footer
      style={{
        background: 'var(--color-primary-dark)',
      }}
    >
      {/* Signature divider */}
      <svg
        viewBox="0 0 200 12"
        preserveAspectRatio="none"
        className="w-full h-3"
        aria-hidden="true"
      >
        <path
          d="M0 6 Q 25 0, 50 6 T 100 6 T 150 6 T 200 6"
          fill="none"
          stroke="var(--color-tertiary-light)"
          strokeWidth="1"
          opacity="0.5"
        />
      </svg>

      <div className="max-w-6xl mx-auto px-6 pt-10 pb-8">

        <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr_1fr_1.2fr] gap-10">

          {/* =================================================
              BRAND
          ================================================= */}

          <div>
            <div className="flex items-center gap-2 mb-3">

              {/* LOGO */}

              <span
                className="flex items-center justify-center w-9 h-9 rounded-full overflow-hidden"
                style={{
                  background:
                    'var(--color-tertiary)',
                }}
              >
                {logo ? (
                  <img
                    src={logo}
                    alt={cafeName}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Leaf
                    size={16}
                    color="var(--color-neutral)"
                  />
                )}
              </span>

              {/* CAFE NAME */}

              <span
                className="text-[19px]"
                style={{
                  fontFamily:
                    'var(--font-heading)',
                  color:
                    'var(--color-text-light)',
                  fontWeight: 700,
                }}
              >
                {cafeName}
              </span>

            </div>

            <p
              className="text-[14px] leading-relaxed max-w-60"
              style={{
                color:
                  'var(--color-secondary-dark)',
              }}
            >
              {settings?.short_description ||
                'Slow coffee, honest pastry, and a green corner of the neighborhood to sit in.'}
            </p>

            {/* SOCIAL */}

            <div className="flex items-center gap-3 mt-5">

              {[FaInstagram, FaFacebookF].map(
                (Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    aria-label="Social link"
                    className="flex items-center justify-center w-9 h-9 rounded-full transition-colors"
                    style={{
                      background:
                        'rgba(230, 213, 195, 0.1)',
                      color:
                        'var(--color-secondary-light)',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        'var(--color-tertiary)')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        'rgba(230, 213, 195, 0.1)')
                    }
                  >
                    <Icon size={16} />
                  </a>
                )
              )}

            </div>
          </div>

          {/* =================================================
              EXPLORE
          ================================================= */}

          <div>
            <h4
              className="text-[13px] tracking-widest uppercase mb-4"
              style={{
                fontFamily:
                  'var(--font-body)',
                color:
                  'var(--color-tertiary-light)',
                fontWeight: 600,
              }}
            >
              Explore
            </h4>

            <ul className="flex flex-col gap-3">

              {exploreLinks.map((link) => (
                <li key={link}>

                  <a
                    href="#"
                    className="text-[14px] transition-colors"
                    style={{
                      color:
                        'var(--color-secondary-dark)',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color =
                        'var(--color-text-light)')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color =
                        'var(--color-secondary-dark)')
                    }
                  >
                    {link}
                  </a>

                </li>
              ))}

            </ul>
          </div>

          {/* =================================================
              VISIT
          ================================================= */}

          <div>

            <h4
              className="text-[13px] tracking-widest uppercase mb-4"
              style={{
                fontFamily:
                  'var(--font-body)',
                color:
                  'var(--color-tertiary-light)',
                fontWeight: 600,
              }}
            >
              Visit Us
            </h4>

            {/* ADDRESS */}

            <div className="flex items-start gap-2 mb-3">

              <MapPin
                size={15}
                style={{
                  color:
                    'var(--color-secondary-dark)',
                  marginTop: '2px',
                  flexShrink: 0,
                }}
              />

              <p
                className="text-[14px] whitespace-pre-line"
                style={{
                  color:
                    'var(--color-secondary-dark)',
                }}
              >
                {address}
              </p>

            </div>

            {/* HOURS */}

            <div className="flex items-start gap-2">

              <Clock
                size={15}
                style={{
                  color:
                    'var(--color-secondary-dark)',
                  marginTop: '2px',
                  flexShrink: 0,
                }}
              />

              <div
                className="text-[14px]"
                style={{
                  color:
                    'var(--color-secondary-dark)',
                }}
              >
                {hours.map((h) => (
                  <p key={h.day}>
                    {h.day}: {h.time}
                  </p>
                ))}
              </div>

            </div>

            {/* PHONE */}

            {phoneNumber && (
              <p
                className="text-[14px] mt-3"
                style={{
                  color:
                    'var(--color-secondary-dark)',
                }}
              >
                {phoneNumber}
              </p>
            )}

          </div>

          {/* =================================================
              NEWSLETTER
          ================================================= */}

          <div>

            <h4
              className="text-[13px] tracking-widest uppercase mb-4"
              style={{
                fontFamily:
                  'var(--font-body)',
                color:
                  'var(--color-tertiary-light)',
                fontWeight: 600,
              }}
            >
              Stay Rooted
            </h4>

            <p
              className="text-[14px] mb-4"
              style={{
                color:
                  'var(--color-secondary-dark)',
              }}
            >
              New seasonal drinks and market days,
              once a month.
            </p>

            {sent ? (
              <p
                className="text-[14px]"
                style={{
                  color:
                    'var(--color-tertiary-light)',
                  fontWeight: 600,
                }}
              >
                You're on the list.
              </p>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2"
              >

                <div
                  className="flex items-center gap-2 flex-1 px-3 rounded-md"
                  style={{
                    background:
                      'rgba(230, 213, 195, 0.1)',
                    border:
                      '1px solid rgba(230, 213, 195, 0.2)',
                  }}
                >

                  <Mail
                    size={15}
                    style={{
                      color:
                        'var(--color-secondary-dark)',
                      flexShrink: 0,
                    }}
                  />

                  <input
                    type="email"
                    required
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    className="w-full bg-transparent border-0 min-h-0 py-2.5 text-[14px] focus:outline-none focus:shadow-none focus:border-0"
                    style={{
                      color:
                        'var(--color-text-light)',
                    }}
                  />

                </div>

                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-md text-[13px] whitespace-nowrap"
                  style={{
                    background:
                      'var(--color-tertiary)',
                    color:
                      'var(--color-text-light)',
                    fontWeight: 600,
                  }}
                >
                  Join
                </button>

              </form>
            )}

          </div>

        </div>

        {/* =================================================
            BOTTOM BAR
        ================================================= */}

        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-10 pt-6"
          style={{
            borderTop:
              '1px solid rgba(230, 213, 195, 0.15)',
          }}
        >

          <p
            className="text-[13px]"
            style={{
              color:
                'var(--color-secondary-dark)',
            }}
          >
            © {new Date().getFullYear()} {cafeName}.
            All rights reserved.
          </p>

          <p
            className="text-[13px]"
            style={{
              color:
                'var(--color-tertiary-light)',
            }}
          >
            Grown, brewed, poured with care.
          </p>

        </div>

      </div>
    </footer>
  )
}

export default Footer