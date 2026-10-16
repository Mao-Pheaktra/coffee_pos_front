import api from "./api";
export const getCustomerPaymentMethods = async () => {
  const response = await api.get("/customer/payment-methods");

  return response.data;
};

export const getCashierPaymentMethods = async () => {
  const response = await api.get("/cashier/payment-methods");

  return response.data;
};

/**
 * Get all payments
 * GET /api/cashier/payments
 */
export const getCashierPayments = async () => {
  const response = await api.get("/cashier/payments");

  return response.data;
};

/**
 * Get payment by ID
 * GET /api/cashier/payments/{id}
 */
export const getCashierPayment = async (id) => {
  const response = await api.get(`/cashier/payments/${id}`);

  return response.data;
};

/**
 * Create payment
 * POST /api/cashier/payments
 */
export const createCashierPayment = async (paymentData) => {
  const response = await api.post(
    "/cashier/payments",
    paymentData
  );

  return response.data;
};

/**
 * Update payment
 * PUT /api/cashier/payments/{id}
 */
export const updateCashierPayment = async (id, paymentData) => {
  const response = await api.put(
    `/cashier/payments/${id}`,
    paymentData
  );

  return response.data;
};

/**
 * Delete payment
 * DELETE /api/cashier/payments/{id}
 */
export const deleteCashierPayment = async (id) => {
  const response = await api.delete(
    `/cashier/payments/${id}`
  );

  return response.data;
};