import api from './api'

export const getAdminOrders = async (params = {}) => {
  const response = await api.get('/admin/orders', {
    params,
  })

  return response.data
}

export const getAdminOrder = async (id) => {
  const response = await api.get(`/admin/orders/${id}`)

  return response.data
}

export const createAdminOrder = async (data) => {
  const response = await api.post('/admin/orders', data)

  return response.data
}

export const updateAdminOrder = async (id, data) => {
  const response = await api.put(
    `/admin/orders/${id}`,
    data
  )

  return response.data
}

export const deleteAdminOrder = async (id) => {
  const response = await api.delete(
    `/admin/orders/${id}`
  )

  return response.data
}