import React, { useState, useRef } from 'react'
import {
  Tag,
  X,
  Calendar,
  Ticket,
  QrCode,
  Sparkles,
  CheckCircle2,
  Check,
  Percent,
  DollarSign,
  ArrowLeft,
  Copy,
  Upload,
  Image as ImageIcon,
  Palette,
  Eye,
  RefreshCw,
  Info,
  Download,
  Share2,
  Layers,
  ShoppingBag,
  Sliders
} from 'lucide-react'
import { createEventCoupon } from '../../services/eventService'
const THEMES = [
  { id: 'espresso', name: 'Espresso Dark', bg: 'bg-[#2D1F1D]', text: 'text-white', accent: 'bg-amber-400', accentText: 'text-[#2D1F1D]', border: 'border-amber-400/30' },
  { id: 'autumn', name: 'Autumn Gold', bg: 'bg-[#7A4B3A]', text: 'text-white', accent: 'bg-[#F4D068]', accentText: 'text-[#2D1F1D]', border: 'border-amber-200/30' },
  { id: 'orange', name: 'Festive Orange', bg: 'bg-[#D9531E]', text: 'text-white', accent: 'bg-white', accentText: 'text-[#D9531E]', border: 'border-white/30' },
  { id: 'forest', name: 'Forest Green', bg: 'bg-[#1E4D3B]', text: 'text-white', accent: 'bg-[#A3E635]', accentText: 'text-[#1E4D3B]', border: 'border-lime-300/30' },
  { id: 'berry', name: 'Berry Red', bg: 'bg-[#8B1E3F]', text: 'text-white', accent: 'bg-[#F4A261]', accentText: 'text-[#2D1F1D]', border: 'border-orange-200/30' },
]


export default function AddCoupon({ eventData = null, onSave, onBack, onCancel }) {
  const eventName = eventData?.name || 'Halloween Coffee Week'
  const eventStatus = eventData?.status || 'Active'
  const eventDuration =
    eventData?.durationText || `${eventData?.startDate || 'Oct 25'} – ${eventData?.endDate || 'Oct 31, 2026'}`

  const [formData, setFormData] = useState({
    couponTitle: eventName ? `${eventName} Promo` : 'Halloween 20% Off',
    promoCode: 'HALLOWEEN20',
    description:
      eventData?.description ||
      'Enjoy 20% off all handcrafted hot and iced beverages.',
    calcType: 'percentage',
    discountValue: '20',
    usageLimit: '100',
    minOrderAmount: '10.00',
    maxDiscountCap: '5.00',
    visualMode: 'generated', // 'generated' | 'custom_image'
    selectedTheme: 'espresso',
    showQrCode: true,
    customImageUrl: '',
    badgeText: 'LIMITED VOUCHER',
  })

  const [copied, setCopied] = useState(false)
  const [savedStatus, setSavedStatus] = useState(null)
  const fileInputRef = useRef(null)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleGenerateCode = () => {
    const cleanPrefix = (eventName || 'PROMO')
      .replace(/[^a-zA-Z]/g, '')
      .slice(0, 6)
      .toUpperCase()
    const randomNum = Math.floor(100 + Math.random() * 900)
    setFormData((prev) => ({ ...prev, promoCode: `${cleanPrefix}${randomNum}` }))
  }

  const handleCopyCode = () => {
    if (!formData.promoCode) return
    navigator.clipboard.writeText(formData.promoCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          customImageUrl: reader.result,
          visualMode: 'custom_image',
        }))
      }
      reader.readAsDataURL(file)
    }
  }

