import api from "./api";

// ============================================
// DASHBOARD
// ============================================

export const getCashierDashboard = async () => {
  const response = await api.get("/cashier/dashboard");
  return response.data;
};

// ============================================
// ORDERS
// ============================================

export const getCashierOrders = async () => {
  const response = await api.get("/cashier/orders");
  return response.data;
};

export const getCashierOrder = async (id) => {
  const response = await api.get(`/cashier/orders/${id}`);
  return response.data;
};

export const createCashierOrder = async (data) => {
  try {
    console.log("========== CREATE CASHIER ORDER ==========");
    console.log("PAYLOAD:", JSON.stringify(data, null, 2));

    const response = await api.post("/cashier/orders", data);

    console.log("CREATE CASHIER ORDER RESPONSE:");
    console.log(response.data);

    return response.data;
  } catch (error) {
    console.error(
      "========== CREATE CASHIER ORDER FAILED =========="
    );

    console.error("STATUS:", error.response?.status);
    console.error(
      "SERVER RESPONSE:",
      error.response?.data
    );
    console.error(
      "VALIDATION ERRORS:",
      error.response?.data?.errors
    );
    console.error("REQUEST PAYLOAD:", data);

    throw error;
  }
};

export const getCashierOrderHistory = async () => {
  const response = await api.get("/cashier/orders/history");
  return response.data;
};

// ============================================
// TABLE SESSIONS
// ============================================

export const getTableSessions = async () => {
  const response = await api.get(
    "/cashier/table-sessions"
  );

  return response.data;
};

export const getTableSession = async (id) => {
  const response = await api.get(
    `/cashier/table-sessions/${id}`
  );

  return response.data;
};

export const createTableSession = async (tableId) => {
  try {
    console.log(
      "========== CREATE TABLE SESSION =========="
    );

    console.log("TABLE ID:", tableId);

    const response = await api.post(
      "/cashier/table-sessions",
      {
        table_id: tableId,
      }
    );

    console.log(
      "CREATE TABLE SESSION RESPONSE:",
      response.data
    );

    return response.data;
  } catch (error) {
    console.error(
      "========== CREATE TABLE SESSION FAILED =========="
    );

    console.error(
      "STATUS:",
      error.response?.status
    );

    console.error(
      "SERVER RESPONSE:",
      error.response?.data
    );

    console.error(
      "VALIDATION ERRORS:",
      error.response?.data?.errors
    );

    throw error;
  }
};

export const updateTableSession = async (
  sessionId,
  status
) => {
  const response = await api.put(
    `/cashier/table-sessions/${sessionId}`,
    {
      status,
    }
  );

  return response.data;
};

// ============================================
// PRODUCTS
// ============================================

export const getCashierProducts = async () => {
  const response = await api.get(
    "/cashier/products"
  );

  return response.data;
};

// ============================================
// CATEGORIES
// ============================================

export const getCustomerCategories = async () => {
  const response = await api.get(
    "/customer/categories"
  );

  return response.data;
};

// ============================================
// TABLES
// ============================================

export const getCashierTables = async () => {
  const response = await api.get(
    "/cashier/tables"
  );

  return response.data;
};

export const getCashierTable = async (id) => {
  const response = await api.get(
    `/cashier/tables/${id}`
  );

  return response.data;
};

// ============================================
// ORDER STATUS
// ============================================

export const updateCashierOrderStatus = async (
  orderId,
  status
) => {
  const response = await api.put(
    `/cashier/orders/${orderId}`,
    {
      status,
    }
  );

  return response.data;
};

// ============================================
// PAYMENT
// ============================================

export const createCashierPayment = async (
  data
) => {
  const response = await api.post(
    "/cashier/payments",
    data
  );

  return response.data;
};