import api from './api'

// Get event settings
export const getEventSettings = async () => {
  const response = await api.get('/admin/event-settings')
  return response.data
}

// Update event settings
export const updateEventSettings = async (settings) => {
  const response = await api.put('/admin/event-settings', settings)
  return response.data
}