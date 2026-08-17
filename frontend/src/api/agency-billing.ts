// src/api/agency-billing.ts
import { api } from "./client";
import type { AgencySubscriptionStatus, BillingInvoice } from "../types";

export async function fetchAgencySubscription() {
  const { data } = await api.get<AgencySubscriptionStatus>("/admin/billing");
  return data;
}

export async function createAgencySubscriptionCheckout() {
  const { data } = await api.post<{ url: string }>("/admin/billing");
  return data.url;
}

export async function openAgencyBillingPortal() {
  const { data } = await api.get<{ url: string }>("/admin/billing/portal");
  return data.url;
}

export async function fetchAgencyInvoices() {
  const { data } = await api.get<{ invoices: BillingInvoice[] }>("/admin/billing/invoices");
  return data.invoices;
}
