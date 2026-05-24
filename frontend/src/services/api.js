import axios from "axios";

const LOCAL_API_BASE_URL = "http://127.0.0.1:8000/api/v1";
const PRODUCTION_API_BASE_URL = "https://ai-powered-personal-finance-manager.onrender.com/api/v1";
const CONFIGURED_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = CONFIGURED_API_BASE_URL || (import.meta.env.DEV ? LOCAL_API_BASE_URL : PRODUCTION_API_BASE_URL);

const TOKEN_STORAGE_KEY = "finance-auth-token";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.detail ||
      error.message ||
      "Something went wrong.";

    return Promise.reject({
      ...error,
      message,
      status: error.response?.status,
    });
  },
);

export function saveAuthToken(token) {
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearAuthToken() {
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function getAuthToken() {
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}
