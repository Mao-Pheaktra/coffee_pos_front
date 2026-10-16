import api from './api'

export const getAdminTableSummary = async () => {
  const response = await api.get('/admin/cafe-tables/summary')
  return response.data
}

export const getAdminTables = async ({
  page = 1,
  perPage = 10,
  search = '',
  status = '',
} = {}) => {
  const params = {
    page,
    per_page: perPage,
  }

  if (search) {
    params.search = search
  }

  if (status) {
    params.status = status
  }

  const response = await api.get('/admin/cafe-tables', {
    params,
  })

  return response.data
}

export const getAdminTable = async (id) => {
  const response = await api.get(`/admin/cafe-tables/${id}`)
  return response.data
}

export const createAdminTable = async (data) => {
  const response = await api.post('/admin/cafe-tables', data)
  return response.data
}

export const updateAdminTable = async (id, data) => {
  const response = await api.put(`/admin/cafe-tables/${id}`, data)
  return response.data
}

export const deleteAdminTable = async (id) => {
  const response = await api.delete(`/admin/cafe-tables/${id}`)
  return response.data
}