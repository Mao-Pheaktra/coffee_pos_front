import api from './api'

export const getAdminCategorySummary = async () => {
  const response = await api.get('/admin/categories/summary')
  return response.data
}

export const getAdminCategories = async ({
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

  const response = await api.get('/admin/categories', {
    params,
  })

  return response.data
}

export const getAdminCategory = async (id) => {
  const response = await api.get(`/admin/categories/${id}`)
  return response.data
}

export const createAdminCategory = async (data) => {
  const response = await api.post('/admin/categories', data)
  return response.data
}

export const updateAdminCategory = async (id, data) => {
  const response = await api.put(`/admin/categories/${id}`, data)
  return response.data
}

export const deleteAdminCategory = async (id) => {
  const response = await api.delete(`/admin/categories/${id}`)
  return response.data
}