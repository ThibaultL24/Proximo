// src/api/client-leads.ts
import { api } from "./client";
import type { ClientLeadInput, Lead } from "../types";

export async function fetchClientLeads() {
  const { data } = await api.get<Lead[]>("/client/leads");
  return data;
}

export async function createClientLead(lead: ClientLeadInput, merchantSlug?: string) {
  const { data } = await api.post<Lead>(
    "/client/leads",
    { lead },
    { params: merchantSlug ? { merchant_slug: merchantSlug } : undefined }
  );
  return data;
}