const handleSubmit = async (asDraft = false) => {
  if (!eventData?.id) {
    console.error('Event ID is missing')
    setSavedStatus('Event ID is missing')
    return
  }

  try {
    const couponData = {
      code: formData.promoCode.toUpperCase().trim(),

      discountPercent: Number(formData.discountValue),

      usageLimit: formData.usageLimit
        ? Number(formData.usageLimit)
        : null,

      startDate: eventData.startDate,

      endDate: eventData.endDate,
    }

    console.log('Creating coupon:', {
      eventId: eventData.id,
      couponData,
    })

    const response = await createEventCoupon(
      eventData.id,
      couponData
    )

    console.log('Coupon created:', response)

    setSavedStatus('Coupon Created Successfully!')

    if (onSave) {
      onSave(response.coupon, asDraft)
    }

    setTimeout(() => {
      setSavedStatus(null)
    }, 3500)

  } catch (error) {
    console.error('Create coupon failed:', error)

    console.error('Backend response:', error.response?.data)

    const message =
      error.response?.data?.message ||
      'Failed to create coupon.'

    setSavedStatus(message)
  }
}

  const activeTheme = THEMES.find((t) => t.id === formData.selectedTheme) || THEMES[0]

  return (
    <div className="w-full min-h-screen bg-[#F7F6EE] p-3 sm:p-6 text-[#2B2422] font-sans">
      <div className="w-full max-w-7xl mx-auto space-y-4">
        
        {/* Navigation & Header Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
          <button
            type="button"
            onClick={onBack || (() => {})}
            className="inline-flex items-center gap-2 rounded-lg border border-[#DBDBCF] bg-[#FDFCF0] px-3.5 py-1.5 text-xs font-semibold text-[#2B2422] shadow-xs transition hover:bg-[#F4F3ED]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Event Setup</span>
          </button>

          <div className="flex items-center gap-3">
            {savedStatus && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 animate-fade-in">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                {savedStatus}
              </span>
            )}
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8C8782]">
              Promotions Hub • Step 2 of 2
            </p>
          </div>
        </div>

        {/* Main Card Wrapper */}
        <div className="overflow-hidden rounded-2xl border border-[#DBDBCF] bg-[#FDFCF0] shadow-sm">
          
          {/* Top Banner Context */}
          <div className="border-b border-[#DBDBCF] bg-[#FDFCF0] p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#EADBCE] bg-[#F7EFE9] text-[#7A4B3A]">
                  <Tag className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-base sm:text-xl font-bold text-[#231F20]">Add Discount Coupon & Voucher</h1>
                  <p className="mt-0.5 text-xs text-[#716A65]">
                    Configure redemption rules and customize your live promo voucher layout.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onCancel || (() => {})}
                className="rounded-lg p-1.5 text-[#78716C] transition hover:bg-[#EAE8DD] hover:text-[#2B2422]"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Campaign Summary Bar */}
            <div className="mt-4 rounded-xl border border-[#DBDBCF] bg-[#F7F6EE] p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="rounded bg-[#231F20] px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
                    EVENT
                  </span>
                  <span className="font-bold text-xs sm:text-sm text-[#231F20]">{eventName}</span>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#CFE8D4] bg-[#EBF7EE] px-2.5 py-0.5 text-xs font-semibold text-[#246A36]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2E7D32]" />
                  {eventStatus}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between text-xs text-[#716A65]">
                <div className="flex items-center gap-1.5 font-medium text-[#231F20]">
                  <Calendar className="h-3.5 w-3.5 text-[#78716C]" />
                  <span>{eventDuration}</span>
                </div>
                <span className="text-[11px] text-[#8C8782]">Inherits campaign schedule</span>
              </div>
            </div>
          </div>

          {/* Workflow Stepper */}
          <div className="flex flex-wrap items-center justify-center gap-2 border-b border-[#DBDBCF] bg-[#F5F4EE] px-4 py-2.5 text-xs font-medium text-[#716A65]">
            <span className="flex items-center gap-1.5 opacity-70">
              <Calendar className="h-3.5 w-3.5" />
              <span>Campaign</span>
            </span>
            <span className="text-[#8C8782]">→</span>
            <span className="flex items-center gap-1.5 font-bold text-[#231F20] underline decoration-2 underline-offset-4">
              <Ticket className="h-3.5 w-3.5" />
              <span>Coupon Rules</span>
            </span>
            <span className="text-[#8C8782]">→</span>
            <span className="flex items-center gap-1.5 opacity-70">
              <QrCode className="h-3.5 w-3.5" />
              <span>Voucher UI Generator</span>
            </span>
          </div>

          {/* Studio Workspace: Form Left, Preview Right */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 p-4 sm:p-6 text-[#2B2422]">
            
            {/* Left Column: Form & Settings */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Section 1: Coupon Details & Code Generation */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between border-b border-[#DBDBCF]/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="h-3.5 w-1 rounded-full bg-[#2D1F1D]" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#2B2422]">1. COUPON DETAILS & PROMO CODE</h2>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Valid info</span>
                  </span>
                </div>

                {/* Title */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-[11px] font-bold text-[#2B2422]">
                      Coupon Title <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-[#8C8782]">Visible on web & receipt</span>
                  </div>
                  <input
                    required
                    type="text"
                    name="couponTitle"
                    value={formData.couponTitle}
                    onChange={handleChange}
                    placeholder="e.g. Halloween 20% Off"
                    className="w-full rounded-xl border border-[#DBDBCF] bg-[#F6F5EE] px-3.5 py-2.5 text-xs sm:text-sm text-[#231F20] outline-none transition focus:border-[#2D1F1D] focus:bg-white"
                  />
                </div>

                {/* Code Field with Direct Input & Auto Generate */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-[11px] font-bold text-[#2B2422]">
                      Customer Promo Code <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-[#8C8782]">Direct input or Auto-generate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        required
                        type="text"
                        name="promoCode"
                        value={formData.promoCode}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            promoCode: e.target.value.toUpperCase(),
                          }))
                        }
                        placeholder="HALLOWEEN20"
                        className="w-full rounded-xl border border-[#DBDBCF] bg-[#F6F5EE] px-3.5 py-2.5 pr-10 font-mono text-sm sm:text-base font-bold tracking-wider text-[#231F20] outline-none transition focus:border-[#2D1F1D] focus:bg-white"
                      />
                      <CheckCircle2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600" />
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateCode}
                      className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#D5C7BB] bg-[#EFE7DE] px-4 text-xs font-semibold text-[#2B2422] shadow-xs transition hover:bg-[#E2D9CF] shrink-0"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-[#7A4B3A]" />
                      <span>Auto Code</span>
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold text-[#2B2422]">Customer Description</label>
                  <textarea
                    name="description"
                    rows={2}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enjoy 20% off all handcrafted hot and iced beverages."
                    className="w-full resize-none rounded-xl border border-[#DBDBCF] bg-[#F6F5EE] p-3 text-xs sm:text-sm text-[#231F20] outline-none transition focus:border-[#2D1F1D] focus:bg-white"
                  />
                </div>
              </div>

              {/* Section 2: Discount Calculation Rules */}
              <div className="space-y-3.5">
                <div className="flex items-center gap-2 border-b border-[#DBDBCF]/60 pb-2">
                  <span className="h-3.5 w-1 rounded-full bg-[#2D1F1D]" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#2B2422]">2. DISCOUNT RULES & LIMITS</h2>
                </div>

                {/* Calc Type Switcher */}
                <div>
                  <label className="mb-1.5 block text-[16px] font-bold text-[#2B2422]">Calculation Type</label>
                  <div className="flex items-center rounded-xl bg-[#F0EEE6] p-1">
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, calcType: 'percentage' }))}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
                        formData.calcType === 'percentage' ? 'bg-[#2D1F1D] text-white shadow-xs' : 'text-[#716A65] hover:text-[#231F20]'
                      }`}
                    >
                      <Percent className="h-3.5 w-3.5" />
                      <span>Percentage (%)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, calcType: 'fixed' }))}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
                        formData.calcType === 'fixed' ? 'bg-[#2D1F1D] text-white shadow-xs' : 'text-[#716A65] hover:text-[#231F20]'
                      }`}
                    >
                      <DollarSign className="h-3.5 w-3.5" />
                      <span>Fixed Amount ($)</span>
                    </button>
                  </div>
                </div>

                {/* Discount Value */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-[16px] font-bold text-[#2B2422]">
                      Discount Value <span className="text-red-500">*</span>
                    </label>
                  
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="relative">
                    <input
                      required
                      type="number"
                      step="any"
                      name="discountValue"
                      value={formData.discountValue}
                      onChange={handleChange}
                      placeholder="20"
                      className="w-full rounded-xl border border-[#DBDBCF] bg-[#F6F5EE] px-4 py-2.5 text-base font-bold text-[#231F20] outline-none transition focus:border-[#2D1F1D] focus:bg-white pr-10"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#78716C]">
                      {formData.calcType === 'percentage' ? '%' : '$'}
                    </span>
                  </div>
                    <div>
                    <label className="block text-[16px] font-bold text-[#2B2422]">Total Uses Limit</label>
                    <input
                      type="number"
                      name="usageLimit"
                      value={formData.usageLimit}
                      onChange={handleChange}
                      placeholder="100"
                      className="w-full rounded-xl border border-[#DBDBCF] bg-[#F6F5EE] py-2.5 px-3 text-xs font-semibold text-[#231F20] outline-none transition focus:border-[#2D1F1D] focus:bg-white"
                    />
                  </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Voucher UI Generator & Custom Image Options */}
              <div className="space-y-3.5">
                <div className="flex items-center gap-2 border-b border-[#DBDBCF]/60 pb-2">
                  <span className="h-3.5 w-1 rounded-full bg-[#2D1F1D]" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#2B2422]">3. VOUCHER VISUAL & GENERATOR MODE</h2>
                </div>

                {/* Mode Selector */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, visualMode: 'generated' }))}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition ${
                      formData.visualMode === 'generated'
                        ? 'border-[#2D1F1D] bg-[#2D1F1D] text-white shadow-xs'
                        : 'border-[#DBDBCF] bg-[#F6F5EE] text-[#716A65] hover:bg-white'
                    }`}
                  >
                    <Sliders className="h-4 w-4" />
                    <span>Auto-Generated UI</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, visualMode: 'custom_image' }))}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition ${
                      formData.visualMode === 'custom_image'
                        ? 'border-[#2D1F1D] bg-[#2D1F1D] text-white shadow-xs'
                        : 'border-[#DBDBCF] bg-[#F6F5EE] text-[#716A65] hover:bg-white'
                    }`}
                  >
                    <ImageIcon className="h-4 w-4" />
                    <span>Custom Image / Banner</span>
                  </button>
                </div>

                {/* Settings for Auto-Generated UI */}
                {formData.visualMode === 'generated' && (
                  <div className="space-y-3 rounded-xl border border-[#DBDBCF] bg-[#F7F6EE] p-3.5">
                    <div>
                      <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold text-[#2B2422]">
                        <Palette className="h-3.5 w-3.5 text-[#7A4B3A]" />
                        <span>Theme Palette</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {THEMES.map((theme) => (
                          <button
                            key={theme.id}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, selectedTheme: theme.id }))}
                            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition border ${
                              formData.selectedTheme === theme.id
                                ? 'ring-2 ring-[#2D1F1D] ring-offset-1 border-transparent'
                                : 'border-[#DBDBCF] bg-white text-[#2B2422]'
                            }`}
                          >
                            <span className={`h-3 w-3 rounded-full ${theme.bg}`} />
                            <span>{theme.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="mb-1 block text-[11px] font-bold text-[#2B2422]">Badge Label</label>
                        <input
                          type="text"
                          name="badgeText"
                          value={formData.badgeText}
                          onChange={handleChange}
                          placeholder="LIMITED VOUCHER"
                          className="w-full rounded-lg border border-[#DBDBCF] bg-white px-3 py-1.5 text-xs text-[#231F20] outline-none"
                        />
                      </div>

                      <div className="flex items-end pb-1">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#231F20]">
                          <input
                            type="checkbox"
                            name="showQrCode"
                            checked={formData.showQrCode}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-[#DBDBCF] text-[#2D1F1D] focus:ring-[#2D1F1D]"
                          />
                          <span>Show QR Code Simulation</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Settings for Custom Image Upload */}
                {formData.visualMode === 'custom_image' && (
                  <div className="space-y-3 rounded-xl border border-[#DBDBCF] bg-[#F7F6EE] p-3.5">
                    <div>
                      <label className="mb-1 block text-[11px] font-bold text-[#2B2422]">Direct Image URL</label>
                      <input
                        type="url"
                        name="customImageUrl"
                        value={formData.customImageUrl}
                        onChange={handleChange}
                        placeholder="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600"
                        className="w-full rounded-xl border border-[#DBDBCF] bg-white px-3 py-2 text-xs text-[#231F20] outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#8C8782] font-semibold">OR Upload File:</span>
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5C7BB] bg-white px-3 py-1.5 text-xs font-semibold text-[#2B2422] shadow-xs hover:bg-[#F0EEE6]"
                      >
                        <Upload className="h-3.5 w-3.5 text-[#7A4B3A]" />
                        <span>Browse File</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
                      {/* Right Column: Dynamic Live Preview Canvas */}
            <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-[#DBDBCF] bg-[#F5F4EE] p-4 sm:p-5">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#DBDBCF]/70 mb-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#231F20] uppercase tracking-wider">
                    <Eye className="h-4 w-4 text-[#7A4B3A]" />
                    <span>Live Voucher Preview</span>
                  </div>
                  <span className="text-[10px] bg-[#EAE8DD] text-[#716A65] font-semibold px-2.5 py-0.5 rounded-full">
                    {formData.visualMode === 'generated' ? 'Auto UI' : 'Custom Banner'}
                  </span>
                </div>

                {/* AUTO-GENERATED CARD RENDER */}
                {formData.visualMode === 'generated' ? (
                  <div className={`relative overflow-hidden rounded-2xl ${activeTheme.bg} ${activeTheme.text} shadow-md transition-all border ${activeTheme.border}`}>
                    
                    {/* Ticket Cuts */}
                    <div className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-[#F5F4EE] border-r border-black/10 z-10" />
                    <div className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-[#F5F4EE] border-l border-black/10 z-10" />

                    <div className="p-5 space-y-4">
                      {/* Ticket Header */}
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                          <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${activeTheme.accent} ${activeTheme.accentText} font-bold text-xs`}>
                            <Ticket className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="block text-[9px] uppercase tracking-widest opacity-75">
                              {formData.badgeText || 'SPECIAL OFFER'}
                            </span>
                            <span className="text-xs font-bold">{eventName}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono opacity-80">{eventDuration}</span>
                      </div>

                      {/* Title & Big Offer */}
                      <div className="flex items-baseline justify-between gap-2 pt-1">
                        <div>
                          <h3 className="text-lg font-extrabold leading-tight">
                            {formData.couponTitle || 'Coupon Title'}
                          </h3>
                          <p className="text-xs opacity-80 line-clamp-2 mt-1">
                            {formData.description || 'Enjoy instant discount at checkout.'}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`text-2xl sm:text-3xl font-black ${activeTheme.accentText === 'text-white' ? 'text-white' : 'text-amber-300'}`}>
                            {formData.calcType === 'percentage'
                              ? `${formData.discountValue || '0'}%`
                              : `$${formData.discountValue || '0'}`}
                          </span>
                          <span className="block text-[9px] uppercase font-bold tracking-widest opacity-80">
                            DISCOUNT
                          </span>
                        </div>
                      </div>

                      {/* Promo Code Strip & Action */}
                      <div className="mt-2 flex items-center justify-between gap-3 rounded-xl bg-white/10 p-3 backdrop-blur-xs border border-white/15">
                        <div className="space-y-0.5">
                          <span className="text-[9px] uppercase font-bold tracking-wider opacity-75">
                            PROMO CODE
                          </span>
                          <div className="font-mono text-sm sm:text-base font-black tracking-wider">
                            {formData.promoCode || 'YOURCODE'}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleCopyCode}
                            className={`flex h-8 items-center gap-1 rounded-lg ${activeTheme.accent} ${activeTheme.accentText} px-2.5 text-xs font-bold transition hover:opacity-90`}
                          >
                            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            <span>{copied ? 'Copied' : 'Copy'}</span>
                          </button>

                          {formData.showQrCode && (
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white p-1 text-black">
                              <QrCode className="h-full w-full" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Terms Footer */}
                      <div className="pt-2 flex items-center justify-between text-[10px] opacity-70 border-t border-dashed border-white/20">
                        <span>Min spend: ${formData.minOrderAmount || '0.00'}</span>
                        <span>Limit: {formData.usageLimit || '∞'} uses</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* CUSTOM IMAGE VOUCHER RENDER */
                  <div className="relative overflow-hidden rounded-2xl border border-[#DBDBCF] bg-white shadow-md">
                    {formData.customImageUrl ? (
                      <div className="relative">
                        <img
                          src={formData.customImageUrl}
                          alt="Custom Voucher Banner"
                          className="w-full h-48 sm:h-56 object-cover"
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 text-white">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[10px] font-mono bg-amber-400 text-black font-bold px-2 py-0.5 rounded">
                                {formData.promoCode}
                              </span>
                              <h4 className="text-sm font-bold mt-1">{formData.couponTitle}</h4>
                            </div>
                            <button
                              type="button"
                              onClick={handleCopyCode}
                              className="rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-xs p-2 text-white"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-48 sm:h-56 p-6 text-center bg-[#F9F8F3]">
                        <ImageIcon className="h-10 w-10 text-[#78716C] mb-2" />
                        <p className="text-xs font-semibold text-[#231F20]">No Custom Image Loaded</p>
                        <p className="text-[11px] text-[#8C8782] mt-1">
                          Paste a image URL above or upload a flyer banner.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Informational Footer Note */}
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#EAE8DD] p-3 text-xs text-[#716A65]">
                <Info className="h-4 w-4 shrink-0 text-[#7A4B3A] mt-0.5" />
                <span>
                  This generated voucher layout will automatically synchronize across your POS kiosk, mobile app, and printed receipts.
                </span>
              </div>
            </div>

          {/* Footer Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#DBDBCF] bg-[#F4F3ED] px-4 py-3.5 sm:px-6">
            <button
              type="button"
              onClick={onCancel || (() => {})}
              className="rounded-lg border border-[#DBDBCF] bg-white px-4 py-2 text-xs font-semibold text-[#2B2422] transition hover:bg-[#F1F0E4]"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                className="rounded-lg border border-[#D5C7BB] bg-[#EFE7DE] px-4 py-2 text-xs font-semibold text-[#2B2422] transition hover:bg-[#E2D9CF]"
              >
                Save as Draft
              </button>

              <button
                type="button"
                onClick={() => handleSubmit(false)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#2D1F1D] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-[#1E1413]"
              >
                <Check className="h-4 w-4 stroke-[2.5]" />
                <span>Create Coupon & Voucher</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}