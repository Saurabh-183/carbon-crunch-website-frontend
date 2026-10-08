/**
 * API Utility for CarbonOS Frontend
 * Centralized API configuration with automatic token handling
 */
import axios from "axios";
import Cookies from "js-cookie";
import { resolveBaseUrl } from "./baseUrl";

const resolveApiBaseUrl = () => resolveBaseUrl();

axios.defaults.baseURL = resolveApiBaseUrl();

// Create axios instance with default config
const api = axios.create({
  baseURL: axios.defaults.baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    const requestUrl = originalRequest?.url || "";
    const isAuthEndpoint = requestUrl.includes("/api/auth/login") || requestUrl.includes("/api/auth/refresh") || requestUrl.includes("/api/auth/logout");

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get("refreshToken");

        // Try to refresh the token (uses httpOnly cookie if available)
        const response = await api.post("/api/auth/refresh", refreshToken ? { refreshToken } : {});

        if (response.data.success) {
          const newAccessToken = response.data.data.accessToken;

          // Update the token in cookies
          Cookies.set("accessToken", newAccessToken, { expires: 1 });

          // Update the authorization header
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        const status = refreshError.response?.status;
        if (status && status !== 401 && status !== 403) {
          // Don't force logout for non-auth errors (e.g., 404 from misrouted refresh)
          return Promise.reject(refreshError);
        }

        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        Cookies.remove("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// Auth API calls
export const authAPI = {
  login: (username, password, organizationId) => api.post("/api/auth/login", { username, password, organizationId }),

  loginPlatformAdmin: (email, password) => api.post("/api/auth/login", { email, password, role: "PLATFORM_ADMIN" }),

  loginGodMode: (email, password) => api.post("/api/auth/login", { email, password, role: "GOD_MODE" }),

  loginMaintainer: (email, password) => api.post("/api/auth/login", { email, password, role: "MAINTAINER" }),

  logout: () => api.post("/api/auth/logout"),

  register: (data) => api.post("/api/auth/register", data),

  verifyToken: () => api.get("/api/auth/verify"),

  refreshToken: (refreshToken) => api.post("/api/auth/refresh", { refreshToken }),

  changePassword: (currentPassword, newPassword) => api.post("/api/auth/change-password", { currentPassword, newPassword }),

  getSessions: () => api.get("/api/auth/sessions"),

  revokeSession: (sessionId) => api.delete(`/api/auth/sessions/${sessionId}`),

  revokeAllSessions: () => api.delete("/api/auth/sessions"),
};

// Facility API calls
export const facilityAPI = {
  getAll: () => api.get("/api/facilities"),
  getById: (id) => api.get(`/api/facilities/${id}`),
  create: (data) => api.post("/api/facilities", data),
  update: (id, data) => api.put(`/api/facilities/${id}`, data),
  delete: (id) => api.delete(`/api/facilities/${id}`),
};

// Report API calls
export const reportAPI = {
  getAll: () => api.get("/api/reports"),
  getById: (id) => api.get(`/api/reports/${id}`),
  create: (data) => api.post("/api/reports", data),
  update: (id, data) => api.put(`/api/reports/${id}`, data),
  delete: (id) => api.delete(`/api/reports/${id}`),
};

// Asset API calls
export const assetAPI = {
  getAll: (params) => api.get("/api/assets", { params }),
  getById: (id) => api.get(`/api/assets/${id}`),
  create: (data) => api.post("/api/assets", data),
  update: (id, data) => api.put(`/api/assets/${id}`, data),
  delete: (id) => api.delete(`/api/assets/${id}`),
  getMeta: () => api.get("/api/assets/meta"),
};

// Infrastructure Layout API calls
export const infraLayoutAPI = {
  getAll: (params) => api.get("/api/infra-layouts", { params }),
  getById: (id) => api.get(`/api/infra-layouts/${id}`),
  create: (data) => api.post("/api/infra-layouts", data),
  update: (id, data) => api.put(`/api/infra-layouts/${id}`, data),
  delete: (id) => api.delete(`/api/infra-layouts/${id}`),
  getEntities: (params) => api.get("/api/infra-layouts/entities", { params }),
};

// ─── CBAM API calls ─────────────────────────────────────────────────────────
export const cbamAPI = {
  // CN Code lookups
  searchCnCodes: (params) => api.get("/api/cbam/cn-codes", { params }),
  getCnCodeCategories: () => api.get("/api/cbam/cn-codes/categories"),
  getCnCodeDetails: (cnCode) => api.get(`/api/cbam/cn-codes/${cnCode}`),
  getSupplyChain: (params) => api.get("/api/cbam/supply-chain", { params }),

  // Products
  getProducts: (params) => api.get("/api/cbam/products", { params }),
  getProductQuantities: (params) => api.get("/api/cbam/product-quantities", { params }),
  createProduct: (data) => api.post("/api/cbam/products", data),
  updateProduct: (id, data) => api.put(`/api/cbam/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/api/cbam/products/${id}`),
  sendSupplierMail: (id, supplierId) => api.post(`/api/cbam/products/${id}/send-supplier-mail`, { supplierId }),

  // CBAM Installations
  getInstallations: (params) => api.get("/api/cbam/installations", { params }),
  createInstallation: (data) => api.post("/api/cbam/installations", data),
  updateInstallation: (id, data) => api.put(`/api/cbam/installations/${id}`, data),
  deleteInstallation: (id) => api.delete(`/api/cbam/installations/${id}`),

  // Production Processes
  getProductionProcesses: (params) => api.get("/api/cbam/production-processes", { params }),
  createProductionProcess: (data) => api.post("/api/cbam/production-processes", data),
  updateProductionProcess: (id, data) => api.put(`/api/cbam/production-processes/${id}`, data),
  deleteProductionProcess: (id) => api.delete(`/api/cbam/production-processes/${id}`),

  // Production Records
  getProductionRecords: (params) => api.get("/api/cbam/production-records", { params }),
  getProductionRecordById: (id) => api.get(`/api/cbam/production-records/${id}`),
  createProductionRecord: (data) => api.post("/api/cbam/production-records", data),
  updateProductionRecord: (id, data) => api.put(`/api/cbam/production-records/${id}`, data),
  deleteProductionRecord: (id) => api.delete(`/api/cbam/production-records/${id}`),
  submitProductionRecord: (id) => api.patch(`/api/cbam/production-records/${id}/submit`),
  approveProductionRecord: (id) => api.patch(`/api/cbam/production-records/${id}/approve`),
  rejectProductionRecord: (id, reason) => api.patch(`/api/cbam/production-records/${id}/reject`, { reason }),

  // Summary / Dashboard
  getSummary: (params) => api.get("/api/cbam/summary", { params }),
};

// Health check
export const healthCheck = () => api.get("/api/health");

export default api;
