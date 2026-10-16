import api from "./api";

// Register customer
export const register = async (data) => {
  const response = await api.post("/register", data);
  return response.data;
};

// Verify registration OTP
export const verifyOtp = async (data) => {
  const response = await api.post("/verifyOtp", data);
  return response.data;
};

// Login customer
export const login = async (data) => {
  const response = await api.post("/login", data);
  return response.data;
};

// Logout
export const logout = async () => {
  const response = await api.post("/logout");
  return response.data;
};

// Change password - logged-in user
export const changePassword = async (data) => {
  const response = await api.put("/change_password", data);
  return response.data;
};

// Forgot password - send reset LINK
export const forgotPassword = async (data) => {
  const response = await api.post("/forgot-password", data);
  return response.data;
};

// Reset password - using reset LINK
export const resetPassword = async (data) => {
  const response = await api.post("/reset-password", data);
  return response.data;
};

export const loginWithGoogle = () => {
  window.location.href = 'http://localhost:8000/api/auth/google';
};