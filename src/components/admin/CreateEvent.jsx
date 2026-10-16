import React, { useMemo, useState } from 'react'
import {
  Megaphone,
  X,
  Calendar,
  Clock,
  Store,
  Smartphone,
  Check,
  Info,
  ArrowRight,
  ArrowLeft,
  PartyPopper,
  Upload,
} from 'lucide-react'

const getCurrentTime = () => {
  const now = new Date()

  return `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}`
}

export default function CreateEvent({ initialData = null, onSave, onCancel }) {
  const isEditing = Boolean(initialData)

  const [formData, setFormData] = useState({
    name: initialData?.name || (isEditing ? '' : 'Halloween Coffee Week'),
    description:
      initialData?.description ||
      (isEditing
        ? ''
        : 'Enjoy special discounts on selected drinks during our Halloween event.'),
    rewardCondition: initialData?.rewardCondition || '',
    startDate: initialData?.startDate || '2026-10-25',
    startTime: initialData?.startTime || getCurrentTime(),
    endDate: initialData?.endDate || '2026-10-31',
    endTime: initialData?.endTime || '23:59',
    status: initialData?.status || 'Active',
    targetPOS: true,
    targetOnline: true,
    bannerTag: 'Pumpkin',
    thumbnail: null,
    displayStyle: initialData?.displayStyle || 'IMAGE_OVERLAY', 
  })

  const [thumbnailPreview, setThumbnailPreview] = useState(
  initialData?.thumbnail || ''
)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const durationText = useMemo(() => {
    try {
      const start = new Date(`${formData.startDate}T${formData.startTime}:00`)
      const end = new Date(`${formData.endDate}T${formData.endTime}:00`)
      const diffMs = end - start
      if (isNaN(diffMs) || diffMs <= 0) return 'Duration: 0 hours (Cambodia Time)'

      const totalMins = Math.floor(diffMs / (1000 * 60))
      const days = Math.floor(totalMins / (24 * 60))
      const hours = Math.floor((totalMins % (24 * 60)) / 60)
      const minutes = totalMins % 60

      const parts = []
      if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`)
      if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`)
      parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`)

      return `Duration: ${parts.join(', ')} (Cambodia Time)`
    } catch {
      return 'Duration: 6 days, 17 hours, 59 minutes (Central Standard Time)'
    }
  }, [formData.startDate, formData.startTime, formData.endDate, formData.endTime])

const handleSubmit = (e) => {
  e.preventDefault()

  const statusMapped =
    formData.status === 'Active'
      ? 'ACTIVE'
      : formData.status === 'Upcoming'
        ? 'UPCOMING'
        : 'DISABLED'

  const data = new FormData()

  data.append('name', formData.name)
  data.append('description', formData.description)
  data.append('rewardCondition', formData.rewardCondition)

 data.append('startDate', formData.startDate)
data.append('startTime', formData.startTime)

data.append('endDate', formData.endDate)
data.append('endTime', formData.endTime)

  data.append('status', statusMapped)
  data.append('limited', formData.limited)

  if (formData.thumbnail) {
    data.append('thumbnail', formData.thumbnail)
  }

  onSave(data)
}

  const bannerColorMap = {
    Pumpkin: { color: '#EA580C', selectedBg: 'bg-[#F5E6DC] border-[#E8C2AC]', label: 'Pumpkin' },
    Caramel: { color: '#8C5E48', selectedBg: 'bg-[#EDE7E2] border-[#D4C3B7]', label: 'Caramel' },
    Forest: { color: '#2E7D32', selectedBg: 'bg-[#E3EFE4] border-[#B9DAC0]', label: 'Forest' },
    Espresso: { color: '#2B1A17', selectedBg: 'bg-[#E9E4E2] border-[#C7BBB7]', label: 'Espresso' },
  }

  return (
    <div className="w-full max-w-full mx-auto space-y-4 text-[#2B2422]">
      <div className="flex items-center justify-between pb-1">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 rounded-lg border border-[#DBDBCF] bg-[#FDFCF0] px-3.5 py-1.5 text-xs font-semibold text-[#2B2422] shadow-xs transition hover:bg-[#F4F3ED]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Events</span>
        </button>

        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8C8782]">
          Promotions Hub • {isEditing ? 'Edit Campaign' : 'Create Campaign'}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#DBDBCF] bg-[#FDFCF0] shadow-sm">
        <div className="flex items-start justify-between border-b border-[#DBDBCF] bg-[#FDFCF0] p-4 sm:p-6">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#EADBCE] bg-[#F7EFE9] text-[#7A4B3A]">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-bold text-[#231F20]">
                  {isEditing ? 'Edit Promotional Event' : 'Create New Promotional Event'}
                </h1>
                <span className="rounded bg-[#EBE8DF] px-2 py-0.5 text-[10px] font-bold tracking-wide text-[#716A65] uppercase">
                  STEP 1 OF 2
                </span>
              </div>
              <p className="mt-1 text-xs text-[#716A65]">
                Set up the marketing campaign timeframe and details. You can attach discount coupons immediately after creation.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1.5 text-[#78716C] transition hover:bg-[#EAE8DD] hover:text-[#2B2422]"
            title="Cancel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 p-4 sm:p-6 text-[#2B2422]">
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#2B2422]">
                  EVENT NAME <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-[#8C8782]">Shown in reports & customer slips</span>
              </div>
              <div className="relative">
                <input
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Halloween Coffee Week"
                  className="w-full rounded-xl border border-[#DBDBCF] bg-[#F6F5EE] px-3.5 py-2.5 pr-10 text-xs sm:text-sm text-[#231F20] outline-none transition focus:border-[#2D1F1D] focus:bg-white"
                />
                <PartyPopper className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C8782]" />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#2B2422]">DESCRIPTION</label>
                <span className="text-[11px] text-[#8C8782]">Marketing copy & cashier notes</span>
              </div>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Enjoy special discounts on selected drinks during our Halloween event."
                className="w-full resize-none rounded-xl border border-[#DBDBCF] bg-[#F6F5EE] p-3 text-xs sm:text-sm text-[#231F20] outline-none transition focus:border-[#2D1F1D] focus:bg-white"
              />
            </div>
               <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#2B2422]">
                EVENT THUMBNAIL
              </label>

              <span className="text-[11px] text-[#8C8782]">
                JPG, JPEG, PNG or WEBP
              </span>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-[#DBDBCF] bg-[#F6F5EE] p-3">
              {thumbnailPreview ? (
                <div className="relative">
                  <img
                    src={thumbnailPreview}
                    alt="Event thumbnail preview"
                    className="h-20 w-28 rounded-lg border border-[#DBDBCF] object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setThumbnailPreview('')

                      setFormData((prev) => ({
                        ...prev,
                        thumbnail: null,
                      }))
                    }}
                    className="absolute -right-2 -top-2 rounded-full bg-[#2D1F1D] p-1 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="flex h-20 w-28 items-center justify-center rounded-lg border border-dashed border-[#DBDBCF] bg-[#FDFCF0]">
                  <span className="text-[10px] text-[#8C8782]">
                    No image
                  </span>
                </div>
              )}

              <div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#DBDBCF] bg-white px-3 py-2 text-xs font-semibold text-[#2B2422] transition hover:bg-[#F1F0E4]">
                  <Upload className="h-4 w-4" />

                  {thumbnailPreview ? 'Change Image' : 'Choose Image'}

                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]

                      if (!file) return

                      setFormData((prev) => ({
                        ...prev,
                        thumbnail: file,
                      }))

                      setThumbnailPreview(URL.createObjectURL(file))
                    }}
                  />
                </label>

                <p className="mt-1.5 text-[11px] text-[#8C8782]">
                  This image will be used automatically in the promotion section.
                </p>
              </div>
            </div>
          </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#2B2422]">
                  REWARD CONDITION
                </label>

                <span className="text-[11px] text-[#8C8782]">
                  Define the condition customers must meet
                </span>
              </div>

              <textarea
                name="rewardCondition"
                rows={2}
                value={formData.rewardCondition}
                onChange={handleChange}
                placeholder="Example: Buy 2 coffees and get a discount code"
                className="w-full resize-none rounded-xl border border-[#DBDBCF] bg-[#F6F5EE] p-3 text-xs sm:text-sm text-[#231F20] outline-none transition focus:border-[#2D1F1D] focus:bg-white"
              />

              <p className="mt-1.5 text-[11px] text-[#8C8782]">
                Write your own reward condition for this event.
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#2B2422]">
                CAMPAIGN TIMEFRAME <span className="text-red-500">*</span>
              </label>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <div>
                  <span className="mb-1 block text-[11px] text-[#716A65]">Launch Date & Time</span>
                  <div className="flex items-center rounded-xl border border-[#DBDBCF] bg-[#F6F5EE] px-3 py-2 transition focus-within:border-[#2D1F1D] focus-within:bg-white">
                    <Calendar className="mr-2 h-4 w-4 shrink-0 text-[#78716C]" />
                    <input
                      required
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className="w-full bg-transparent text-xs font-medium text-[#231F20] outline-none"
                    />
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      className="ml-2 bg-transparent text-xs font-medium text-[#716A65] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <span className="mb-1 block text-[11px] text-[#716A65]">Conclusion Date & Time</span>
                  <div className="flex items-center rounded-xl border border-[#DBDBCF] bg-[#F6F5EE] px-3 py-2 transition focus-within:border-[#2D1F1D] focus-within:bg-white">
                    <Calendar className="mr-2 h-4 w-4 shrink-0 text-[#78716C]" />
                    <input
                      required
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className="w-full bg-transparent text-xs font-medium text-[#231F20] outline-none"
                    />
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      className="ml-2 bg-transparent text-xs font-medium text-[#716A65] outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#716A65]">
                <Clock className="h-3.5 w-3.5 text-[#8C8782]" />
                <span>{durationText}</span>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#2B2422]">
                INITIAL STATUS
              </label>

              <div className="flex items-center rounded-xl bg-[#F0EEE6] p-1">
                {[
                  { label: 'Active', dotColor: 'bg-[#2E7D32]' },
                  { label: 'Upcoming', dotColor: 'bg-[#D97706]' },
                  { label: 'Draft / Inactive', dotColor: 'bg-[#9CA3AF]' },
                ].map((st) => (
                  <button
                    key={st.label}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, status: st.label }))}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition ${
                      formData.status === st.label ? 'bg-white text-[#231F20] shadow-xs' : 'text-[#716A65] hover:text-[#231F20]'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${st.dotColor}`} />
                    <span>{st.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#2B2422]">
                  TARGET CHANNELS <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-[#8C8782]">Select checkout venues</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, targetPOS: !prev.targetPOS }))}
                  className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${
                    formData.targetPOS ? 'border-[#2D1F1D] bg-[#F6F5EE]' : 'border-[#DBDBCF] bg-[#FDFCF0] opacity-75'
                  }`}
                >
                  <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${formData.targetPOS ? 'border-[#2D1F1D] bg-[#2D1F1D] text-white' : 'border-[#DBDBCF] bg-white'}`}>
                    {formData.targetPOS && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-[#231F20]">
                      <Store className="h-3.5 w-3.5 text-[#554E4A]" />
                      <span>In-Store Counter / POS</span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-[#716A65]">Physical barista terminal sync</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, targetOnline: !prev.targetOnline }))}
                  className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${
                    formData.targetOnline ? 'border-[#2D1F1D] bg-[#F6F5EE]' : 'border-[#DBDBCF] bg-[#FDFCF0] opacity-75'
                  }`}
                >
                  <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${formData.targetOnline ? 'border-[#2D1F1D] bg-[#2D1F1D] text-white' : 'border-[#DBDBCF] bg-white'}`}>
                    {formData.targetOnline && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-[#231F20]">
                      <Smartphone className="h-3.5 w-3.5 text-[#554E4A]" />
                      <span>Online Website & Mobile E-Order</span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-[#716A65]">Web app & guest checkout basket</p>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#2B2422]">
                  PROMOTIONAL BANNER TAG
                </label>
                <span className="text-[11px] text-[#8C8782]">Visual tag badge for menus</span>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {Object.keys(bannerColorMap).map((colorKey) => {
                  const item = bannerColorMap[colorKey]
                  const isSelected = formData.bannerTag === colorKey

                  return (
                    <button
                      key={colorKey}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, bannerTag: colorKey }))}
                      className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 transition ${
                        isSelected ? item.selectedBg : 'border-[#DBDBCF] bg-[#F1EFE9]/60 hover:bg-[#F1EFE9]'
                      }`}
                    >
                      <div className="flex h-5 w-5 items-center justify-center rounded-full text-white" style={{ backgroundColor: item.color }}>
                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                      <span className="text-xs font-semibold text-[#231F20]">{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#2B2422]">
                  PROMOTION DISPLAY STYLE
                </label>

                <span className="text-[11px] text-[#8C8782]">
                  Choose how the promotion will appear
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { value: 'IMAGE_OVERLAY', label: 'Image Overlay' },
                  { value: 'IMAGE_LEFT', label: 'Image Left' },
                  { value: 'IMAGE_RIGHT', label: 'Image Right' },
                  { value: 'CENTER_CARD', label: 'Center Card' },
                ].map((style) => (
                  <button
                    key={style.value}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        displayStyle: style.value,
                      }))
                    }
                    className={`rounded-xl border p-3 text-xs font-semibold transition ${
                      formData.displayStyle === style.value
                        ? 'border-[#2D1F1D] bg-[#F6F5EE] text-[#231F20]'
                        : 'border-[#DBDBCF] bg-[#FDFCF0] text-[#716A65] hover:bg-[#F1F0E4]'
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl border border-[#E7E5DB] bg-[#F4F2EB] p-3 text-[#2B2422]">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#716A65]" />
              <div className="text-xs leading-relaxed">
                <p className="font-bold text-[#231F20]">Event vs Coupon Relationship</p>
                <p className="mt-0.5 text-[#716A65]">
                  An <strong>Event</strong> defines your overarching marketing campaign calendar and channels. Once created, you can immediately proceed to generate specific <strong>Discount Coupons</strong> and apply them across the POS & app.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[#DBDBCF] bg-[#F4F3ED] px-4 py-3.5 sm:px-6">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-[#DBDBCF] bg-white px-4 py-2 text-xs font-semibold text-[#2B2422] transition hover:bg-[#F1F0E4]"
            >
              Cancel
            </button>

            <span className="text-xs text-[#8C8782] hidden sm:inline">Will auto-open coupon editor</span>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-[#2D1F1D] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-[#1E1413]"
            >
              <span>{isEditing ? 'Save Event Changes' : 'Create Event & Add Coupons'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}