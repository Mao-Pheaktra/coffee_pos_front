import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, Leaf, ShoppingBag, User ,  Heart} from 'lucide-react'
import { FaInstagram, FaFacebookF } from 'react-icons/fa'
import { getGeneralSettings } from '../../services/generalSettingService'
import api from '../../services/api'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Menu', href: '/menu' },
  { label: 'Order', action: 'tracking' },
  { label: 'Profile', href: '/profile' },
]

const Navbar = ({ cartItemCount: propCount }) => {
  const [open, setOpen] = useState(false)
  const [cartCount, setCartCount] = useState(propCount || 0)

  const [settings, setSettings] = useState(null)

  const [user, setUser] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)


  const navigate = useNavigate()

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
  // CART COUNT
  // =====================================================

  useEffect(() => {
    const updateCartCount = () => {
      const cart =
        JSON.parse(localStorage.getItem('cafe_cart')) || []

      const count = cart.reduce(
        (total, item) =>
          total + Number(item.quantity || 0),
        0
      )

      setCartCount(count)
    }

    updateCartCount()

    window.addEventListener(
      'shoppingBagUpdated',
      updateCartCount
    )

    return () => {
      window.removeEventListener(
        'shoppingBagUpdated',
        updateCartCount
      )
    }
  }, [])

const handleOrderTracking = () => {
  const orderId = localStorage.getItem("last_order_id");

  if (orderId) {
    navigate(`/order_tracking/${orderId}`);
  } else {
    navigate("/menu");
  }
};

// =====================================================
// CHECK AUTHENTICATION
// =====================================================
useEffect(() => {
  const checkAuth = async () => {
    const token = localStorage.getItem('token')

    if (!token) {
      setUser(null)
      setIsLoggedIn(false)
      return
    }

    try {
      const response = await api.get('/user')

      setUser(response.data)
      setIsLoggedIn(true)

      localStorage.setItem(
        'user',
        JSON.stringify(response.data)
      )

    } catch (error) {
      // Axios interceptor handles 401
      // But update Navbar state immediately too
      if (error.response?.status === 401) {
        setUser(null)
        setIsLoggedIn(false)
      }
    }
  }

  checkAuth()

  window.addEventListener(
    'authChanged',
    checkAuth
  )

  return () => {
    window.removeEventListener(
      'authChanged',
      checkAuth
    )
  }
}, [])
const profileImage =
  user?.profile_image ||
  user?.profileImage ||
  user?.avatar ||
  user?.avatar_url ||
  null

  // =====================================================
  // LOGO
  // =====================================================

  const cafeName =
    settings?.cafe_name || 'Fern & Ember'

  const logo = settings?.logo

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        background: 'var(--color-neutral)',
        borderBottom: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <nav className="mx-auto flex h-19 max-w-6xl items-center justify-between px-6">

        {/* LOGO */}

        <Link
          to="/"
          className="group flex items-center gap-2"
        >
          <span
            className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full"
            style={{
              background: 'var(--color-tertiary)',
            }}
          >
            {logo ? (
              <img
                src={logo}
                alt={cafeName}
                className="h-full w-full object-contain"
              />
            ) : (
              <Leaf
                size={18}
                strokeWidth={2}
                color="var(--color-neutral)"
              />
            )}
          </span>

          <span
            className="text-[20px] leading-none tracking-tight"
            style={{
              fontFamily: 'var(--font-heading)',
              color: 'var(--color-primary)',
              fontWeight: 700,
            }}
          >
            {cafeName}
          </span>
        </Link>

        {/* DESKTOP LINKS */}

        <ul className="hidden items-center gap-8 md:flex">
  {navLinks.map((link) => (
    <li key={link.label}>
      {link.action === 'tracking' ? (
        <button
          type="button"
          onClick={handleOrderTracking}
          className="relative text-[14px] tracking-wide transition-colors text-uppercase"
          style={{
            fontFamily: 'var(--font-body)',
            color: 'var(--color-text-secondary)',
            fontWeight: 500,
          }}
        >
          {link.label}
        </button>
      ) : (
        <Link
          to={link.href}
          className="relative pb-1 text-[14px] uppercase tracking-wide transition-colors"
          style={{
            fontFamily: 'var(--font-body)',
            color: 'var(--color-text-secondary)',
            fontWeight: 500,
          }}
        >
          {link.label}
        </Link>
      )}
    </li>
  ))}
