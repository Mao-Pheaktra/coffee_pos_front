import api from './api'

// Get all events
export const getEvents = async () => {
  const response = await api.get('/admin/events')
  return response.data
}

// Get currently active events
export const getActiveEvents = async () => {
  const response = await api.get('/admin/events/active')
  return response.data
}

// Get one event
export const getEventById = async (eventId) => {
  const response = await api.get(`/admin/events/${eventId}`)
  return response.data
}

// Create event
export const createEvent = async (eventData) => {
  const response = await api.post('/admin/events', eventData)
  return response.data
}

// Update event
export const updateEvent = async (eventId, eventData) => {
  const response = await api.put(`/admin/events/${eventId}`, eventData)
  return response.data
}

// Delete event
export const deleteEvent = async (eventId) => {
  const response = await api.delete(`/admin/events/${eventId}`)
  return response.data
}

// Create coupon for an event
export const createEventCoupon = async (eventId, couponData) => {
  const response = await api.post(
    `/admin/events/${eventId}/coupon`,
    couponData
  )

  return response.data
}

// Update coupon
export const updateCoupon = async (couponId, couponData) => {
  const response = await api.put(
    `/admin/coupons/${couponId}`,
    couponData
  )

  return response.data
}

// Delete coupon
export const deleteCoupon = async (couponId) => {
  const response = await api.delete(
    `/admin/coupons/${couponId}`
  )

  return response.data
}