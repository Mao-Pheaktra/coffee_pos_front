import api from "./api";

export const getCustomerProducts = async () => {
  const response = await api.get("/customer/products");

  return response.data;
};

export const getCustomerProduct = async (id) => {
  const response = await api.get(`/customer/products/${id}`);

  return response.data;
};

