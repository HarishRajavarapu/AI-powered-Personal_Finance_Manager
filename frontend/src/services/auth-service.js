import { apiClient, clearAuthToken, saveAuthToken } from "@/services/api";
import { endpoints } from "@/services/endpoints";

export async function signup(payload) {
  const { data } = await apiClient.post(endpoints.auth.signup, payload);
  saveAuthToken(data.access_token);
  return data.user;
}

export async function login(payload) {
  const { data } = await apiClient.post(endpoints.auth.login, payload);
  saveAuthToken(data.access_token);
  return data.user;
}

export async function getCurrentUser() {
  const { data } = await apiClient.get(endpoints.auth.me);
  return data;
}

export async function logout() {
  try {
    await apiClient.post(endpoints.auth.logout);
  } finally {
    clearAuthToken();
  }
}

