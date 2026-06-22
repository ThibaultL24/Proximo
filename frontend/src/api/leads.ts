// src/api/leads.ts
import { api } from "./client";
import type { Lead, LeadInput } from "../types";

export async function fetchMerchantLeads() {
  const { data } = await api.get<Lead[]>("/merchant/leads");
  return data;
}

export async function createMerchantLead(lead: LeadInput) {
  const { data } = await api.post<Lead>("/merchant/leads", { lead });
  return data;
}

export async function fetchAdminLeads(status?: string) {
  const { data } = await api.get<Lead[]>("/admin/leads", {
    params: status ? { status } : undefined,
  });
  return data;
}

export async function qualifyLead(id: number) {
  const { data } = await api.patch<Lead>(`/admin/leads/${id}/qualify`);
  return data;
}

export async function rejectLead(id: number, reason: string) {
  const { data } = await api.patch<Lead>(`/admin/leads/${id}/reject`, { reason });
  return data;
}

export async function convertLead(id: number, amount_cents?: number) {
  const { data } = await api.patch<Lead>(`/admin/leads/${id}/convert`, { amount_cents });
  return data;
}
