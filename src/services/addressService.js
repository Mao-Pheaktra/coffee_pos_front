import api from "./api";

export const getCustomerAddresses = async () => {
  const response = await api.get("/customer/addresses");
  return response.data;
};

export const createCustomerAddress = async (data) => {
  const response = await api.post("/customer/addresses", data);
  return response.data;
};

export const updateCustomerAddress = async (id, data) => {
  const response = await api.put(`/customer/addresses/${id}`, data);
  return response.data;
};

export const deleteCustomerAddress = async (id) => {
  const response = await api.delete(`/customer/addresses/${id}`);
  return response.data;
};