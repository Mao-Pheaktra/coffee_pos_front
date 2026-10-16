import api from "./api";

export const getPaymentSettings = async () => {
  const response = await api.get("/admin/settings/payments");
  return response.data;
};

export const updatePaymentSettings = async (data) => {
  const response = await api.put(
    "/admin/settings/payments",
    data
  );

  return response.data;
};