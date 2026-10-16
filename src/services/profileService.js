import api from './api'

export const getProfile = async () => {
  const response = await api.get('/customer/profile')

  return response.data
}

export const getCashierProfile = async () => {
  const response = await api.get('/cashier/profile')

  return response.data
}