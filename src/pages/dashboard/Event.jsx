import React, { useEffect, useMemo, useState } from 'react'
import {
  Upload,
  Plus,
  Zap,
  Clock,
  Ticket,
  Store,
  ArrowUp,
  TrendingUp,
  Search,
  Calendar,
  ChevronDown,
  SlidersHorizontal,
  ChevronsUpDown,
  Globe,
  ShoppingBag,
  Eye,
  Pencil,
  Trash2,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  X,
  Copy,
  Check,
  Moon,
  Coffee,
} from 'lucide-react'
import CreateEvent from '../../components/admin/CreateEvent'
import AddCoupon from '../../components/admin/AddCoupon'
import {getEvents,getActiveEvents,getEventById,createEvent,updateEvent,deleteEvent} from '../../services/eventService'

const mapEvent = (event) => {
  const coupon = event.coupon || event.coupons?.[0] || null

  const startDate = event.start_date || event.startDate || ''
  const endDate = event.end_date || event.endDate || ''

  let status = event.status || 'UPCOMING'

  status =
    status.charAt(0).toUpperCase() +
    status.slice(1).toLowerCase()

  const discountPercent =
    coupon?.discountPercent ??
    coupon?.discount_percent ??
    ''

  return {
    ...event,

    id: event.id,

    name: event.name || event.title || 'Untitled Event',

    description: event.description || '',

    thumbnail:
      event.thumbnail ||
      event.image ||
      event.image_url ||
      null,

    startDate,

    endDate,

    durationText:
      startDate && endDate
        ? `${startDate} – ${endDate}`
        : '',

    durationSubtext:
      event.duration_subtext ||
      event.durationSubtext ||
      '',

    status,

    couponCode:
      coupon?.code ||
      event.coupon_code ||
      event.couponCode ||
      '',

    discountValue:
      discountPercent !== ''
        ? `${discountPercent}%`
        : '',

    discountType:
      discountPercent !== ''
        ? 'OFF'
        : '',

    claimed:
      coupon?.usedCount ??
      coupon?.used_count ??
      coupon?.claimed ??
      event.claimed ??
      0,

    limit:
      coupon?.usageLimit ??
      coupon?.usage_limit ??
      coupon?.limit ??
      event.limit ??
      0,

    channels:
      event.channels ||
      [],

    coupon,
  }
}