</ul>

        {/* DESKTOP ACTIONS */}

        <div className="hidden items-center gap-4 md:flex">

        
          {/* LOGIN */}

{/* AUTH / PROFILE */}

          {isLoggedIn ? (
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full  transition-opacity hover:opacity-80"
              aria-label="Profile"
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={user?.name || 'Profile'}
                  className="h-full w-full object-cover rounded-full"
                />
              ) : (
                <User
                  size={18}
                  className="text-(--color-primary)"
                />
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-(--color-border) bg-(--color-surface) px-4 py-2 text-xs font-semibold text-(--color-text) shadow-2xs transition-colors hover:bg-(--color-secondary-light)"
            >
              <User
                size={15}
                className="text-(--color-primary)"
              />

              Login
            </button>
          )}

          {/* FAVORITES */}

        <button
          type="button"
          onClick={() => navigate('/favorites')}
          className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-stone-100 hover:text-[#1f1611]"
          aria-label="Favorites"
        >
          <Heart size={18} />
        </button>

          {/* SHOPPING BAG */}

          <button
            type="button"
            onClick={() => navigate('/shoppingbags')}
            className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-stone-100 hover:text-[#1f1611]"
            aria-label="Shopping bag"
          >
            <ShoppingBag size={18} />

            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#3E2723] px-1 text-[10px] font-bold text-white">
                {cartCount > 99
                  ? '99+'
                  : cartCount}
              </span>
            )}
          </button>
        </div>

        {/* MOBILE TOGGLE */}

        <button
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full md:hidden"
          style={{
            background:
              'var(--color-secondary-light)',
          }}
          onClick={() =>
            setOpen((value) => !value)
          }
          aria-label={
            open
              ? 'Close menu'
              : 'Open menu'
          }
        >
          {open ? (
            <X
              size={20}
              color="var(--color-primary)"
            />
          ) : (
            <Menu
              size={20}
              color="var(--color-primary)"
            />
          )}
        </button>
      </nav>

      {/* MOBILE PANEL */}

      {open && (
        <div className="border-t border-(--color-border) bg-(--color-neutral) px-6 pb-6 md:hidden">

          <ul className="flex flex-col gap-1 pt-4">
            {navLinks.map((link) => (
  <li key={link.label}>
    {link.action === 'tracking' ? (
      <button
        type="button"
        onClick={() => {
          setOpen(false)
          handleOrderTracking()
        }}
        className="block w-full py-3 text-left text-[15px]"
        style={{
          fontFamily: 'var(--font-body)',
          color: 'var(--color-text)',
          fontWeight: 500,
        }}
      >
        {link.label}
      </button>
    ) : (
      <Link
        to={link.href}
        className="block py-3 text-[15px]"
        style={{
          fontFamily: 'var(--font-body)',
          color: 'var(--color-text)',
          fontWeight: 500,
        }}
        onClick={() => setOpen(false)}
      >
        {link.label}
      </Link>
    )}
  </li>
))}
          </ul>

          <div className="mt-2 flex items-center justify-between border-t border-(--color-border) pt-4">

            <div className="flex items-center gap-4">

              <a
                href="#instagram"
                aria-label="Instagram"
                style={{
                  color:
                    'var(--color-text-muted)',
                }}
              >
                <FaInstagram size={18} />
              </a>

              <a
                href="#facebook"
                aria-label="Facebook"
                style={{
                  color:
                    'var(--color-text-muted)',
                }}
              >
                <FaFacebookF size={18} />
              </a>

            </div>

            <div className="flex items-center gap-2">

            {isLoggedIn ? (
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  navigate('/profile')
                }}
                className="inline-flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-(--color-border) bg-(--color-secondary-light)"
                aria-label="Profile"
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={user?.name || 'Profile'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User
                    size={16}
                    className="text-(--color-primary)"
                  />
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  navigate('/login')
                }}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-(--color-border) bg-(--color-surface) px-4 py-2 text-[13px] font-semibold text-(--color-text)"
              >
                <User
                  size={14}
                  className="text-(--color-primary)"
                />

                Login
              </button>
            )}

              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  navigate('/shoppingbags')
                }}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-(--color-primary) px-4 py-2 text-[13px] font-semibold text-(--color-text-light)"
              >
                <ShoppingBag size={14} />

                Cart ({cartCount})
              </button>

            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar