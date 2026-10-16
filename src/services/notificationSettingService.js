import api from './api'

export const getNotificationSettings = async () => {
  const response = await api.get('/admin/settings/notifications')
  return response.data
}

export const updateNotificationSettings = async (data) => {
  const response = await api.put('/admin/settings/notifications', data)
  return response.data
}