import api from "./api";

export const createCustomerOrder = async (data) => {
  const response = await api.post("/customer/orders", data);
  return response.data;
};


export const getCustomerOrders = async () => {
  const response = await api.get("/customer/orders");
  return response.data;
};


export const getCustomerOrder = async (id) => {
  const response = await api.get(`/customer/orders/${id}`);
  return response.data;
};

export const cancelCustomerOrder = async (id) => {
  const response = await api.patch(`/customer/orders/${id}/cancel`);
  return response.data;
};


export const createCustomerPayment = async (data) => {
  const response = await api.post("/customer/payments", data);
  return response.data;
};  