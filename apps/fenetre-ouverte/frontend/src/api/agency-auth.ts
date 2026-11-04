// src/api/agency-auth.ts
import { api, setToken } from "./client";
import type { User } from "../types";

interface AgencyRegisterInput {
  agency_name: string;
  city?: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

interface AgencyRegisterResponse {
  token: string;
  user: User;
  agency: { id: number; name: string; slug: string };
}

export async function registerAgency(input: AgencyRegisterInput) {
  const { data } = await api.post<AgencyRegisterResponse>("/auth/agency_register", { agency: input });
  setToken(data.token);
  return data;
}
