import { apiClient } from "@/services/api";
import { endpoints } from "@/services/endpoints";

function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value !== null && value !== undefined),
  );
}

export async function getDashboard() {
  const { data } = await apiClient.get(endpoints.analytics.dashboard);
  return data;
}

export async function getAnalyticsCharts() {
  const { data } = await apiClient.get(endpoints.analytics.charts);
  return data;
}

export async function getInsights() {
  const { data } = await apiClient.get(endpoints.insights);
  return data;
}

export async function getTransactions(params) {
  const { data } = await apiClient.get(endpoints.transactions, {
    params: cleanParams(params),
  });
  return data;
}

export async function createTransaction(payload) {
  const { data } = await apiClient.post(endpoints.transactions, payload);
  return data;
}

export async function updateTransaction(id, payload) {
  const { data } = await apiClient.put(`${endpoints.transactions}/${id}`, payload);
  return data;
}

export async function deleteTransaction(id) {
  const { data } = await apiClient.delete(`${endpoints.transactions}/${id}`);
  return data;
}

export async function getBudgets(params) {
  const { data } = await apiClient.get(endpoints.budgets, {
    params: cleanParams(params),
  });
  return data;
}

export async function createBudget(payload) {
  const { data } = await apiClient.post(endpoints.budgets, payload);
  return data;
}

export async function updateBudget(id, payload) {
  const { data } = await apiClient.put(`${endpoints.budgets}/${id}`, payload);
  return data;
}

export async function deleteBudget(id) {
  const { data } = await apiClient.delete(`${endpoints.budgets}/${id}`);
  return data;
}

export async function getProfile() {
  const { data } = await apiClient.get(endpoints.profile);
  return data.user;
}

export async function updateProfile(payload) {
  const { data } = await apiClient.patch(endpoints.profile, payload);
  return data.user;
}

