import api from './api'

export const getOrderSettings = async () => {
  const response = await api.get('/admin/settings/orders')
  return response.data
}

export const updateOrderSettings = async (data) => {
  const response = await api.put('/admin/settings/orders', data)
  return response.data
}