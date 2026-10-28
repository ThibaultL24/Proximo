// src/api/auth.ts
import { api, setToken } from "./client";
import type { User } from "../types";

interface LoginResponse {
  token: string;
  user: User;
}

export async function login(email: string, password: string) {
  const { data } = await api.post<LoginResponse>("/auth/login", { email, password });
  setToken(data.token);
  return data.user;
}

interface RegisterInput {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export async function register(input: RegisterInput) {
  const { data } = await api.post<LoginResponse>("/auth/register", { user: input });
  setToken(data.token);
  return data.user;
}

export async function fetchMe() {
  const { data } = await api.get<User>("/auth/me");
  return data;
}

export function logout() {
  setToken(null);
}
