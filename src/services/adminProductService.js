import api from './api'

export const getAdminProductSummary = async () => {
  const response = await api.get('/admin/products/summary')
  return response.data
}

export const getAdminProducts = async ({
  page = 1,
  perPage = 10,
  search = '',
  categoryId = '',
} = {}) => {
  const params = {
    page,
    per_page: perPage,
  }

  if (search) {
    params.search = search
  }

  if (categoryId) {
    params.category_id = categoryId
  }

  const response = await api.get('/admin/products', {
    params,
  })

  return response.data
}

export const getAdminProduct = async (id) => {
  const response = await api.get(`/admin/products/${id}`)
  return response.data
}


// ======================================================
// CREATE PRODUCT
// ======================================================

export const createAdminProduct = async (data) => {
  const formData = new FormData()

  formData.append('category_id', data.category_id)
  formData.append('name', data.name)
  formData.append('description', data.description || '')
  formData.append('price', data.price)
  formData.append('status', data.status || 'AVAILABLE')

  if (data.image instanceof File) {
    formData.append('image', data.image)
  }

  console.log('========== CREATE PRODUCT ==========')

  for (const [key, value] of formData.entries()) {
    console.log(
      key,
      value instanceof File
        ? `FILE: ${value.name} | ${value.type} | ${value.size} bytes`
        : value
    )
  }

  console.log('====================================')

  const response = await api.post(
    '/admin/products',
    formData
  )

  return response.data
}


// ======================================================
// UPDATE PRODUCT
// ======================================================

export const updateAdminProduct = async (id, data) => {
  const formData = new FormData()

  // Laravel method spoofing
  formData.append('_method', 'PUT')

  if (data.category_id !== undefined && data.category_id !== null) {
    formData.append(
      'category_id',
      String(data.category_id)
    )
  }

  if (data.name !== undefined && data.name !== null) {
    formData.append(
      'name',
      String(data.name)
    )
  }

  if (data.description !== undefined && data.description !== null) {
    formData.append(
      'description',
      String(data.description)
    )
  }

  if (data.price !== undefined && data.price !== null) {
    formData.append(
      'price',
      String(data.price)
    )
  }

  if (data.status !== undefined && data.status !== null) {
    formData.append(
      'status',
      String(data.status)
    )
  }

  // ONLY append image if it is actually a File
  if (data.image instanceof File) {
    formData.append(
      'image',
      data.image,
      data.image.name
    )
  }

  // Debug
  console.log('========== UPDATE PRODUCT ==========')
  console.log('PRODUCT ID:', id)
  console.log('IS FORMDATA:', formData instanceof FormData)

  for (const [key, value] of formData.entries()) {
    console.log(
      'FORM DATA:',
      key,
      value instanceof File
        ? `FILE: ${value.name} | type=${value.type} | size=${value.size}`
        : value
    )
  }

  console.log('====================================')

  const response = await api.post(
    `/admin/products/${id}`,
    formData
  )

  return response.data
}


// ======================================================
// DELETE PRODUCT
// ======================================================

export const deleteAdminProduct = async (id) => {
  const response = await api.delete(
    `/admin/products/${id}`
  )

  return response.data
}