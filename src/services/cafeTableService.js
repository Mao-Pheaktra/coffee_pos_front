import api from './api'

export const getAdminCafeTables = async () => {
  const response = await api.get('/admin/cafe-tables')
  return response.data
}

export const getAdminCafeTable = async (id) => {
  const response = await api.get(`/admin/cafe-tables/${id}`)
  return response.data
}