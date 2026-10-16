import api from "./api";

export const getDashboardRevenue = async () => {
  const response = await api.get("/admin/dashboard/metrics/revenue");
  return response.data;
};

export const getDashboardOrders = async () => {
  const response = await api.get("/admin/dashboard/metrics/orders");
  return response.data;
};

export const getDashboardTables = async () => {
  const response = await api.get("/admin/dashboard/metrics/tables");
  return response.data;
};

export const getDashboardRevenueChart = async (period = "weekly") => {
  const response = await api.get("/admin/dashboard/revenue-chart", {
    params: { period },
  });
  return response.data;
};

export const getDashboardPopularProducts = async () => {
  const response = await api.get(
    "/admin/dashboard/popular-products"
  );
  return response.data;
};

export const getDashboardRecentOrders = async () => {
  const response = await api.get(
    "/admin/dashboard/recent-orders"
  );
  return response.data;
};

// ===============================
// USER DASHBOARD
// ===============================

export const getUserSummary = async () => {
  const response = await api.get('/admin/users/summary')
  return response.data
}

export const getAdminUsers = async () => {
  const response = await api.get('/admin/users')
  return response.data
}

export const deleteAdminUser = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

export const createAdminUser = async (formData) => {
  const response = await api.post("/admin/users", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
export const getAdminProfile = async () => {
  const response = await api.get("/admin/profile");
  return response.data;
};