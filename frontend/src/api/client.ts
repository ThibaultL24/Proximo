// src/api/client.ts
import axios from "axios";

const TOKEN_KEY = "proximmo_token";
export const API_ROOT = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") || "";

export const api = axios.create({
  baseURL: `${API_ROOT}/api/v1`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;

  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      if (!window.location.pathname.startsWith("/connexion")) {
        window.location.href = "/connexion";
      }
    }
    return Promise.reject(error);
  }
);

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
