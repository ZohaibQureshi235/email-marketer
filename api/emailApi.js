// api/emailApi.js
import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get("UserToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const emailApi = {
  // Get contacts with pagination and search
  getContacts: async (params = {}) => {
    const response = await api.get("/email/contacts", { params });
    return response.data;
  },

  // Get email sending limits
  getLimits: async () => {
    const response = await api.get("/email/limits");
    return response.data;
  },

  // Send bulk email
  sendBulkEmail: async (data) => {
    const response = await api.post("/email/send", data);
    return response.data;
  },

  // Send test email
  sendTestEmail: async (data) => {
    const response = await api.post("/email/test", data);
    return response.data;
  },

  // Get sent email history
  getHistory: async (params = {}) => {
    const response = await api.get("/email/history", { params });
    return response.data;
  },

  // Get email analytics
  getAnalytics: async (params = {}) => {
    const response = await api.get("/email/analytics", { params });
    return response.data;
  },

  getUserSmtpSettings: async () => {
    const response = await axios.get(`${API_BASE}/email/smtp-settings`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  },
};

export default api;
