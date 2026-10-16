import api from './api'

export const getCustomerTable = async (tableNumber) => {
  const response = await api.get(
    `/customer/tables/${encodeURIComponent(tableNumber)}`
  )

  return response.data
}

export const getCustomerTableOrders = async (sessionCode) => {
  const response = await api.get(
    `/customer/tables/session/${encodeURIComponent(sessionCode)}/orders`
  )

  return response.data
}