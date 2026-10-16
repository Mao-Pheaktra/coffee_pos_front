import api from './api'

export const getAdminPayments = async () => {
  const response = await api.get('/admin/payments')
  return response.data
}

export const getAdminPaymentSummary = async () => {
  const response = await api.get('/admin/payments/summary')
  return response.data
}

export const getAdminPayment = async (id) => {
  const response = await api.get(`/admin/payments/${id}`)
  return response.data
}

export const updateAdminPayment = async (id, data) => {
  const response = await api.put(`/admin/payments/${id}`, data)
  return response.data
}

export const deleteAdminPayment = async (id) => {
  const response = await api.delete(`/admin/payments/${id}`)
  return response.data
}