export default function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [channelFilter, setChannelFilter] = useState('All Channels')
  const [showChannelDropdown, setShowChannelDropdown] = useState(false)
  const [showDateDropdown, setShowDateDropdown] = useState(false)
  const [dateRangeLabel, setDateRangeLabel] = useState('Oct 1, 2026 - Nov 30, 2026')
  const [sortAsc, setSortAsc] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [copiedCode, setCopiedCode] = useState(false)
  const [openDropdownId, setOpenDropdownId] = useState(null)

  // Navigation and wizard steps: 'dashboard' | 'create_step_1' | 'create_step_2'
  const [viewStep, setViewStep] = useState('dashboard')
  const [pendingEventData, setPendingEventData] = useState(null)
  const [editingEvent, setEditingEvent] = useState(null)
  const [deletingEvent, setDeletingEvent] = useState(null)
  const [toastMessage, setToastMessage] = useState('')

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  const loadEvents = async () => {
  try {
    setLoading(true)

    const response = await getEvents()

    console.log('Events API response:', response)

    const data = Array.isArray(response) ? response : []

    setEvents(data.map(mapEvent))
  } catch (error) {
    console.error('Failed to load events:', error)
    showToast('Failed to load events.')
  } finally {
    setLoading(false)
  }
}

  useEffect(() => {
  loadEvents()
}, [])

  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null)
    if (openDropdownId) {
      window.addEventListener('click', handleClickOutside)
      return () => window.removeEventListener('click', handleClickOutside)
    }
  }, [openDropdownId])

  const showToast = (message) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(''), 3000)
  }

  const handleCopyCode = (code) => {
    navigator.clipboard?.writeText(code)
    setCopiedCode(true)
    showToast(`Coupon code ${code} copied to clipboard!`)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const handleExportReport = () => {
    showToast('Promotions & discounts report exported successfully.')
  }

  const handleDeleteEvent = async(id) => {
    try{
      await deleteEvent(id)
      setEvents((prev) => prev.filter((e) => e.id !== id))
      
      showToast('Event delete successfully.')

    }catch(error){
      console.error('Delete event error:', error)
      showToast('Failed to delete event.')
    }
  }

  // Count metrics dynamically
  const activeCount = events.filter((e) => e.status === 'Active').length
  const upcomingCount = events.filter((e) => e.status === 'Upcoming').length
  const expiredCount = events.filter((e) => e.status === 'Expired').length
  const disabledCount = events.filter((e) => e.status === 'Disabled').length
  const totalCount = events.length

  const getStatusBadge = (status) => {
    const styles = {
      Active: { wrapper: 'bg-[#EBF7EE] text-[#246A36] border-[#CFE8D4]', dot: 'bg-[#2E7D32]' },
      Upcoming: { wrapper: 'bg-[#FEF3E2] text-[#B45309] border-[#FBE0B8]', dot: 'bg-[#D97706]' },
      Expired: { wrapper: 'bg-[#F1F0EC] text-[#71717A] border-[#E0DED7]', dot: 'bg-[#9CA3AF]' },
      Disabled: { wrapper: 'bg-[#FDECEC] text-[#DC2626] border-[#F8B4B4]', dot: 'bg-[#DC2626]' },
    }
    const style = styles[status] || styles.Expired

    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${style.wrapper}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
        {status}
      </span>
    )
  }

  const filteredEvents = useMemo(() => {
    let result = events.filter((event) => {
      if (activeTab !== 'All' && event.status !== activeTab) return false
      if (channelFilter !== 'All Channels') {
        const hasChannel = event.channels?.some((c) =>
          c.label.toLowerCase().includes(channelFilter.toLowerCase())
        )
        if (!hasChannel) return false
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesName = event.name.toLowerCase().includes(query)
        const matchesDescription = event.description.toLowerCase().includes(query)
        const matchesCoupon = event.couponCode?.toLowerCase().includes(query)
        if (!matchesName && !matchesDescription && !matchesCoupon) return false
      }
      return true
    })

    if (sortAsc) {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name))
    }
    return result
  }, [events, activeTab, channelFilter, searchQuery, sortAsc])

  // Pagination calculations
  const totalPages = Math.ceil(filteredEvents.length / rowsPerPage) || 1

  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage
    return filteredEvents.slice(startIndex, startIndex + rowsPerPage)
  }, [filteredEvents, currentPage, rowsPerPage])

  const startIndex = filteredEvents.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1
  const endIndex = Math.min(currentPage * rowsPerPage, filteredEvents.length)

  // Step 1 Save Handler
const handleStep1Next = async (step1Data) => {
  // =========================
  // EDIT EXISTING EVENT
  // =========================
  if (editingEvent) {
    try {
      const response = await updateEvent(
        editingEvent.id,
        step1Data
      )

      console.log('Update event response:', response)

      const updatedEvent =
        response?.event ||
        response?.data?.event ||
        response?.data ||
        null

      if (updatedEvent) {
        setEvents((prev) =>
          prev.map((event) =>
            event.id === editingEvent.id
              ? mapEvent(updatedEvent)
              : event
          )
        )
      } else {
        await loadEvents()
      }

      showToast('Event updated successfully.')
      resetFlow()
    } catch (error) {
      console.error('Update event error:', error)

      const message =
        error.response?.data?.message ||
        'Failed to update event.'

      showToast(message)
    }

    return
  }

  // =========================
  // CREATE NEW EVENT
  // =========================
  try {
    console.log('Creating event:', step1Data)

    const response = await createEvent(step1Data)

    console.log('Create event response:', response)

    const createdEvent =
      response?.event ||
      response?.data?.event ||
      null

    if (!createdEvent?.id) {
      console.error('Invalid create event response:', response)
      throw new Error(
        'Event was created but no event ID was returned.'
      )
    }

    console.log('Created event:', createdEvent)

    // Save the created event so Step 2 knows its ID
    setPendingEventData(createdEvent)

    // Go to coupon page
    setViewStep('create_step_2')

  } catch (error) {
    console.error('Create event error:', error)

    const message =
      error.response?.data?.message ||
      'Failed to create event.'

    showToast(message)
  }
}

  // Step 2 Save Handler (Final Save)
