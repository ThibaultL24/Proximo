// src/api/client-leads.ts
import { api } from "./client";
import type { Lead } from "../types";

export async function fetchClientLeads() {
  const { data } = await api.get<Lead[]>("/client/leads");
  return data;
}
