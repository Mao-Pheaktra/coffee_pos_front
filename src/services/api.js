import axios from "axios";

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    Accept: 'application/json',
  },
});

const PUBLIC_ENDPOINTS = [
  "/login",
  "/register",
  "/verifyotp",
  "/verify-otp",
  "/forgot-password",
  "/reset-password",
];

// Always get the CURRENT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const requestUrl = config.url?.toLowerCase() || "";

    const isPublicRoute = PUBLIC_ENDPOINTS.some((path) =>
      requestUrl.includes(path)
    );

    if (token && !isPublicRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // IMPORTANT:
    // Let Axios/browser set multipart/form-data automatically
    // when sending FormData.
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle expired/invalid token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest =
      error.config?.url?.toLowerCase().includes("/login");

    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;