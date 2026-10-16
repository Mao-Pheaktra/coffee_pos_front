import api from './api'

export const getCustomerTable = async (tableNumber) => {
  const response = await api.get(
    `/customer/tables/${tableNumber}`
  )

  return response.data
}

export const getCustomerTableOrders = async (sessionCode) => {
  const response = await api.get(
    `/customer/tables/session/${sessionCode}/orders`
  )

  return response.data
}

export const createCustomerTableOrder = async (payload) => {
  const response = await api.post(
    `/customer/tables/orders`,
    payload
  )

  return response.data
}

export const cancelCustomerOrder = async (orderId, sessionCode) => {
  const response = await api.patch(
    `/customer/tables/orders/${orderId}/cancel`,
    {
      session_code: sessionCode,
    }
  )

  return response.data
}