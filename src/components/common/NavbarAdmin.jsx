import React, { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getAdminProfile } from '../../services/adminService'

export default function NavbarAdmin() {
  const navigate = useNavigate()

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    profileImage: null,
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getAdminProfile()

        const user = response?.data

        if (user) {
          setProfile({
            name: user.name || '',
            email: user.email || '',
            profileImage: user.profileImage || null,
          })
        }
      } catch (error) {
        console.error('Failed to fetch admin profile:', error)
      }
    }

    fetchProfile()
  }, [])

  const handleProfileClick = () => {
    navigate('/admin_profile')
  }

  // Fallback avatar if admin doesn't have profileImage
  const avatar =
    profile.profileImage ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      profile.name || 'Admin'
    )}&background=0f172a&color=fbbf24&bold=true`

  return (
    <header className="h-16 bg-(--color-neutral) border-b border-(--color-border) px-8 flex items-center justify-between shrink-0">
      {/* Search Bar */}
      <div className="relative w-80">
        <input
          type="text"
          placeholder="Search orders, products..."
          className="w-full pl-4 pr-4 py-2 bg-(--color-surface) border border-(--color-border) rounded-(--radius-pill) text-xs font-medium text-(--color-text) focus:outline-hidden focus:border-neutral-400 transition-colors"
        />
      </div>

      {/* Right User Actions */}
      <div className="flex items-center gap-4">
        {/* Notification */}
        <button
          type="button"
          className="w-9 h-9 rounded-full flex items-center justify-center text-(--color-text-secondary) hover:text-(--color-text) transition-colors cursor-pointer relative"
        >
          <Bell size={16} />

          <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white"></span>
        </button>

        {/* Admin Profile */}
        <button
          type="button"
          onClick={handleProfileClick}
          className="w-9 h-9 rounded-full overflow-hidden  cursor-pointer hover:ring-2 hover:ring-amber-400 transition-all"
          title="Admin Profile"
        >
          <img
            src={avatar}
            alt={profile.name || 'Admin Profile'}
            className="w-full h-full object-cover rounded-2xl"
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                profile.name || 'Admin'
              )}&background=0f172a&color=fbbf24&bold=true`
            }}
          />
        </button>
      </div>
    </header>
  )
}