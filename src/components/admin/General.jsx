import React, { useEffect, useState } from 'react'
import {
  Image as ImageIcon,
  Upload,
  Save,
  RotateCcw,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
} from 'lucide-react'

import {
  getGeneralSettings,
  updateGeneralSettings,
} from '../../services/generalSettingService'

export default function General() {
  const [formData, setFormData] = useState({
    cafeName: '',
    shortDescription: '',
    heroTitle: '',
    featuredSectionTitle: '',
    heroDescription: '',
    welcomeMessage: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    currency: 'USD',
    timezone: 'Asia/Phnom_Penh',
  })

  // Existing Cloudinary URLs
  const [logoUrl, setLogoUrl] = useState('')
  const [faviconUrl, setFaviconUrl] = useState('')
  const [heroImageUrl, setHeroImageUrl] = useState('')

  // New selected files
  const [logoFile, setLogoFile] = useState(null)
  const [faviconFile, setFaviconFile] = useState(null)
  const [heroImageFile, setHeroImageFile] = useState(null)

  // Local previews
  const [logoPreview, setLogoPreview] = useState('')
  const [faviconPreview, setFaviconPreview] = useState('')
  const [heroPreview, setHeroPreview] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // =========================================================
  // FETCH GENERAL SETTINGS
  // =========================================================

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await getGeneralSettings()

      const settings = response.data

      setFormData({
        cafeName: settings.cafe_name || '',
        shortDescription: settings.short_description || '',
        heroTitle: settings.hero_title || '',
        featuredSectionTitle: settings.featured_section_title || '',
        heroDescription: settings.hero_description || '',
        welcomeMessage: settings.welcome_message || '',
        phone: settings.phone_number || '',
        email: settings.contact_email || '',
        website: settings.website || '',
        address: settings.address || '',
        currency: settings.currency || 'USD',
        timezone: settings.timezone || 'Asia/Phnom_Penh',
      })

      // Existing image URLs
      setLogoUrl(settings.logo || '')
      setFaviconUrl(settings.favicon || '')
      setHeroImageUrl(settings.hero_image || '')

      // Clear newly selected files
      setLogoFile(null)
      setFaviconFile(null)
      setHeroImageFile(null)

      // Clear local previews
      setLogoPreview('')
      setFaviconPreview('')
      setHeroPreview('')
    } catch (err) {
      console.error('Failed to fetch general settings:', err)

      setError(
        err.response?.data?.message ||
          'Failed to load general settings.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  // =========================================================
  // INPUT CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // =========================================================
  // LOGO CHANGE
  // =========================================================

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0]

    if (!file) return

    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  // =========================================================
  // FAVICON CHANGE
  // =========================================================

  const handleFaviconChange = (e) => {
    const file = e.target.files?.[0]

    if (!file) return

    setFaviconFile(file)
    setFaviconPreview(URL.createObjectURL(file))
  }

  // =========================================================
  // HERO IMAGE CHANGE
  // =========================================================

  const handleHeroImageChange = (e) => {
    const file = e.target.files?.[0]

    if (!file) return

    setHeroImageFile(file)
    setHeroPreview(URL.createObjectURL(file))
  }

  // =========================================================
  // RESET
  // =========================================================

  const handleReset = async () => {
    setSuccess('')
    setError('')

    await fetchSettings()
  }

  // =========================================================
  // SAVE
  // =========================================================

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const data = new FormData()

      data.append('cafe_name', formData.cafeName)
      data.append(
        'short_description',
        formData.shortDescription
      )

      data.append('hero_title', formData.heroTitle)

      data.append(
        'featured_section_title',
        formData.featuredSectionTitle
      )

      data.append(
        'hero_description',
        formData.heroDescription
      )

      data.append(
        'welcome_message',
        formData.welcomeMessage
      )

      data.append('phone_number', formData.phone)
      data.append('contact_email', formData.email)
      data.append('website', formData.website)
      data.append('address', formData.address)

      data.append('currency', formData.currency)
      data.append('timezone', formData.timezone)

      // Only send files if user selected a new one
      if (logoFile) {
        data.append('logo', logoFile)
      }

      if (faviconFile) {
        data.append('favicon', faviconFile)
      }

      if (heroImageFile) {
        data.append('hero_image', heroImageFile)
      }

      const response = await updateGeneralSettings(data)

      const settings = response.data

      // Update URLs returned by backend
      setLogoUrl(settings.logo || '')
      setFaviconUrl(settings.favicon || '')
      setHeroImageUrl(settings.hero_image || '')

      // Clear selected files
      setLogoFile(null)
      setFaviconFile(null)
      setHeroImageFile(null)

      setLogoPreview('')
      setFaviconPreview('')
      setHeroPreview('')

      setSuccess(
        response.message ||
          'General settings updated successfully.'
      )
    } catch (err) {
      console.error('Failed to update general settings:', err)

      if (err.response?.status === 422) {
        const validationErrors =
          err.response?.data?.errors

        if (validationErrors) {
          const firstError = Object.values(
            validationErrors
          )[0]?.[0]

          setError(firstError || 'Validation failed.')
        } else {
          setError('Validation failed.')
        }
      } else {
        setError(
          err.response?.data?.message ||
            'Failed to update general settings.'
        )
      }
    } finally {
      setSaving(false)
    }
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-1 items-center justify-center">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-500">
          <Loader2
            size={20}
            className="animate-spin"
          />
          Loading general settings...
        </div>
      </div>
    )
  }

  // =========================================================
  // IMAGE HELPER
  // =========================================================

  const currentLogo = logoPreview || logoUrl
  const currentFavicon =
    faviconPreview || faviconUrl
  const currentHeroImage =
    heroPreview || heroImageUrl

  return (
    <div className="flex-1 space-y-6">

      {/* =====================================================
          SUCCESS / ERROR
      ====================================================== */}

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-xs font-semibold text-green-700">
          <CheckCircle size={17} />
          {success}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
          <AlertCircle size={17} />
          {error}
        </div>
      )}

      {/* =====================================================
          BRANDING
      ====================================================== */}

      <div className="space-y-5 border-[#DBDBCF] bg-[#FDFCF0] rounded-3xl p-6 shadow-2xs">

        <h3 className="border-b border-neutral-100 pb-3 text-sm font-bold text-neutral-900">
          Branding
        </h3>

        {/* LOGO */}

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-neutral-700">
            Logo
          </label>

          <div className="flex items-center gap-4">

            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">

              {currentLogo ? (
                <img
                  src={currentLogo}
                  alt="Cafe logo"
                  className="h-full w-full object-contain"
                />
              ) : (
                <ImageIcon
                  size={24}
                  className="text-neutral-400"
                />
              )}

            </div>

            <div className="space-y-1">

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#1f1611] px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-neutral-800">

                <Upload size={14} />

                Upload Logo

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleLogoChange}
                />

              </label>

              <p className="text-[11px] font-medium text-neutral-400">
                Recommended size: 512x512px. Max 5MB.
              </p>

            </div>
          </div>
        </div>

        {/* CAFE NAME + FAVICON */}

        <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-3">

          <div className="space-y-1.5 sm:col-span-2">

            <label className="block text-xs font-semibold text-neutral-700">
              Cafe Name
            </label>

            <input
              type="text"
              name="cafeName"
              value={formData.cafeName}
              onChange={handleChange}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-900 focus:border-neutral-400 focus:outline-hidden"
            />

          </div>

          {/* FAVICON */}

          <div className="space-y-1.5">

            <label className="block text-xs font-semibold text-neutral-700">
              Favicon
            </label>

            <div className="flex items-center gap-2">

              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">

                {currentFavicon ? (
                  <img
                    src={currentFavicon}
                    alt="Favicon"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <ImageIcon
                    size={16}
                    className="text-neutral-400"
                  />
                )}

              </div>

              <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-2xs transition-colors hover:bg-neutral-50">

                <Upload size={13} />

                Upload

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/x-icon"
                  className="hidden"
                  onChange={handleFaviconChange}
                />

              </label>

            </div>

          </div>

        </div>

        {/* SHORT DESCRIPTION */}

        <div className="space-y-1.5">

          <label className="block text-xs font-semibold text-neutral-700">
            Short Description
          </label>

          <textarea
            rows={2}
            name="shortDescription"
            value={formData.shortDescription}
            onChange={handleChange}
            className="w-full resize-none rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-xs font-medium text-neutral-900 focus:border-neutral-400 focus:outline-hidden"
          />

        </div>

      </div>

      {/* =====================================================
          HOMEPAGE
      ====================================================== */}

      <div className="space-y-5 rounded-[24px] border border-neutral-200 bg-white p-6 shadow-2xs">

        <h3 className="border-b border-neutral-100 pb-3 text-sm font-bold text-neutral-900">
          Homepage
        </h3>

        {/* HERO IMAGE */}

        <div className="space-y-1.5">

          <label className="block text-xs font-semibold text-neutral-700">
            Hero Image
          </label>

          <label className="relative flex h-36 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-neutral-300 bg-neutral-100 text-neutral-500 transition-colors hover:bg-neutral-200/50">

            {currentHeroImage ? (
              <>
                <img
                  src={currentHeroImage}
                  alt="Hero"
                  className="absolute inset-0 h-full w-full object-cover"
                />

                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white">
                  <Upload size={20} className="mb-1" />
                  <span className="text-xs font-bold">
                    Click to replace image
                  </span>
                </div>
              </>
            ) : (
              <>
                <Upload
                  size={20}
                  className="mb-1 text-neutral-400"
                />

                <span className="text-xs font-bold text-neutral-700">
                  Click to upload image
                </span>

                <span className="text-[10px] text-neutral-400">
                  Recommended 1200x400px
                </span>
              </>
            )}

            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleHeroImageChange}
            />

          </label>

        </div>

        {/* TITLES */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          <div className="space-y-1.5">

            <label className="block text-xs font-semibold text-neutral-700">
              Hero Title
            </label>

            <input
              type="text"
              name="heroTitle"
              value={formData.heroTitle}
              onChange={handleChange}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-900 focus:border-neutral-400 focus:outline-hidden"
            />

          </div>

          <div className="space-y-1.5">

            <label className="block text-xs font-semibold text-neutral-700">
              Featured Section Title
            </label>

            <input
              type="text"
              name="featuredSectionTitle"
              value={formData.featuredSectionTitle}
              onChange={handleChange}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-900 focus:border-neutral-400 focus:outline-hidden"
            />

          </div>

        </div>

        {/* HERO DESCRIPTION */}

        <div className="space-y-1.5">

          <label className="block text-xs font-semibold text-neutral-700">
            Hero Description
          </label>

          <textarea
            rows={2}
            name="heroDescription"
            value={formData.heroDescription}
            onChange={handleChange}
            className="w-full resize-none rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-xs font-medium text-neutral-900 focus:border-neutral-400 focus:outline-hidden"
          />

        </div>

        {/* WELCOME MESSAGE */}

        <div className="space-y-1.5">

          <label className="block text-xs font-semibold text-neutral-700">
            Welcome Message
          </label>

          <textarea
            rows={2}
            name="welcomeMessage"
            value={formData.welcomeMessage}
            onChange={handleChange}
            className="w-full resize-none rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-xs font-medium text-neutral-900 focus:border-neutral-400 focus:outline-hidden"
          />

        </div>

      </div>

      {/* =====================================================
          CONTACT + REGIONAL
      ====================================================== */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* CONTACT */}

        <div className="space-y-4 rounded-[24px] border border-neutral-200 bg-white p-6 shadow-2xs">

          <h3 className="border-b border-neutral-100 pb-3 text-sm font-bold text-neutral-900">
            Contact Information
          </h3>

          <div className="space-y-1.5">

            <label className="block text-xs font-semibold text-neutral-700">
              Phone
            </label>

            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-900 focus:border-neutral-400 focus:outline-hidden"
            />

          </div>

          <div className="space-y-1.5">

            <label className="block text-xs font-semibold text-neutral-700">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-900 focus:border-neutral-400 focus:outline-hidden"
            />

          </div>

          <div className="space-y-1.5">

            <label className="block text-xs font-semibold text-neutral-700">
              Website
            </label>

            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-900 focus:border-neutral-400 focus:outline-hidden"
            />

          </div>

          <div className="space-y-1.5">

            <label className="block text-xs font-semibold text-neutral-700">
              Address
            </label>

            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-900 focus:border-neutral-400 focus:outline-hidden"
            />

          </div>

        </div>

        {/* REGIONAL */}

        <div className="space-y-4 rounded-[24px] border border-neutral-200 bg-white p-6 shadow-2xs">

          <h3 className="border-b border-neutral-100 pb-3 text-sm font-bold text-neutral-900">
            Regional Settings
          </h3>

          <div className="space-y-1.5">

            <label className="block text-xs font-semibold text-neutral-700">
              Currency
            </label>

            <select
              aria-label="Currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="w-full cursor-pointer rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-900 focus:outline-hidden"
            >
              <option value="USD">
                USD ($)
              </option>

              <option value="KHR">
                KHR (៛)
              </option>

              <option value="EUR">
                EUR (€)
              </option>
            </select>

          </div>

          <div className="space-y-1.5">

            <label className="block text-xs font-semibold text-neutral-700">
              Timezone
            </label>

            <select
              aria-label="Timezone"
              name="timezone"
              value={formData.timezone}
              onChange={handleChange}
              className="w-full cursor-pointer rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-900 focus:outline-hidden"
            >
              <option value="Asia/Phnom_Penh">
                Asia/Phnom_Penh
              </option>

              <option value="America/New_York">
                America/New_York
              </option>

              <option value="Europe/London">
                Europe/London
              </option>
            </select>

          </div>

        </div>

      </div>

      {/* =====================================================
          ACTION BUTTONS
      ====================================================== */}

      <div className="flex items-center justify-end gap-3 pt-2">

        <button
          type="button"
          onClick={handleReset}
          disabled={saving}
          className="flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-xs font-bold text-neutral-700 shadow-2xs transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RotateCcw size={14} />

          Reset
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#1f1611] px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
        >

          {saving ? (
            <>
              <Loader2
                size={15}
                className="animate-spin"
              />

              Saving...
            </>
          ) : (
            <>
              <Save size={15} />

              Save Changes
            </>
          )}

        </button>

      </div>

    </div>
  )
}