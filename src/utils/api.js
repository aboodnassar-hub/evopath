import { API_BASE_URL } from './constants';

export function getAuthToken() {
  return localStorage.getItem("token");
}

export async function apiRequest(path, { token, headers = {}, body, ...options } = {}) {
  const requestHeaders = { ...headers };
  const requestOptions = { ...options, headers: requestHeaders };

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  if (body !== undefined) {
    requestHeaders["Content-Type"] = requestHeaders["Content-Type"] || "application/json";
    requestOptions.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, requestOptions);
  const data = await response.json();

  return { response, data };
}