const handleStep2Save = (coupon, asDraft = false) => {
  try {
    if (!pendingEventData?.id) {
      throw new Error(
        'Event ID is missing. Please go back and create the event again.'
      )
    }

    console.log('Coupon received from AddCoupon:', coupon)

    // Update local event with the new coupon
    if (coupon) {
      const updatedEvent = {
        ...pendingEventData,
        coupon,
      }

      setEvents((prev) => [
        mapEvent(updatedEvent),
        ...prev,
      ])
    } else {
      // If coupon data is not returned, reload from backend
      loadEvents()
    }

    showToast(
      asDraft
        ? 'Coupon saved as draft successfully.'
        : 'Event and coupon created successfully.'
    )

    resetFlow()

  } catch (error) {
    console.error('Create coupon error:', error)

    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to create coupon.'

    showToast(message)
  }
}

  const resetFlow = () => {
    setViewStep('dashboard')
    setPendingEventData(null)
    setEditingEvent(null)
  }

  const handleOpenCreate = () => {
    setEditingEvent(null)
    setPendingEventData(null)
    setViewStep('create_step_1')
  }

  const handleOpenEdit = (event) => {
    setEditingEvent(event)
    setViewStep('create_step_1')
  }

  // RENDER STEP 1
  if (viewStep === 'create_step_1') {
    return (
      <CreateEvent
        initialData={editingEvent}
        onSave={handleStep1Next}
        onCancel={resetFlow}
      />
    )
  }

  // RENDER STEP 2
  if (viewStep === 'create_step_2') {
    return (
      <AddCoupon
        eventData={pendingEventData}
        onSave={handleStep2Save}
        onBack={() => setViewStep('create_step_1')}
        onCancel={resetFlow}
      />
    )
  }

  return (
    <div className="w-full flex flex-col gap-3 text-[#2B2422] overflow-x-hidden">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-100 flex items-center gap-2 rounded-lg bg-[#2D1F1D] px-4 py-2.5 text-xs font-medium text-white shadow-xl animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#DBDBCF] bg-[#FDFCF0] shadow-2xl animate-in zoom-in-95">
            <div className="p-5 space-y-3.5">
              <div className="flex items-start gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#231F20]">
                    Delete Promotional Event?
                  </h3>
                  <p className="mt-1 text-xs text-[#716A65] leading-relaxed">
                    Are you sure you want to delete <strong className="text-[#231F20]">"{deletingEvent.name}"</strong>? This will permanently remove the campaign and all associated checkout coupons.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-2.5 text-[11px] text-rose-800">
                ⚠️ <strong>Notice:</strong> POS barista terminals and customer app stores will immediately stop offering this promotion.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[#DBDBCF] bg-[#F4F3ED] px-5 py-3">
              <button
                type="button"
                onClick={() => setDeletingEvent(null)}
                className="rounded-lg border border-[#DBDBCF] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#554E4A] hover:bg-[#F1F0E4] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = deletingEvent.id
                  setDeletingEvent(null)
                  handleDeleteEvent(id)
                }}
                className="rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 shadow-xs transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#DBDBCF] bg-[#FDFCF0] shadow-2xl animate-in zoom-in-95">
            <div className="relative border-b border-[#DBDBCF] bg-[#F4F3ED] p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#78716C]">
                  Campaign Preview
                </span>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="rounded-lg p-1 text-[#78716C] hover:bg-[#EAE8DD] hover:text-[#2B2422]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <h2 className="mt-1.5 text-lg font-bold text-[#231F20]">
                {selectedEvent.name}
              </h2>
              <div className="mt-1 flex items-center gap-2">
                {getStatusBadge(selectedEvent.status)}
                <span className="text-xs text-[#78716C]">• {selectedEvent.durationText}</span>
              </div>
            </div>

            <div className="space-y-3 p-4">
              {selectedEvent.thumbnail && (
                <div className="h-32 w-full overflow-hidden rounded-xl border border-[#DBDBCF]">
                  <img
                    src={selectedEvent.thumbnail}
                    alt={selectedEvent.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <p className="text-xs text-[#554E4A] leading-relaxed">
                {selectedEvent.description}
              </p>

              {/* COUPON & DISCOUNT BOX */}
              <div className="flex items-center justify-between rounded-xl border border-[#DBDBCF] bg-[#F1F0E7]/70 p-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold tracking-wider rounded bg-white px-2 py-0.5 border border-[#DBDBCF]">
                    {selectedEvent.couponCode}
                  </span>
                  <span className="text-xs font-bold text-[#231F20]">
                    {selectedEvent.discountValue} {selectedEvent.discountType}
                  </span>
                </div>
                <button
                  onClick={() => handleCopyCode(selectedEvent.couponCode)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-[#DBDBCF] px-2 py-1 text-xs font-semibold text-[#2B2422] hover:bg-[#EFEEE3] transition"
                >
                  {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedCode ? 'Copied' : 'Copy'}
                </button>
              </div>

              {/* USAGE STATS */}
              <div className="space-y-1.5 rounded-xl border border-[#DBDBCF] bg-white p-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#78716C]">
                    Claimed:{' '}
                    <strong className="text-[#231F20]">
                      {selectedEvent.claimed} / {selectedEvent.limit}
                    </strong>
                  </span>
                  <span className="font-bold text-[#231F20]">
                    {Math.round(((selectedEvent.claimed / (selectedEvent.limit || 1)) * 100) * 10) / 10}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E5E3D8]">
                  <div
                    className="h-full rounded-full bg-[#2D1F1D]"
                    style={{
                      width: `${Math.min(
                        ((selectedEvent.claimed / (selectedEvent.limit || 1)) * 100),
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[#DBDBCF] bg-[#F4F3ED] px-4 py-2.5">
              <button
                onClick={() => setSelectedEvent(null)}
                className="rounded-lg border border-[#DBDBCF] bg-white px-3 py-1.5 text-xs font-semibold text-[#554E4A] hover:bg-[#F1F0E4]"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const ev = selectedEvent
                  setSelectedEvent(null)
                  handleOpenEdit(ev)
                }}
                className="rounded-lg bg-[#2D1F1D] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1E1413]"
              >
                Edit Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <section className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8C8782]">
            PROMOTIONS HUB • Q4 Fall Campaigns
          </p>
          <h1 className="font-heading text-xl font-bold tracking-tight text-[#231F20] sm:text-2xl">
            Events & Discounts
          </h1>
          <p className="text-xs text-[#6F6864]">
            Manage marketing promotional events and attached discount coupons for POS & Online stores.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportReport}
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-[#DBDBCF] bg-[#FDFCF0] px-3 text-xs font-semibold text-[#2B2422] shadow-xs transition hover:bg-[#F4F3ED]"
          >
            <Upload className="h-3.5 w-3.5 text-[#554E4A]" />
            Export Report
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-[#2D1F1D] px-3 text-xs font-semibold text-white shadow-xs transition hover:bg-[#1E1413]"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Event
          </button>
        </div>
      </section>

      {/* 4 KPI METRIC CARDS */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 shrink-0">
        <div className="flex flex-col justify-between rounded-xl border border-[#DBDBCF] bg-[#FDFCF0] p-3 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#78716C]">
              ACTIVE EVENTS
            </p>
            <div className="rounded-md bg-[#EAF5EC] p-1 text-[#2E7D32]">
              <Zap className="h-3 w-3" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#231F20]">{activeCount}</span>
            <span className="inline-flex items-center gap-0.5 rounded-full border border-[#D1EED6] bg-[#EBF7EE] px-1.5 py-0.2 text-[10px] font-semibold text-[#2E7D32]">
              <ArrowUp className="h-2.5 w-2.5 stroke-[2.5]" />
              +1 this month
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-[#78716C]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2E7D32]" />
            <span>Generating store traffic today</span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-[#DBDBCF] bg-[#FDFCF0] p-3 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#78716C]">
              UPCOMING EVENTS
            </p>
            <div className="rounded-md bg-[#FEF3E2] p-1 text-[#D97706]">
              <Clock className="h-3 w-3" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#231F20]">{upcomingCount}</span>
            <span className="inline-flex items-center rounded-full bg-[#EFECE6] px-2 py-0.2 text-[10px] font-medium text-[#716A65]">
              Scheduled
            </span>
          </div>
          <p className="mt-1 text-[10px] text-[#78716C] truncate">
            Next launch on Nov 5 (Appreciation Day)
          </p>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-[#DBDBCF] bg-[#FDFCF0] p-3 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#78716C]">
              ACTIVE COUPONS
            </p>
            <div className="rounded-md bg-[#FAECE8] p-1 text-[#B25E46]">
              <Ticket className="h-3 w-3" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#231F20]">{events.filter(e => e.couponCode).length}</span>
            <span className="inline-flex items-center rounded-full border border-[#F5D8CE] bg-[#FAECE8] px-2 py-0.2 text-[10px] font-medium text-[#9A4B32]">
              POS & App Synced
            </span>
          </div>
          <p className="mt-1 text-[10px] text-[#78716C] truncate">
            Includes welcome & seasonal perks
          </p>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-[#DBDBCF] bg-[#FDFCF0] p-3 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#78716C]">
              TOTAL REDEMPTIONS
            </p>
            <div className="rounded-md bg-[#ECEFF1] p-1 text-[#455A64]">
              <Store className="h-3 w-3" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#231F20]">
              {events.reduce((sum, item) => sum + (item.claimed || 0), 0)}
            </span>
            <span className="inline-flex items-center gap-0.5 rounded-full border border-[#D1EED6] bg-[#EBF7EE] px-1.5 py-0.2 text-[10px] font-semibold text-[#2E7D32]">
              <TrendingUp className="h-2.5 w-2.5 stroke-[2.5]" />
              +18% vs last mo
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-[#78716C]">
            <span>Redemption rate</span>
            <span className="font-bold text-[#231F20]">31.4% avg</span>
          </div>
        </div>
      </section>

      {/* TABS & FILTERS BAR */}
      <section className="rounded-xl border border-[#DBDBCF] bg-[#FDFCF0] p-2 shadow-xs shrink-0">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-1 flex-wrap">
            {['All', 'Active', 'Upcoming', 'Expired', 'Disabled'].map((tab) => {
              const count = tab === 'All' ? totalCount : events.filter((e) => e.status === tab).length
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab)
                    setCurrentPage(1)
                  }}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    activeTab === tab
                      ? 'border border-[#DBDBCF]/60 bg-white font-bold text-[#231F20] shadow-xs'
                      : 'text-[#78716C] hover:bg-[#F1F0E4]'
                  }`}
                >
                  <span>{tab}</span>
                  <span className="text-[10px] opacity-80">{count}</span>
                </button>
              )
            })}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <div className="relative min-w-40 flex-1 sm:w-52">
              <Search className="absolute left-0.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8C8782]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Search events, coupon codes..."
                className="h-8 w-full rounded-lg border border-[#DBDBCF] bg-[#F1F0E4]/60 pl-8 pr-2.5 text-xs outline-none transition focus:border-[#2D1F1D] focus:bg-white"
              />
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDateDropdown(!showDateDropdown)}
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#DBDBCF] bg-[#F1F0E4]/60 px-2 text-xs font-medium text-[#2B2422] transition hover:bg-[#F1F0E4]"
              >
                <Calendar className="h-3.5 w-3.5 text-[#78716C]" />
                <span className="hidden sm:inline">{dateRangeLabel}</span>
                <span className="sm:hidden">Dates</span>
                <ChevronDown className="h-3 w-3 text-[#78716C]" />
              </button>

              {showDateDropdown && (
                <div className="absolute right-0 top-9 z-20 w-52 rounded-xl border border-[#DBDBCF] bg-[#FDFCF0] p-1 shadow-lg">
                  {[
                    'Oct 1, 2026 - Nov 30, 2026',
                    'This Month (Oct 2026)',
                    'Next Month (Nov 2026)',
                    'All Active Dates',
                  ].map((range) => (
                    <button
                      key={range}
                      onClick={() => {
                        setDateRangeLabel(range)
                        setShowDateDropdown(false)
                      }}
                      className={`w-full rounded-lg px-2.5 py-1 text-left text-xs font-medium transition ${
                        dateRangeLabel === range
                          ? 'bg-[#2D1F1D] text-white font-bold'
                          : 'text-[#2B2422] hover:bg-[#F1F0E4]'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowChannelDropdown(!showChannelDropdown)}
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#DBDBCF] bg-[#F1F0E4]/60 px-2 text-xs font-medium text-[#2B2422] transition hover:bg-[#F1F0E4]"
              >
                <Store className="h-3.5 w-3.5 text-[#78716C]" />
                <span>{channelFilter}</span>
                <ChevronDown className="h-3 w-3 text-[#78716C]" />
              </button>

              {showChannelDropdown && (
                <div className="absolute right-0 top-9 z-20 w-36 rounded-xl border border-[#DBDBCF] bg-[#FDFCF0] p-1 shadow-lg">
                  {['All Channels', 'Online', 'POS', 'In-Store'].map((ch) => (
                    <button
                      key={ch}
                      onClick={() => {
                        setChannelFilter(ch)
                        setShowChannelDropdown(false)
                        setCurrentPage(1)
                      }}
                      className={`w-full rounded-lg px-2.5 py-1 text-left text-xs font-medium transition ${
                        channelFilter === ch
                          ? 'bg-[#2D1F1D] text-white font-bold'
                          : 'text-[#2B2422] hover:bg-[#F1F0E4]'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSortAsc(!sortAsc)}
              title="Toggle alphabetical sorting"
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#DBDBCF] transition ${
                sortAsc ? 'bg-[#2D1F1D] text-white' : 'bg-[#F1F0E4]/60 text-[#78716C] hover:bg-[#F1F0E4] hover:text-[#2B2422]'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* DATA TABLE */}
      <section className="rounded-xl border border-[#DBDBCF] bg-[#FDFCF0] shadow-xs">
        <table className="w-full text-left border-collapse table-fixed">
          <colgroup>
            <col className="w-[30%]" />
            <col className="w-[18%]" />
            <col className="w-[12%]" />
            <col className="w-[18%]" />
            <col className="w-[14%]" />
            <col className="w-[8%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-[#DBDBCF] bg-[#F4F3ED] text-[10px] font-bold uppercase tracking-wider text-[#78716C]">
              <th className="px-3 py-2.5 rounded-tl-xl">
                <button
                  onClick={() => setSortAsc(!sortAsc)}
                  className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider hover:text-[#2B2422]"
                >
                  <span>Campaign & Details</span>
                  <ChevronsUpDown className="h-3 w-3 text-[#8C8782]" />
                </button>
              </th>
              <th className="px-2 py-2.5">Duration</th>
              <th className="px-2 py-2.5">Status</th>
              <th className="px-2 py-2.5">Coupon & Discount</th>
              <th className="px-2 py-2.5">Usage Limit</th>
              <th className="px-3 py-2.5 text-right rounded-tr-xl">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DBDBCF]/60">
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-10 text-center text-xs text-[#78716C]"
                >
                  Loading events...
                </td>
              </tr>
            ) : paginatedEvents.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-xs text-[#78716C]">
                  No events found matching your filter criteria.
                </td>
              </tr>
            ) : (
              paginatedEvents.map((event, idx) => {
                const percentage = Math.round(
                  ((event.claimed / (event.limit || 1)) * 100) * 10
                ) / 10

                return (
                  <tr key={event.id} className="transition hover:bg-[#F7F6EE]/70">
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        {event.iconType === 'moon' ? (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#F8B4B4] bg-[#FDECEC] text-[#DC2626]">
                            <Moon className="h-4 w-4" />
                          </div>
                        ) : event.iconType === 'coffee' ? (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#DBDBCF] bg-[#F5EBE6] text-[#8C5E48]">
                            <Coffee className="h-4 w-4" />
                          </div>
                        ) : event.thumbnail ? (
                          <img
                            src={event.thumbnail}
                            alt={event.name}
                            className="h-9 w-9 shrink-0 rounded-lg border border-[#DBDBCF]/60 object-cover"
                          />
                        ) : (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#DBDBCF] bg-[#F1F0E4] text-[#8C8782]">
                            <Coffee className="h-4 w-4" />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <h3
                            onClick={() => setSelectedEvent(event)}
                            className="cursor-pointer font-bold text-xs text-[#231F20] tracking-tight hover:text-[#3E2723] truncate"
                          >
                            {event.name}
                          </h3>
                          <p className="truncate text-[10px] text-[#78716C]">
                            {event.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-2 py-2.5">
                      <p className="text-xs font-semibold text-[#231F20] truncate">
                        {event.durationText || `${event.startDate} – ${event.endDate}`}
                      </p>
                      <p className="text-[10px] truncate text-[#8C8782]">
                        {event.durationSubtext}
                      </p>
                    </td>

                    <td className="px-2 py-2.5">{getStatusBadge(event.status)}</td>

                    <td className="px-2 py-2.5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded bg-[#EFECE4] px-1.5 py-0.2 font-mono text-[10px] font-bold tracking-wider text-[#231F20] border border-[#E0DDD2]">
                            {event.couponCode}
                          </span>
                          <div className="flex items-baseline gap-0.5 leading-none">
                            <span className="text-[10px] font-bold text-[#231F20]">
                              {event.discountValue}
                            </span>
                            <span className="text-[9px] font-bold uppercase text-[#78716C]">
                              {event.discountType}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1">
                          {event.channels?.map((ch, i) => (
                            <span key={i} className="inline-flex items-center gap-0.5 rounded bg-[#F1F0E7] px-1 py-0.2 text-[9px] font-medium text-[#554E4A]">
                              {ch.icon === 'globe' ? <Globe className="h-2.5 w-2.5 text-[#78716C]" /> : <ShoppingBag className="h-2.5 w-2.5 text-[#78716C]" />}
                              {ch.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>

                    <td className="px-2 py-2.5">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-[#78716C] truncate">
                            <strong className="font-bold text-[#231F20]">
                              {event.claimed}/{event.limit}
                            </strong> claimed
                          </span>
                          <span className="font-bold text-[10px] text-[#231F20] shrink-0">
                            {percentage}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E5E3D8]">
                          <div
                            className="h-full rounded-full bg-[#2D1F1D] transition-all duration-300"
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-2.5 text-right">
                      <div className="relative inline-flex items-center justify-end">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setOpenDropdownId(openDropdownId === event.id ? null : event.id)
                          }}
                          className={`rounded-lg p-1.5 transition ${
                            openDropdownId === event.id
                              ? 'bg-[#EAE8DD] text-[#231F20]'
                              : 'text-[#78716C] hover:bg-[#F1F0E4] hover:text-[#2B2422]'
                          }`}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {openDropdownId === event.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className={`absolute right-0 z-50 w-32 rounded-xl border border-[#DBDBCF] bg-[#FDFCF0] p-1 shadow-lg animate-in fade-in zoom-in-95 ${
                              idx >= paginatedEvents.length - 2 && paginatedEvents.length > 2
                                ? 'bottom-full mb-1'
                                : 'top-full mt-1'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setOpenDropdownId(null)
                                setSelectedEvent(event)
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#2B2422] transition hover:bg-[#F1F0E4] text-left"
                            >
                              <Eye className="h-3.5 w-3.5 text-[#78716C]" />
                              <span>View</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setOpenDropdownId(null)
                                handleOpenEdit(event)
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#2B2422] transition hover:bg-[#F1F0E4] text-left"
                            >
                              <Pencil className="h-3.5 w-3.5 text-[#78716C]" />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setOpenDropdownId(null)
                                setDeletingEvent(event)
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 text-left"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {/* PAGINATION FOOTER */}
        <div className="flex flex-col gap-2 border-t border-[#DBDBCF] bg-[#F4F3ED] px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-[#78716C]">
            <p>
              Showing{' '}
              <span className="font-bold text-[#231F20]">
                {startIndex}-{endIndex}
              </span>{' '}
              of <span className="font-bold text-[#231F20]">{filteredEvents.length}</span> events
            </p>


          </div>

          <div className="flex items-center gap-1">
            <span className="text-[11px] text-[#78716C]">
              Page {currentPage} of {totalPages}
            </span>

            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="rounded-md border border-[#DBDBCF] bg-white p-1 text-[#78716C] transition hover:bg-[#EFECE6] disabled:opacity-40"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`h-5 w-5 rounded text-[11px] font-bold transition ${
                  currentPage === page
                    ? 'bg-[#2D1F1D] text-white shadow-xs'
                    : 'border border-[#DBDBCF] bg-white text-[#2B2422] hover:bg-[#EFECE6]'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="rounded-md border border-[#DBDBCF] bg-white p-1 text-[#78716C] transition hover:bg-[#EFECE6] disabled:opacity-40"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}