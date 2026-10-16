import api from './api'

/**
 * Get report summary
 */
export const getReportSummary = async () => {
  const response = await api.get('/admin/reports/summary')
  return response.data
}

/**
 * Get revenue chart
 *
 * period:
 * daily
 * weekly
 * monthly
 */
export const getReportRevenue = async (period = 'daily') => {
  const response = await api.get('/admin/reports/revenue', {
    params: { period },
  })

  return response.data
}

/**
 * Get orders chart
 *
 * period:
 * daily
 * weekly
 * monthly
 */
export const getReportOrders = async (period = 'daily') => {
  const response = await api.get('/admin/reports/orders', {
    params: { period },
  })

  return response.data
}

/**
 * Get payment methods report
 */
export const getReportPayments = async () => {
  const response = await api.get('/admin/reports/payments')
  return response.data
}

/**
 * Get best selling products
 */
export const getReportProducts = async () => {
  const response = await api.get('/admin/reports/products')
  return response.data
}

/**
 * Get category performance
 */
export const getReportCategories = async () => {
  const response = await api.get('/admin/reports/categories')
  return response.data
}

/**
 * Get order source report
 */
export const getReportOrderSources = async () => {
  const response = await api.get('/admin/reports/order_sources')
  return response.data
}